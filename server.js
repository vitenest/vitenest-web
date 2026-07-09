import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-set-in-env';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const DATA_FILE = path.join(__dirname, 'data.json');

// Helper to read data
function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { categories: [], apps: [] };
  }
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading data.json:", err);
    return { categories: [], apps: [] };
  }
}

// Helper to write data
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error writing data.json:", err);
  }
}

// Ensure data file exists with default structure
if (!fs.existsSync(DATA_FILE)) {
  writeData({ categories: [], apps: [] });
}

// In-memory user store (seeded with the default admin from env)
const users = [
  {
    id: '1',
    name: 'Administrator',
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
];

// ── Cloudflare R2 Setup ─────────────────────────────────────────────────────
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, ''); // e.g. https://pub-xxx.r2.dev

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// Multer memory storage (no local disk write)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only image files are allowed'));
  },
});

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// JWT auth middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.slice(7);
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── File Upload Route (Cloudflare R2) ────────────────────────────────────────
app.post('/api/admin/upload', requireAuth, upload.single('icon'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  if (!R2_ACCOUNT_ID || !R2_BUCKET_NAME) {
    return res.status(500).json({ error: 'R2 storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL in your environment.' });
  }
  try {
    const ext = req.file.originalname.split('.').pop();
    const key = `icons/icon-${crypto.randomUUID()}.${ext}`;

    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    const publicUrl = `${R2_PUBLIC_URL}/${key}`;
    res.json({ url: publicUrl });
  } catch (err) {
    console.error('R2 upload error:', err);
    res.status(500).json({ error: 'Upload to R2 failed: ' + err.message });
  }
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, username });
});

app.get('/api/admin/users', requireAuth, (req, res) => {
  const safeUsers = users.map(({ password: _pw, ...u }) => u);
  res.json(safeUsers);
});

app.post('/api/admin/users', requireAuth, (req, res) => {
  const { name, username, password, role } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ error: 'name, username, and password are required' });
  }
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'Username already exists' });
  }
  const newUser = {
    id: crypto.randomUUID(),
    name,
    username,
    password,
    role: role || 'editor',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  const { password: _pw, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

app.delete('/api/admin/users/:id', requireAuth, (req, res) => {
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  if (users[idx].username === ADMIN_USERNAME) {
    return res.status(403).json({ error: 'Cannot delete the default admin' });
  }
  users.splice(idx, 1);
  res.json({ success: true });
});

app.get('/api/admin/stats', requireAuth, (req, res) => {
  const db = readData();
  res.json({
    totalUsers: users.length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    editorUsers: users.filter(u => u.role === 'editor').length,
    totalApps: db.apps.length,
    totalCategories: db.categories.length
  });
});

// ── Public App/Category Routes ───────────────────────────────────────────────

app.get('/api/categories', (req, res) => {
  const db = readData();
  res.json(db.categories);
});

app.get('/api/apps', (req, res) => {
  const db = readData();
  let apps = db.apps;
  
  if (req.query.featured === 'true') {
    apps = apps.filter(a => a.isFeatured);
  }
  if (req.query.section) {
    apps = apps.filter(a => a.section === req.query.section);
  }
  if (req.query.categoryId) {
    apps = apps.filter(a => a.categoryId === req.query.categoryId);
  }
  
  res.json(apps);
});

// ── Protected Admin App/Category Routes ──────────────────────────────────────

// Categories CRUD
app.post('/api/admin/categories', requireAuth, (req, res) => {
  const { name, section } = req.body;
  if (!name || !section) return res.status(400).json({ error: 'Name and section required' });
  
  const db = readData();
  const newCat = {
    id: crypto.randomUUID(),
    name,
    section
  };
  db.categories.push(newCat);
  writeData(db);
  res.status(201).json(newCat);
});

app.delete('/api/admin/categories/:id', requireAuth, (req, res) => {
  const db = readData();
  db.categories = db.categories.filter(c => c.id !== req.params.id);
  // Also remove apps associated? Or let user handle it.
  writeData(db);
  res.json({ success: true });
});

// Apps CRUD
app.post('/api/admin/apps', requireAuth, (req, res) => {
  const { name, description, section, categoryId, isFeatured, link, icon, appSlug, hasLegal, termsOfService, privacyPolicy, images } = req.body;
  if (!name || !section || !link) return res.status(400).json({ error: 'Name, section, and link required' });

  const db = readData();
  
  // Generate safe slug
  let slug = appSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  if (!slug) {
    slug = 'app-' + crypto.randomUUID().slice(0, 8);
  }
  
  // Ensure unique slug
  let existing = db.apps.find(a => a.appSlug === slug);
  let count = 1;
  let originalSlug = slug;
  while (existing) {
    slug = `${originalSlug}-${count}`;
    existing = db.apps.find(a => a.appSlug === slug);
    count++;
  }

  const newApp = {
    id: crypto.randomUUID(),
    name,
    description: description || '',
    section,
    categoryId: categoryId || null,
    isFeatured: !!isFeatured,
    link,
    icon: icon || 'FileText',
    appSlug: slug,
    hasLegal: !!hasLegal,
    termsOfService: hasLegal ? termsOfService : null,
    privacyPolicy: hasLegal ? privacyPolicy : null,
    images: images || [],
    createdAt: new Date().toISOString()
  };
  
  db.apps.push(newApp);
  writeData(db);
  res.status(201).json(newApp);
});

app.delete('/api/admin/apps/:id', requireAuth, (req, res) => {
  const db = readData();
  db.apps = db.apps.filter(a => a.id !== req.params.id);
  writeData(db);
  res.json({ success: true });
});

// Get single app by slug
app.get('/api/apps/:appSlug', (req, res) => {
  const db = readData();
  const app = db.apps.find(a => a.appSlug === req.params.appSlug);
  if (!app) return res.status(404).json({ error: 'App not found' });
  res.json(app);
});

// ── SPA Fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on 0.0.0.0:${PORT}`);
});
