const express = require('express');
const admin = require('../firebaseAdmin');
const db = require('../db');
const { sendPushNotifications } = require('../pushNotifications');

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

router.post('/preguntar', async (req, res) => {
  const { mensajeUsuario } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT respuesta FROM chatbot_contenido WHERE pregunta LIKE ? OR categoria LIKE ?',
      [`%${mensajeUsuario}%`, `%${mensajeUsuario}%`]
    );
    res.json({ respuesta: rows.length > 0 ? rows[0].respuesta : 'No tengo información específica sobre eso.' });
  } catch (_error) {
    res.status(500).json({ respuesta: 'Error al consultar.' });
  }
});

router.post('/push-token', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token faltante' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const { expo_push_token, platform } = req.body;

    if (!expo_push_token || !platform) {
      return res.status(400).json({ error: 'Faltan datos del dispositivo' });
    }

    const sql = `
      INSERT INTO device_tokens (user_uid, expo_push_token, platform, activo)
      VALUES (?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE
        user_uid = VALUES(user_uid),
        platform = VALUES(platform),
        activo = 1,
        updated_at = CURRENT_TIMESTAMP
    `;

    await db.query(sql, [decoded.uid, expo_push_token, platform]);

    return res.json({ ok: true });
  } catch (err) {
    console.error('Error guardando push token:', err);
    return res.status(500).json({ error: 'No se pudo guardar el token push' });
  }
});

router.post('/test-push', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token faltante' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    const [rows] = await db.query(
      'SELECT expo_push_token FROM device_tokens WHERE user_uid = ? AND activo = 1',
      [decoded.uid]
    );

    const tokens = rows.map((row) => row.expo_push_token);

    const result = await sendPushNotifications(tokens, {
      title: 'MyMemoryAngel',
      body: 'Esta es una notificación push de prueba',
      data: { tipo: 'test' },
      categoryId: 'recordatorio-actions',
    });

    return res.json({ ok: true, result });
  } catch (err) {
    console.error('Error en test push:', err);
    return res.status(500).json({ error: 'No se pudo enviar la push' });
  }
});

module.exports = router;
