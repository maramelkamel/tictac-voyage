// backend/controllers/mediaController.js
//
// Upload léger sans dépendance multipart :
// - Le frontend envoie un `dataUrl` (base64) via JSON.
// - Le backend écrit le fichier dans `backend/uploads/<folder>/...`
// - Retourne une URL publique servie par Express (/uploads/...).

const fs = require('fs');
const path = require('path');

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

const parseDataUrl = (dataUrl = '') => {
  const m = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  return { mime: m[1], b64: m[2] };
};

const extFromMime = (mime) => {
  const map = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return map[mime] || null;
};

const uploadImage = async (req, res) => {
  try {
    const { dataUrl, folder = 'misc' } = req.body || {};
    const parsed = parseDataUrl(dataUrl);
    if (!parsed) {
      return res.status(400).json({ success: false, message: 'dataUrl invalide' });
    }

    const ext = extFromMime(parsed.mime);
    if (!ext) {
      return res.status(400).json({ success: false, message: `Type non supporté: ${parsed.mime}` });
    }

    const buffer = Buffer.from(parsed.b64, 'base64');
    if (!buffer?.length) {
      return res.status(400).json({ success: false, message: 'Image vide' });
    }
    if (buffer.length > MAX_BYTES) {
      return res.status(413).json({ success: false, message: 'Image trop lourde (max 5MB)' });
    }

    const safeFolder = String(folder).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32) || 'misc';
    const uploadsDir = path.join(__dirname, '..', 'uploads', safeFolder);
    fs.mkdirSync(uploadsDir, { recursive: true });

    const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
    const absPath = path.join(uploadsDir, filename);
    fs.writeFileSync(absPath, buffer);

    const rel = `/uploads/${safeFolder}/${filename}`;
    const url = `${req.protocol}://${req.get('host')}${rel}`;
    return res.json({ success: true, url, path: rel });
  } catch (err) {
    console.error('[media] uploadImage:', err.message);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { uploadImage };

