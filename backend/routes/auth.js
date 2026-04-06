const express = require('express');
const router = express.Router();
const admin = require('../firebaseAdmin'); // firebase-admin
const db = require('../db'); // mysql2/promise pool

// 1. Ruta para sincronizar usuario (Firebase -> MySQL)
router.post('/sync', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token faltante' });

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

    const sql = `
      INSERT INTO usuarios (uid, nombre, apellidos, correo, fecha_nacimiento, tipo_usuario, foto_perfil, fecha_registro)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nombre = VALUES(nombre),
        apellidos = VALUES(apellidos),
        correo = VALUES(correo),
        fecha_nacimiento = VALUES(fecha_nacimiento),
        tipo_usuario = VALUES(tipo_usuario),
        foto_perfil = VALUES(foto_perfil)
    `;

    const [result] = await db.query(sql, [
      uid, nombre, apellidos, correo, fecha_nacimiento, tipo_usuario, foto_perfil, fecha_registro
    ]);

    // OJO: Si es un UPDATE, insertId puede ser 0. 
    // Si necesitas el id_usuario real siempre, podrías hacer un SELECT después.
    return res.json({ ok: true, uid, id_usuario: result.insertId || null });
    
  } catch (err) {
    console.error('Sync error:', err);
    return res.status(401).json({ error: 'Token inválido o error al sincronizar' });
  }
});

// 2. Obtener perfil
router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const [rows] = await db.query('SELECT * FROM usuarios WHERE uid = ? LIMIT 1', [decoded.uid]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json({ ok: true, usuario: rows[0] });
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
});

// 3. Crear Recordatorio (CORREGIDO A ASYNC/AWAIT)
router.post('/crear', async (req, res) => {
    const { id_usuario, titulo, descripcion, tipo, recurrencia, fecha_hora, tipo_alerta } = req.body;

    // Validación básica
    if (!id_usuario || !titulo || !fecha_hora) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const sql = `
        INSERT INTO recordatorios 
        (id_usuario, titulo, descripcion, tipo, recurrencia, fecha_hora, tipo_alerta, activo, cumplido) 
        VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, FALSE)
    `;

    const values = [id_usuario, titulo, descripcion, tipo, recurrencia, fecha_hora, tipo_alerta];

    try {
        const [result] = await db.query(sql, values);
        res.status(201).json({ 
            ok: true,
            message: "Recordatorio creado", 
            id_recordatorio: result.insertId 
        });
    } catch (err) {
        console.error("Error al insertar recordatorio:", err);
        res.status(500).json({ error: "Error interno del servidor al guardar" });
    }
});

router.get('/recordatorios/:id_usuario', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM recordatorios WHERE id_usuario = ? ORDER BY fecha_hora ASC', 
      [req.params.id_usuario]
    );
    res.json({ ok: true, recordatorios: rows });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener recordatorios" });
  }
});

// ACTUALIZAR UN RECORDATORIO
router.put('/recordatorios/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, fecha_hora, tipo } = req.body;

    const query = "UPDATE recordatorios SET titulo=?, descripcion=?, fecha_hora=?, tipo=? WHERE id_recordatorio=?";

    db.query(query, [titulo, descripcion, fecha_hora, tipo, id], (err, result) => {
        if (err) return res.status(500).json({ ok: false });

        // Enviamos la respuesta para "soltar" al frontend
        res.json({ ok: true }); 
    });
});

// ELIMINAR (DELETE)
router.delete('/recordatorios/:id', (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM recordatorios WHERE id_recordatorio = ?", [id], (err, result) => {
        if (err) {
            return res.status(500).json({ ok: false, msg: "Error al borrar" });
        }
        
        // ¡ESTO ES LO QUE EVITA EL NETWORK ERROR!
        res.status(200).json({ ok: true, msg: "Borrado" });
    });
});

router.post('/preguntar', async (req, res) => {
    const { mensajeUsuario } = req.body;
    
    try {
        // 1. Intento de búsqueda exacta o por frase contenida
        let [rows] = await db.query(
            "SELECT respuesta FROM chatbot_contenido WHERE pregunta LIKE ? OR categoria LIKE ?",
            [`%${mensajeUsuario}%`, `%${mensajeUsuario}%`]
        );

        // 2. Si no hay éxito, buscamos por palabras clave (Razonamiento simple)
        if (rows.length === 0) {
            const palabras = mensajeUsuario.split(' ').filter(p => p.length > 3); // Solo palabras largas
            if (palabras.length > 0) {
                const clausulaOr = palabras.map(() => "pregunta LIKE ?").join(" OR ");
                const valores = palabras.map(p => `%${p}%`);
                [rows] = await db.query(`SELECT respuesta FROM chatbot_contenido WHERE ${clausulaOr} LIMIT 1`, valores);
            }
        }

        // 3. Respuesta final
        if (rows.length > 0) {
            res.json({ respuesta: rows[0].respuesta });
        } else {
            res.json({ 
                respuesta: "No tengo información específica sobre eso, pero puedes preguntarme sobre higiene, ejercicios de memoria o alimentación." 
            });
        }
    } catch (error) {
        res.status(500).json({ respuesta: "Error al consultar la base de datos." });
    }
});

// 4. Actualizar perfil (Nombre y Foto)
router.put('/actualizar-perfil', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    // 1. Verificamos el token de Firebase para sacar el UID de forma segura
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    // 2. Obtenemos los datos que vienen del móvil
    const { nombre, foto_perfil } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    // 3. Ejecutamos el UPDATE en MySQL
    const sql = `
      UPDATE usuarios 
      SET nombre = ?, foto_perfil = ? 
      WHERE uid = ?
    `;

    const [result] = await db.query(sql, [nombre, foto_perfil, uid]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    }

    return res.json({ 
      ok: true, 
      message: 'Perfil actualizado correctamente' 
    });

  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    return res.status(401).json({ error: 'Token inválido o error de servidor' });
  }
});

module.exports = router;