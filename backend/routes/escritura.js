const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/get-escrituras', async (req, res) => {
  try {
    const { id_usuario } = req.query;

    const [rows] = await db.query(
      'SELECT id, dia, texto FROM escrituras WHERE id_usuario = ? ORDER BY id DESC',
      [id_usuario]
    );
    res.json(rows);
  } catch (_error) {
    res.status(500).send('Error en el servidor');
  }
});

router.post('/add-escritura', async (req, res) => {
  try {
    const { id_usuario, dia, texto } = req.body;

    if (!id_usuario || !texto) {
      return res.status(400).json({ error: 'Faltan datos (uid o texto)' });
    }

    await db.query(
      'INSERT INTO escrituras (id_usuario, dia, texto) VALUES (?, ?, ?)',
      [id_usuario, dia, texto]
    );
    res.json({ ok: true, message: 'Guardado correctamente' });
  } catch (_error) {
    res.status(500).send('Error al guardar');
  }
});

router.delete('/delete-escritura/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM escrituras WHERE id = ?', [id]);
    res.json({ message: 'Entrada eliminada' });
  } catch (_error) {
    res.status(500).send('Error al eliminar');
  }
});

module.exports = router;
