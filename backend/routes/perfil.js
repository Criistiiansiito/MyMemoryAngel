const express = require('express');
const admin = require('../firebaseAdmin');
const db = require('../db');

const router = express.Router();

router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    const sql = `
      SELECT u.*, a.tamano_texto, a.modo_daltonico
      FROM usuarios u
      LEFT JOIN accesibilidad a ON u.uid = a.user_uid
      WHERE u.uid = ?
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [decoded.uid]);

    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json({ ok: true, usuario: rows[0] });
  } catch (_err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
});

router.put('/actualizar-accesibilidad', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const { tamano_texto, modo_daltonico } = req.body;

    const sql = 'UPDATE accesibilidad SET tamano_texto = ?, modo_daltonico = ? WHERE user_uid = ?';
    await db.query(sql, [tamano_texto, modo_daltonico ? 1 : 0, decoded.uid]);

    res.json({ ok: true });
  } catch (_err) {
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

router.put('/actualizar-perfil', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const { nombre, foto_perfil, fecha_nacimiento } = req.body;

    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

    const fechaFinal = fecha_nacimiento && fecha_nacimiento.trim() !== '' ? fecha_nacimiento : null;

    const sql = 'UPDATE usuarios SET nombre = ?, foto_perfil = ?, fecha_nacimiento = ? WHERE uid = ?';
    await db.query(sql, [nombre, foto_perfil, fechaFinal, decoded.uid]);

    return res.json({ ok: true, message: 'Perfil actualizado correctamente' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/progreso-juegos', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const {
      juego,
      categoria,
      puntuacion = 0,
      ultimo_resultado = null,
      user_uid,
    } = req.body;

    const targetUid = user_uid || decoded.uid;

    if (!juego || !categoria) {
      return res.status(400).json({ ok: false, error: 'Juego y categoria son obligatorios' });
    }

    const [rows] = await db.query(
      'SELECT * FROM progreso_juegos WHERE user_uid = ? AND juego = ? LIMIT 1',
      [targetUid, juego]
    );

    if (rows.length === 0) {
      await db.query(
        `
          INSERT INTO progreso_juegos
          (user_uid, juego, categoria, partidas_jugadas, mejor_puntuacion, promedio_puntuacion, ultimo_resultado, ultima_fecha)
          VALUES (?, ?, ?, 1, ?, ?, ?, NOW())
        `,
        [targetUid, juego, categoria, puntuacion, puntuacion, ultimo_resultado]
      );
    } else {
      const actual = rows[0];
      const partidasAnteriores = Number(actual.partidas_jugadas || 0);
      const partidasJugadas = partidasAnteriores + 1;
      const promedioAnterior = Number(actual.promedio_puntuacion || 0);
      const mejorAnterior = Number(actual.mejor_puntuacion || 0);
      const nuevaPuntuacion = Number(puntuacion);
      const nuevoPromedio = ((promedioAnterior * partidasAnteriores) + nuevaPuntuacion) / partidasJugadas;
      const mejorPuntuacion = Math.max(mejorAnterior, nuevaPuntuacion);

      await db.query(
        `
          UPDATE progreso_juegos
          SET
            categoria = ?,
            partidas_jugadas = ?,
            mejor_puntuacion = ?,
            promedio_puntuacion = ?,
            ultimo_resultado = ?,
            ultima_fecha = NOW()
          WHERE user_uid = ? AND juego = ?
        `,
        [categoria, partidasJugadas, mejorPuntuacion, nuevoPromedio, ultimo_resultado, targetUid, juego]
      );
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Error guardando progreso de juego:', err);
    return res.status(500).json({ ok: false, error: 'No se pudo guardar el progreso del juego' });
  }
});

router.get('/progreso-juegos/:user_uid', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    await admin.auth().verifyIdToken(token);

    const [rows] = await db.query(
      `
        SELECT id, user_uid, juego, categoria, partidas_jugadas, mejor_puntuacion,
               promedio_puntuacion, ultimo_resultado, ultima_fecha, actualizado_en
        FROM progreso_juegos
        WHERE user_uid = ?
        ORDER BY categoria ASC, juego ASC
      `,
      [req.params.user_uid]
    );

    return res.json({ ok: true, progreso: rows });
  } catch (err) {
    console.error('Error obteniendo progreso de juegos:', err);
    return res.status(500).json({ ok: false, error: 'No se pudo obtener el progreso de juegos' });
  }
});

router.get('/paciente-profile/:id', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    await admin.auth().verifyIdToken(token);
    const { id } = req.params;

    const sql = `
      SELECT u.*, a.tamano_texto, a.modo_daltonico
      FROM usuarios u
      LEFT JOIN accesibilidad a ON u.uid = a.user_uid
      WHERE u.uid = ?
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Paciente no encontrado' });
    }

    return res.json({ ok: true, usuario: rows[0] });
  } catch (err) {
    console.error('Error obteniendo perfil de paciente:', err);
    return res.status(500).json({ ok: false, error: 'No se pudo obtener el perfil del paciente' });
  }
});

router.put('/paciente-profile/:id', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token faltante' });

  const connection = await db.getConnection();

  try {
    await admin.auth().verifyIdToken(token);
    const { id } = req.params;
    const {
      nombre,
      foto_perfil,
      fecha_nacimiento,
      tamano_texto,
      modo_daltonico,
    } = req.body;

    if (!nombre) {
      return res.status(400).json({ ok: false, error: 'El nombre es obligatorio' });
    }

    const fechaFinal = fecha_nacimiento && String(fecha_nacimiento).trim() !== ''
      ? fecha_nacimiento
      : null;

    await connection.beginTransaction();

    await connection.query(
      'UPDATE usuarios SET nombre = ?, foto_perfil = ?, fecha_nacimiento = ? WHERE uid = ?',
      [nombre, foto_perfil || null, fechaFinal, id]
    );

    await connection.query(
      `
        INSERT INTO accesibilidad (user_uid, tamano_texto, modo_daltonico)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          tamano_texto = VALUES(tamano_texto),
          modo_daltonico = VALUES(modo_daltonico)
      `,
      [id, tamano_texto || 'Mediano', modo_daltonico ? 1 : 0]
    );

    await connection.commit();
    return res.json({ ok: true, message: 'Perfil del paciente actualizado correctamente' });
  } catch (err) {
    await connection.rollback();
    console.error('Error actualizando perfil de paciente:', err);
    return res.status(500).json({ ok: false, error: 'No se pudo actualizar el perfil del paciente' });
  } finally {
    connection.release();
  }
});

module.exports = router;
