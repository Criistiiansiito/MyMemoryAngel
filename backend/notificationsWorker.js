const cron = require('node-cron');
const db = require('./db');
const { sendPushNotifications } = require('./pushNotifications');
const MADRID_TIMEZONE = 'Europe/Madrid';

const getMadridNowParts = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat('sv-SE', {
        timeZone: MADRID_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        weekday: 'long',
        hour12: false,
    }).formatToParts(date);

    const getPart = (type) => parts.find((part) => part.type === type)?.value;
    const weekdayMap = {
        domingo: 'domingo',
        lunes: 'lunes',
        martes: 'martes',
        miércoles: 'miercoles',
        jueves: 'jueves',
        viernes: 'viernes',
        sábado: 'sabado',
    };

    return {
        horaActual: `${getPart('hour')}:${getPart('minute')}`,
        fechaHoy: `${getPart('year')}-${getPart('month')}-${getPart('day')}`,
        nombreDiaHoy: weekdayMap[getPart('weekday')] || getPart('weekday'),
    };
};

const ejecutarRecordatoriosPendientes = async () => {
    const ahora = new Date();
    const { horaActual, fechaHoy, nombreDiaHoy } = getMadridNowParts(ahora);

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

        const opciones = { weekday: 'long', day: 'numeric', month: 'long', timeZone: MADRID_TIMEZONE };
        let fechaFormateada = ahora.toLocaleDateString('es-ES', opciones);
        fechaFormateada = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

        await sendPushNotifications(tokens, {
            title: `${icono} ${rec.titulo}`,
            body: `${fechaFormateada} a las ${horaActual}`,
            sound: rec.tipo_alerta === 'visual' ? null : 'default',
            channelId: 'default',
            categoryId: 'recordatorio-actions',
            priority: 'high',
            data: {
                id_recordatorio: String(rec.id_recordatorio),
                id_usuario: rec.id_usuario,
                tipo: rec.tipo || 'otro',
            },
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
