const express = require('express');
const admin = require('../firebaseAdmin');
const db = require('../db');

const router = express.Router();

router.post('/sync', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token faltante' });

  const connection = await db.getConnection();

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;
    const correo = decoded.email || req.body.email || null;
    const nombre = req.body.nombre || decoded.name || null;
    const apellidos = req.body.apellidos || null;
    const fecha_nacimiento = req.body.fecha_nacimiento || null;
    const tipo_usuario = req.body.tipo_usuario || 'paciente';
    const foto_perfil = null;
    const fecha_registro = new Date();

    await connection.beginTransaction();

    const sqlUser = `
      INSERT INTO usuarios (uid, nombre, apellidos, correo, fecha_nacimiento, tipo_usuario, foto_perfil, fecha_registro)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nombre = VALUES(nombre),
        apellidos = VALUES(apellidos),
        correo = VALUES(correo),
        fecha_nacimiento = VALUES(fecha_nacimiento),
        tipo_usuario = VALUES(tipo_usuario)
    `;
    await connection.query(sqlUser, [uid, nombre, apellidos, correo, fecha_nacimiento, tipo_usuario, foto_perfil, fecha_registro]);

    const sqlAcc = `
      INSERT IGNORE INTO accesibilidad (user_uid, tamano_texto, modo_daltonico)
      VALUES (?, 'Mediano', 0)
    `;
    await connection.query(sqlAcc, [uid]);

    await connection.commit();
    return res.json({ ok: true, uid });
  } catch (_err) {
    if (connection) await connection.rollback();
    return res.status(500).json({ error: 'Error al sincronizar datos del usuario' });
  } finally {
    connection.release();
  }
});

module.exports = router;
