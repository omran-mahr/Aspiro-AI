// backend/routes/uploads.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads', 'profile');
if (!fs.existsSync('uploads/profile')) {
    fs.mkdirSync('uploads/profile', { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'_'))
});
const upload = multer({ storage, limits: { fileSize: 5*1024*1024 } });

router.post('/profile', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/profile/${req.file.filename}`;
  res.json({ url });
});

module.exports = router;
