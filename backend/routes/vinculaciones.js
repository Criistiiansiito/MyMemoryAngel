const express = require('express');
const admin = require('../firebaseAdmin');
const db = require('../db');

const router = express.Router();

router.get('/paciente/:id', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    await admin.auth().verifyIdToken(token);
    const { id } = req.params;

    const sql = 'SELECT nombre, tipo_usuario FROM usuarios WHERE uid = ? LIMIT 1';
    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Paciente no encontrado' });
    }

    const paciente = rows[0];
    return res.json({ ok: true, paciente: { nombre: paciente.nombre } });
  } catch (_err) {
    return res.status(401).json({ error: 'Token inválido o error de servidor' });
  }
});

router.post('/vincular-paciente', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const uidCuidador = decoded.uid;
    const { id_paciente: uidPacienteQR } = req.body;

    if (!uidPacienteQR) {
      return res.status(400).json({ error: 'UID de paciente requerido' });
    }

    const sqlInsert = 'INSERT INTO vinculaciones (id_cuidador, id_paciente) VALUES (?, ?)';

    try {
      await db.query(sqlInsert, [uidCuidador, uidPacienteQR]);
      return res.json({ ok: true, message: 'Vinculación exitosa' });
    } catch (dbErr) {
      if (dbErr.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          ok: false,
          error: 'Ya estás vinculado con este paciente',
        });
      }
      throw dbErr;
    }
  } catch (_err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/mis-pacientes', async (req, res) => {
  try {
    const decoded = await admin.auth().verifyIdToken(req.headers.authorization.split(' ')[1]);
    const sql = `
      SELECT u.nombre, u.uid, u.foto_perfil, u.correo, u.fecha_nacimiento
      FROM usuarios u
      JOIN vinculaciones v ON u.uid = v.id_paciente
      WHERE v.id_cuidador = ?
    `;
    const [rows] = await db.query(sql, [decoded.uid]);
    res.json({ ok: true, pacientes: rows });
  } catch (_error) {
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
});

module.exports = router;
