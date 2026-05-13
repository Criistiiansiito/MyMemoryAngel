const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/get-lecturas', async (req, res) => {
  try {
    const { tipo } = req.query;
    const [rows] = await db.query(
      'SELECT id, titulo, tipo, contenido, imagenPrincipal FROM lecturas WHERE tipo = ?',
      [tipo]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener lecturas:', error);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router;
