const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER || 'uploads';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const META_FILE = path.join(__dirname, 'files.json');

// Ensure uploads folder exists
if (!fs.existsSync(UPLOAD_FOLDER)) fs.mkdirSync(UPLOAD_FOLDER);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_FOLDER),
  filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname))
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    // Optional: file type validation
    cb(null, true);
  }
});

// Load metadata
function loadMeta() {
  if (!fs.existsSync(META_FILE)) return [];
  return JSON.parse(fs.readFileSync(META_FILE));
}
function saveMeta(meta) {
  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
}

// POST /upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const uuid = uuidv4();
  const meta = loadMeta();
  const fileData = {
    uuid,
    filename: req.file.originalname,
    path: req.file.filename,
    createdAt: Date.now()
  };
  meta.push(fileData);
  saveMeta(meta);
  res.json({
    downloadUrl: `${BASE_URL}/download/${uuid}`,
    uuid,
    expiresAt: fileData.createdAt + 24 * 60 * 60 * 1000
  });
});

// GET /download/:uuid
app.get('/download/:uuid', (req, res) => {
  const meta = loadMeta();
  const file = meta.find(f => f.uuid === req.params.uuid);
  if (!file) return res.status(404).send('File not found or expired');
  const filePath = path.join(UPLOAD_FOLDER, file.path);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
  // Expiry check
  if (Date.now() > file.createdAt + 24 * 60 * 60 * 1000) {
    return res.status(410).send('Link expired');
  }
  res.download(filePath, file.filename);
});

// GET /fileinfo/:uuid (for expiry countdown)
app.get('/fileinfo/:uuid', (req, res) => {
  const meta = loadMeta();
  const file = meta.find(f => f.uuid === req.params.uuid);
  if (!file) return res.status(404).json({ error: 'Not found' });
  res.json({
    filename: file.filename,
    expiresAt: file.createdAt + 24 * 60 * 60 * 1000
  });
});

// Auto-delete expired files (runs every hour)
cron.schedule('0 * * * *', () => {
  const meta = loadMeta();
  const now = Date.now();
  const keep = [];
  meta.forEach(file => {
    if (now > file.createdAt + 24 * 60 * 60 * 1000) {
      const filePath = path.join(UPLOAD_FOLDER, file.path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } else {
      keep.push(file);
    }
  });
  saveMeta(keep);
});

app.use(express.static(path.join(__dirname, '../client/build')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
