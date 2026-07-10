import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import multer from 'multer';
import pg from 'pg';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-set-in-env';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// ── PostgreSQL Setup ──────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : process.env.NODE_ENV === 'production' && process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')
      ? { rejectUnauthorized: false }
      : false,
});

// Initialize database tables
async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        section TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS apps (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        section TEXT NOT NULL,
        category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
        is_featured BOOLEAN DEFAULT FALSE,
        link TEXT NOT NULL,
        icon TEXT DEFAULT 'FileText',
        app_slug TEXT UNIQUE,
        has_legal BOOLEAN DEFAULT FALSE,
        terms_of_service JSONB,
        privacy_policy JSONB,
        images JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Database tables initialized');
  } catch (err) {
    console.error('❌ Database init error:', err);
    throw err;
  } finally {
    client.release();
  }
}

// ── Cloudflare R2 Setup ──────────────────────────────────────────────────────
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only image files are allowed'));
  },
});

// ── In-Memory Users (unchanged) ───────────────────────────────────────────────
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

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

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

// Helper: map DB row to app object
function rowToApp(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    section: row.section,
    categoryId: row.category_id,
    isFeatured: row.is_featured,
    link: row.link,
    icon: row.icon,
    appSlug: row.app_slug,
    hasLegal: row.has_legal,
    termsOfService: row.terms_of_service,
    privacyPolicy: row.privacy_policy,
    images: row.images || [],
    createdAt: row.created_at,
  };
}

// Helper: map DB row to category object
function rowToCategory(row) {
  return {
    id: row.id,
    name: row.name,
    section: row.section,
  };
}

// ── File Upload & Media Routes ────────────────────────────────────────────────
app.post('/api/admin/upload', requireAuth, upload.single('icon'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  if (!R2_ACCOUNT_ID || !R2_BUCKET_NAME) {
    return res.status(500).json({ error: 'R2 storage is not configured.' });
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
    res.json({ url: `${R2_PUBLIC_URL}/${key}` });
  } catch (err) {
    console.error('R2 upload error:', err);
    res.status(500).json({ error: 'Upload to R2 failed: ' + err.message });
  }
});

app.get('/api/admin/media', requireAuth, async (req, res) => {
  if (!R2_ACCOUNT_ID || !R2_BUCKET_NAME) {
    return res.status(500).json({ error: 'R2 storage is not configured.' });
  }
  try {
    const data = await r2.send(new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: 'icons/'
    }));
    const files = (data.Contents || []).map(item => ({
      key: item.Key,
      url: `${R2_PUBLIC_URL}/${item.Key}`,
      lastModified: item.LastModified,
      size: item.Size
    })).sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    res.json(files);
  } catch (err) {
    console.error('R2 list media error:', err);
    res.status(500).json({ error: 'Failed to list media from R2: ' + err.message });
  }
});

// ── Auth Routes ───────────────────────────────────────────────────────────────
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

