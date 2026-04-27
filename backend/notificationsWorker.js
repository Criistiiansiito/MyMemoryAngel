const cron = require('node-cron');
const db = require('./db');
const { sendPushNotifications } = require('./pushNotifications');

const ejecutarRecordatoriosPendientes = async () => {
    const ahora = new Date();

    const horaActual = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;
    const anio = ahora.getFullYear();
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
    const dia = ahora.getDate().toString().padStart(2, '0');
    const fechaHoy = `${anio}-${mes}-${dia}`;

    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const nombreDiaHoy = diasSemana[ahora.getDay()];

    console.log(`[${new Date().toLocaleTimeString()}] Buscando: Hora ${horaActual}, Dia ${nombreDiaHoy}, Fecha ${fechaHoy}`);

    const [recordatorios] = await db.query(
        `SELECT r.*, u.nombre as nombre_usuario
         FROM recordatorios r
         JOIN usuarios u ON r.id_usuario = u.uid
         WHERE TIME_FORMAT(r.fecha_hora, '%H:%i') = ?
         AND r.activo = 1
         AND (
             r.recurrencia = 'diaria'
             OR r.recurrencia = ?
             OR (r.recurrencia = 'puntual' AND DATE(r.fecha_hora) = ?)
         )`,
        [horaActual, nombreDiaHoy, fechaHoy]
    );

    for (const rec of recordatorios) {
        const [rows] = await db.query(
            'SELECT expo_push_token FROM device_tokens WHERE user_uid = ? AND activo = 1',
            [rec.id_usuario]
        );

        const tokens = rows.map((row) => row.expo_push_token);

        if (tokens.length === 0) {
            console.log(`No se encontraron tokens para el usuario: ${rec.id_usuario}`);
            continue;
        }

        const iconos = {
            'medicacion': '💊',
            'medicación': '💊',
            'cita medica': '👨‍⚕️',
            'cita médica': '👨‍⚕️',
            'evento personal': '🗓️',
            'hidratacion': '💧',
            'hidratación': '💧',
            'tarea': '📝',
            'otro': '🔔'
        };

        const tipoDB = (rec.tipo || 'otro').toLowerCase().trim();
        const icono = iconos[tipoDB] || '🔔';

        const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
        let fechaFormateada = ahora.toLocaleDateString('es-ES', opciones);
        fechaFormateada = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

        await sendPushNotifications(tokens, {
            title: `${icono} ${rec.titulo}`,
            body: `${fechaFormateada} a las ${horaActual}`,
            sound: rec.tipo_alerta === 'visual' ? null : 'default',
            categoryId: 'recordatorio-actions'
        });

        console.log(`Notificacion enviada para recordatorio ${rec.id_recordatorio}`);
    }

    return recordatorios.length;
};

const iniciarCron = () => {
    console.log('--- Cron Job Inicializado ---');

    cron.schedule('* * * * *', async () => {
        try {
            await ejecutarRecordatoriosPendientes();
        } catch (error) {
            console.error('Error en el cron:', error);
        }
    });
};

module.exports = { iniciarCron, ejecutarRecordatoriosPendientes };
