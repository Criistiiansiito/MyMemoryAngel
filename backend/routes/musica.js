const express = require('express');
const multer = require('multer');
const db = require('../db');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos MP3'), false);
    }
  },
});

router.get('/get-musica', async (req, res) => {
  try {
    const { tipo, id_usuario } = req.query;

    let sql = 'SELECT id, titulo, tipo, audio, imagen FROM musica WHERE tipo = ?';
    const params = [tipo];

    if (tipo === 'personal') {
      sql += ' AND (id_usuario = ? OR id_usuario IS NULL)';
      params.push(id_usuario);
    }

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Error en musica:', error);
    res.status(500).send('Error en el servidor');
  }
});

router.post('/insert-musica', (req, res) => {
  upload.single('audio')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ res: 'error', msg: err.message });
    }

    try {
      const { titulo, tipo, id_usuario } = req.body;
      if (!req.file) return res.status(400).send('No hay archivo');

      const audioBuffer = req.file.buffer;
      const query = 'INSERT INTO musica (titulo, tipo, audio, id_usuario) VALUES (?, ?, ?, ?)';
      await db.query(query, [titulo, tipo, audioBuffer, id_usuario]);

      res.json({ res: 'ok' });
    } catch (_error) {
      res.status(500).send('Error interno');
    }
  });
});

module.exports = router;
