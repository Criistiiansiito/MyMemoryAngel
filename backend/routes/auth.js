const express = require('express');
const router = express.Router();
const admin = require('../firebaseAdmin');
const multer = require('multer'); 
const db = require('../db'); 
const { sendPushNotifications } = require('../pushNotifications');

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        // Solo aceptar archivos con el MIME type de MP3
        if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos MP3'), false);
        }
    }
});
// ==========================================
// 1. SINCRONIZACIÓN (REGISTRO / LOGIN)
// ==========================================
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

        // Insertar en tabla USUARIOS
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

        // Insertar en tabla ACCESIBILIDAD 
        const sqlAcc = `
            INSERT IGNORE INTO accesibilidad (user_uid, tamano_texto, modo_daltonico)
            VALUES (?, 'Mediano', 0)
        `;
        await connection.query(sqlAcc, [uid]);

        await connection.commit();
        return res.json({ ok: true, uid });
        
    } catch (err) {
        if (connection) await connection.rollback();
        return res.status(500).json({ error: 'Error al sincronizar datos del usuario' });
    } finally {
        connection.release();
    }
});

// ==========================================
// 2. OBTENER PERFIL (CON JOIN)
// ==========================================
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
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
    }
});

// ==========================================
// 3. ACTUALIZAR ACCESIBILIDAD
// ==========================================
router.put('/actualizar-accesibilidad', async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token faltante' });

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        const { tamano_texto, modo_daltonico } = req.body;

        const sql = `UPDATE accesibilidad SET tamano_texto = ?, modo_daltonico = ? WHERE user_uid = ?`;
        await db.query(sql, [tamano_texto, modo_daltonico ? 1 : 0, decoded.uid]);
        
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar configuración' });
    }
});

// ==========================================
// 4. ACTUALIZAR PERFIL (NOMBRE, FOTO, FECHA)
// ==========================================
router.put('/actualizar-perfil', async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token faltante' });

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        const { nombre, foto_perfil, fecha_nacimiento } = req.body;

        if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

        const fechaFinal = (fecha_nacimiento && fecha_nacimiento.trim() !== '') ? fecha_nacimiento : null;

        const sql = `UPDATE usuarios SET nombre = ?, foto_perfil = ?, fecha_nacimiento = ? WHERE uid = ?`;
        await db.query(sql, [nombre, foto_perfil, fechaFinal, decoded.uid]);

        return res.json({ ok: true, message: 'Perfil actualizado correctamente' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 5. RECORDATORIOS Y CHATBOT (RESTO DEL CÓDIGO)
// ==========================================

router.post('/crear', async (req, res) => {
    const { id_usuario, titulo, descripcion, tipo, recurrencia, fecha_hora, tipo_alerta } = req.body;
    try {
        const sql = `INSERT INTO recordatorios (id_usuario, titulo, descripcion, tipo, recurrencia, fecha_hora, tipo_alerta, activo, cumplido) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, FALSE)`;
        const [result] = await db.query(sql, [id_usuario, titulo, descripcion, tipo, recurrencia, fecha_hora, tipo_alerta]);
        res.status(201).json({ ok: true, id_recordatorio: result.insertId });
    } catch (err) { res.status(500).json({ error: "Error al guardar" }); }
});

router.get('/recordatorios/:id_usuario', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM recordatorios WHERE id_usuario = ? ORDER BY fecha_hora ASC', [req.params.id_usuario]);
        res.json({ ok: true, recordatorios: rows });
    } catch (err) { res.status(500).json({ error: "Error al obtener" }); }
});

router.put('/recordatorios/:id', async (req, res) => {
    const { titulo, descripcion, fecha_hora, tipo } = req.body;
    try {
        await db.query("UPDATE recordatorios SET titulo=?, descripcion=?, fecha_hora=?, tipo=? WHERE id_recordatorio=?", [titulo, descripcion, fecha_hora, tipo, req.params.id]);
        res.json({ ok: true });
    } catch (err) { res.status(500).json({ ok: false }); }
});

router.delete('/recordatorios/:id', async (req, res) => {
    try {
        await db.query("DELETE FROM recordatorios WHERE id_recordatorio = ?", [req.params.id]);
        res.status(200).json({ ok: true });
    } catch (err) { res.status(500).json({ ok: false }); }
});

router.post('/preguntar', async (req, res) => {
    const { mensajeUsuario } = req.body;
    try {
        let [rows] = await db.query("SELECT respuesta FROM chatbot_contenido WHERE pregunta LIKE ? OR categoria LIKE ?", [`%${mensajeUsuario}%`, `%${mensajeUsuario}%`]);
        res.json({ respuesta: rows.length > 0 ? rows[0].respuesta : "No tengo información específica sobre eso." });
    } catch (error) { res.status(500).json({ respuesta: "Error al consultar." }); }
});


// ---------------------------
//   MUSICA DE LA APLICACIÓN
// ---------------------------

router.get('/get-musica', async (req, res) => {
    try {
        const { tipo, id_usuario } = req.query;
        
        let sql = 'SELECT id, titulo, tipo, audio, imagen FROM musica WHERE tipo = ?';
        let params = [tipo];

        if (tipo === 'personal') {
            // Buscamos donde el id_usuario coincida O sea NULL (canciones generales)
            sql += ' AND (id_usuario = ? OR id_usuario IS NULL)';
            params.push(id_usuario);
        }

        const [rows] = await db.query(sql, params);

        const respuesta = rows.map(pista => ({
            id: pista.id,
            titulo: pista.titulo,
            tipo: pista.tipo,
            audio: pista.audio ? pista.audio.toString('base64') : null,
            imagen: pista.imagen ? pista.imagen.toString('base64') : null
        }));

        res.json(respuesta);
    } catch (error) {
        res.status(500).send("Error en el servidor");
    }
});

router.post('/insert-musica', (req, res) => {
    upload.single('audio')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ res: "error", msg: err.message });
        }
        
        try {
            const { titulo, tipo, id_usuario } = req.body;
            if (!req.file) return res.status(400).send("No hay archivo");

            const audioBuffer = req.file.buffer;
            const query = 'INSERT INTO musica (titulo, tipo, audio, id_usuario) VALUES (?, ?, ?, ?)';
            await db.query(query, [titulo, tipo, audioBuffer, id_usuario]);

            res.json({ res: "ok" });
        } catch (error) {
            res.status(500).send("Error interno");
        }
    });
});