// ── User Routes ───────────────────────────────────────────────────────────────
app.get('/api/admin/users', requireAuth, (req, res) => {
  res.json(users.map(({ password: _pw, ...u }) => u));
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
    name, username, password,
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

app.get('/api/admin/stats', requireAuth, async (req, res) => {
  try {
    const [appsRes, catsRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM apps'),
      pool.query('SELECT COUNT(*) FROM categories'),
    ]);
    res.json({
      totalUsers: users.length,
      adminUsers: users.filter(u => u.role === 'admin').length,
      editorUsers: users.filter(u => u.role === 'editor').length,
      totalApps: parseInt(appsRes.rows[0].count, 10),
      totalCategories: parseInt(catsRes.rows[0].count, 10),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Public Category Routes ────────────────────────────────────────────────────
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows.map(rowToCategory));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Public App Routes ─────────────────────────────────────────────────────────
app.get('/api/apps', async (req, res) => {
  try {
    let query = 'SELECT * FROM apps WHERE 1=1';
    const params = [];
    if (req.query.featured === 'true') {
      params.push(true);
      query += ` AND is_featured = $${params.length}`;
    }
    if (req.query.section) {
      params.push(req.query.section);
      query += ` AND section = $${params.length}`;
    }
    if (req.query.categoryId) {
      params.push(req.query.categoryId);
      query += ` AND category_id = $${params.length}`;
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows.map(rowToApp));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/apps/:appSlug', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM apps WHERE app_slug = $1', [req.params.appSlug]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'App not found' });
    res.json(rowToApp(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin Category Routes ─────────────────────────────────────────────────────
app.post('/api/admin/categories', requireAuth, async (req, res) => {
  const { name, section } = req.body;
  if (!name || !section) return res.status(400).json({ error: 'Name and section required' });
  try {
    const id = crypto.randomUUID();
    const result = await pool.query(
      'INSERT INTO categories (id, name, section) VALUES ($1, $2, $3) RETURNING *',
      [id, name.trim(), section]
    );
    res.status(201).json(rowToCategory(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/categories/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin App Routes ──────────────────────────────────────────────────────────
app.post('/api/admin/apps', requireAuth, async (req, res) => {
  const { name, description, section, categoryId, isFeatured, link, icon, appSlug, hasLegal, termsOfService, privacyPolicy, images } = req.body;
  if (!name || !section || !link) {
    return res.status(400).json({ error: 'Name, section, and link are required' });
  }

  // Generate unique slug
  let slug = appSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  if (!slug) slug = 'app-' + crypto.randomUUID().slice(0, 8);

  try {
    // Ensure slug uniqueness
    let slugCandidate = slug;
    let count = 1;
    while (true) {
      const exists = await pool.query('SELECT id FROM apps WHERE app_slug = $1', [slugCandidate]);
      if (exists.rows.length === 0) break;
      slugCandidate = `${slug}-${count++}`;
    }

    const id = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO apps (id, name, description, section, category_id, is_featured, link, icon, app_slug, has_legal, terms_of_service, privacy_policy, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        id,
        name,
        description || '',
        section,
        categoryId || null,
        !!isFeatured,
        link,
        icon || 'FileText',
        slugCandidate,
        !!hasLegal,
        hasLegal && termsOfService ? JSON.stringify(termsOfService) : null,
        hasLegal && privacyPolicy ? JSON.stringify(privacyPolicy) : null,
        JSON.stringify(images || []),
      ]
    );
    res.status(201).json(rowToApp(result.rows[0]));
  } catch (err) {
    console.error('Create app error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/apps/:id', requireAuth, async (req, res) => {
  const { name, description, section, categoryId, isFeatured, link, icon, appSlug, hasLegal, termsOfService, privacyPolicy, images } = req.body;
  try {
    const result = await pool.query(
      `UPDATE apps SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        section = COALESCE($3, section),
        category_id = $4,
        is_featured = COALESCE($5, is_featured),
        link = COALESCE($6, link),
        icon = COALESCE($7, icon),
        app_slug = COALESCE($8, app_slug),
        has_legal = COALESCE($9, has_legal),
        terms_of_service = $10,
        privacy_policy = $11,
        images = COALESCE($12, images)
       WHERE id = $13 RETURNING *`,
      [
        name, description, section,
        categoryId || null,
        isFeatured !== undefined ? !!isFeatured : null,
        link, icon, appSlug,
        hasLegal !== undefined ? !!hasLegal : null,
        hasLegal && termsOfService ? JSON.stringify(termsOfService) : null,
        hasLegal && privacyPolicy ? JSON.stringify(privacyPolicy) : null,
        images ? JSON.stringify(images) : null,
        req.params.id,
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'App not found' });
    res.json(rowToApp(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/apps/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM apps WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SPA Fallback ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ── Start Server ──────────────────────────────────────────────────────────────
async function start() {
  try {
    await initDb();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is listening on 0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
