const express = require('express');
const router = express.Router();
const admin = require('../firebaseAdmin'); // firebase-admin
const db = require('../db'); // mysql2/promise pool

// Ruta para sincronizar un usuario tras registro en Firebase
router.post('/sync', async (req, res) => {
  //PARA seguridad
  console.log("hola");
  console.log('Authorization header:', req.headers.authorization);

  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid; //Token de firebase
    const correo = decoded.email || req.body.email || null;
    const nombre = req.body.nombre || decoded.name || null;
    const apellidos = req.body.apellidos || null;
    const fecha_nacimiento = req.body.fecha_nacimiento || null;
    const tipo_usuario = req.body.tipo_usuario || 'paciente'; // 'paciente' o 'responsable'
    const foto_perfil = null; // opcional, puedes agregar lógica para subir foto
    const fecha_registro = new Date(); // timestamp actual

    // Insertar o actualizar usuario en la tabla 'usuarios'
    const sql = `
INSERT INTO usuarios (uid, nombre, apellidos, correo, fecha_nacimiento, tipo_usuario, foto_perfil, fecha_registro)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  apellidos = VALUES(apellidos),
  correo = VALUES(correo),
  fecha_nacimiento = VALUES(fecha_nacimiento),
  tipo_usuario = VALUES(tipo_usuario),
  foto_perfil = VALUES(foto_perfil),
  fecha_registro = fecha_registro
`;

const [result] = await db.query(sql, [
  uid, 
  nombre, 
  apellidos, 
  correo, 
  fecha_nacimiento, 
  tipo_usuario, 
  foto_perfil, 
  fecha_registro
]);

    return res.json({ ok: true, uid, id_usuario: result.insertId || null });
  } catch (err) {
    console.error('Sync error:', err);
    return res.status(401).json({ error: 'Token inválido o error al sincronizar' });
  }
});

// Endpoint protegido ejemplo: obtener perfil del usuario con token
router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    const [rows] = await db.query('SELECT * FROM usuarios WHERE uid = ? LIMIT 1', [uid]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json({ ok: true, usuario: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;