// -------------------------------------
//   LECTURAS COMUNES DE LA APLICACIÓN
// -------------------------------------

// Obtener todas las lecturas de la aplicación (comunes a todos los pacientes)
router.get('/get-lecturas', async (req, res) => {
  try {
    const { tipo } = req.query;
    const [rows] = await db.query(
      'SELECT id, titulo, tipo, contenido, imagenPrincipal FROM lecturas WHERE tipo = ?', 
      [tipo]
    );

    const respuesta = rows.map(lectura => ({
      ...lectura,
      imagenPrincipal: lectura.imagenPrincipal ? Buffer.from(lectura.imagenPrincipal).toString('base64') : null
    }));

    res.json(respuesta);
  } catch (error) {
    res.status(500).send("Error en el servidor");
  }
});

// ------------------------------------
//   ESCRITURAS DEL PACIENTE (DIARIO)
// ------------------------------------

// Obtener el diario de un paciente
router.get('/get-escrituras', async (req, res) => {
  try {
    const { id_usuario } = req.query; 

    const [rows] = await db.query(
      'SELECT id, dia, texto FROM escrituras WHERE id_usuario = ? ORDER BY id DESC',
      [id_usuario]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).send("Error en el servidor");
  }
});

// Guardar un nuevo escrito en diario de paciente
router.post('/add-escritura', async (req, res) => {
  try {
    const { id_usuario, dia, texto } = req.body;

    if (!id_usuario || !texto) {
      return res.status(400).json({ error: "Faltan datos (uid o texto)" });
    }

    await db.query(
      'INSERT INTO escrituras (id_usuario, dia, texto) VALUES (?, ?, ?)',
      [id_usuario, dia, texto]
    );
    res.json({ ok: true, message: "Guardado correctamente" });
  } catch (error) {
    res.status(500).send("Error al guardar");
  }
});

// Borrar una escritura concreta del diario de paciente
router.delete('/delete-escritura/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM escrituras WHERE id = ?', [id]);
    res.json({ message: "Entrada eliminada" });
  } catch (error) {
    res.status(500).send("Error al eliminar");
  }
});

// -------------------------------------
//   VINCULACIONES PACIENTE - CUIDADOR
// -------------------------------------

// Datos del paciente para mostrar el nombre en la alerta al escanear
router.get('/paciente/:id', async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token faltante' });

    try {
        await admin.auth().verifyIdToken(token);
        const { id } = req.params; 

        // Buscamos al paciente por su UID
        const sql = `SELECT nombre, tipo_usuario FROM usuarios WHERE uid = ? LIMIT 1`;
        const [rows] = await db.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ ok: false, error: 'Paciente no encontrado' });
        }

        const paciente = rows[0];

        return res.json({ ok: true, paciente: { nombre: paciente.nombre } });

    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o error de servidor' });
    }
});

// Creamos la vinculación usando los uid
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

        const sqlInsert = `INSERT INTO vinculaciones (id_cuidador, id_paciente) VALUES (?, ?)`;
        
        try {
            await db.query(sqlInsert, [uidCuidador, uidPacienteQR]);
            return res.json({ ok: true, message: 'Vinculación exitosa' });
        } catch (dbErr) {
            // Manejo específico del error de duplicado (Unique Key)
            if (dbErr.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ 
                    ok: false, 
                    error: 'Ya estás vinculado con este paciente' 
                });
            }
            throw dbErr;
        }

    } catch (err) {
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
            WHERE v.id_cuidador = ?`;
        const [rows] = await db.query(sql, [decoded.uid]);
        res.json({ ok: true, pacientes: rows });
    } catch (error) { res.status(500).json({ error: 'Error al obtener pacientes' }); }
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
              title: 'Prueba MyMemoryAngel',
              body: 'Esta es una notificación push de prueba',
              data: { tipo: 'test' },
          });

          return res.json({ ok: true, result });
      } catch (err) {
          console.error('Error en test push:', err);
          return res.status(500).json({ error: 'No se pudo enviar la push' });
      }
});

module.exports = router;