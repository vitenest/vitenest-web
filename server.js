import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
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

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `icon-${crypto.randomUUID()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only image files allowed'));
  }
});

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/uploads', express.static(UPLOADS_DIR));

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

// ── File Upload Route ────────────────────────────────────────────────────────
app.post('/api/admin/upload', requireAuth, upload.single('icon'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
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
  const { name, description, section, categoryId, isFeatured, link, icon } = req.body;
  if (!name || !section || !link) return res.status(400).json({ error: 'Name, section, and link required' });

  const db = readData();
  const newApp = {
    id: crypto.randomUUID(),
    name,
    description: description || '',
    section,
    categoryId: categoryId || null,
    isFeatured: !!isFeatured,
    link,
    icon: icon || 'FileText', // Default generic icon
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

// ── SPA Fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on 0.0.0.0:${PORT}`);
});
