const express = require('express');
const router = express.Router();
const admin = require('../firebaseAdmin'); 
const db = require('../db'); 

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
        console.error('Sync error:', err);
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

module.exports = router;