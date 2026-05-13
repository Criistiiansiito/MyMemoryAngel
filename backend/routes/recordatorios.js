const express = require('express');
const db = require('../db');

const router = express.Router();
const MADRID_TIMEZONE = 'Europe/Madrid';

const toDateOnly = (value) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = new Date(value);
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: MADRID_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  return `${year}-${month}-${day}`;
};

const addDays = (dateString, amount) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return toDateOnly(date);
};

const compareDateOnly = (a, b) => {
  if (a === b) return 0;
  return a < b ? -1 : 1;
};

const getDateTimeParts = (value) => {
  if (!value) {
    return { date: null, time: '00:00:00' };
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return {
      date: toDateOnly(value),
      time: value.toTimeString().slice(0, 8),
    };
  }

  const raw = String(value).trim();
  const [datePart, timePart] = raw.split(' ');

  if (!datePart) {
    return { date: null, time: '00:00:00' };
  }

  if (datePart.includes('T')) {
    const [isoDate, isoTime = '00:00:00'] = datePart.split('T');
    return {
      date: isoDate,
      time: isoTime.slice(0, 8),
    };
  }

  return {
    date: datePart.slice(0, 10),
    time: (timePart || '00:00:00').slice(0, 8),
  };
};

const occursOnDate = (recordatorio, targetDate) => {
  const { date: startDate } = getDateTimeParts(recordatorio.fecha_hora);
  if (!startDate) return false;
  if (compareDateOnly(targetDate, startDate) < 0) return false;

  const recurrencia = (recordatorio.recurrencia || 'puntual').toLowerCase();
  if (recurrencia === 'puntual') {
    return startDate === targetDate;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const target = new Date(`${targetDate}T00:00:00`);
  const diffDays = Math.floor((target - start) / (1000 * 60 * 60 * 24));

  if (recurrencia === 'diaria') {
    return diffDays >= 0;
  }

  if (recurrencia === 'semanal') {
    return diffDays >= 0 && diffDays % 7 === 0;
  }

  if (recurrencia === 'mensual') {
    return (
      target.getDate() === start.getDate() &&
      (
        target.getFullYear() > start.getFullYear() ||
        (target.getFullYear() === start.getFullYear() && target.getMonth() >= start.getMonth())
      )
    );
  }

  return startDate === targetDate;
};

const buildOccurrence = (recordatorio, dateString, cumplidosMap, todayString) => {
  const { time: timePart } = getDateTimeParts(recordatorio.fecha_hora);
  const fechaHora = (recordatorio.recurrencia || 'puntual').toLowerCase() === 'puntual'
    ? recordatorio.fecha_hora
    : `${dateString} ${timePart}`;

  const cumplido = cumplidosMap.get(`${recordatorio.id_recordatorio}|${dateString}`) ? 1 : 0;
  let estadoCalendario = null;
  if (compareDateOnly(dateString, todayString) < 0) {
    estadoCalendario = cumplido ? 'cumplido' : 'incumplido';
  } else if (dateString === todayString && cumplido) {
    estadoCalendario = 'cumplido';
  }

  return {
    ...recordatorio,
    fecha_hora: fechaHora,
    fecha_ocurrencia: dateString,
    cumplido,
    estado_calendario: estadoCalendario,
  };
};

const getCumplidosMap = async (recordatorioIds, fromDate, toDate) => {
  if (recordatorioIds.length === 0) {
    return new Map();
  }

  const placeholders = recordatorioIds.map(() => '?').join(', ');
  const [rows] = await db.query(
    `
      SELECT id_recordatorio, fecha_ocurrencia
      FROM recordatorios_cumplidos
      WHERE id_recordatorio IN (${placeholders})
        AND fecha_ocurrencia BETWEEN ? AND ?
        AND cumplido = 1
    `,
    [...recordatorioIds, fromDate, toDate]
  );

  return new Map(
    rows.map((row) => [`${row.id_recordatorio}|${toDateOnly(row.fecha_ocurrencia)}`, true])
  );
};

router.post('/crear', async (req, res) => {
  const { id_usuario, titulo, descripcion, tipo, recurrencia, fecha_hora, tipo_alerta } = req.body;
  try {
    const sql = 'INSERT INTO recordatorios (id_usuario, titulo, descripcion, tipo, recurrencia, fecha_hora, tipo_alerta, activo) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)';
    const [result] = await db.query(sql, [id_usuario, titulo, descripcion, tipo, recurrencia, fecha_hora, tipo_alerta]);
    res.status(201).json({ ok: true, id_recordatorio: result.insertId });
  } catch (_err) {
    res.status(500).json({ error: 'Error al guardar' });
  }
});

router.get('/hoy/:id_usuario', async (req, res) => {
  try {
    const today = toDateOnly(new Date());
    const [rows] = await db.query(
      'SELECT * FROM recordatorios WHERE id_usuario = ? AND activo = TRUE ORDER BY fecha_hora ASC',
      [req.params.id_usuario]
    );

    const recordatorioIds = rows.map((row) => row.id_recordatorio);
    const cumplidosMap = await getCumplidosMap(recordatorioIds, today, today);

    const ocurrencias = rows
      .filter((row) => occursOnDate(row, today))
      .map((row) => buildOccurrence(row, today, cumplidosMap, today));

    res.json({ ok: true, recordatorios: ocurrencias });
  } catch (err) {
    console.error('Error en /hoy:', err?.stack || err);
    res.status(500).json({ error: err?.message || 'Error al obtener' });
  }
});

router.get('/:id_usuario', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM recordatorios WHERE id_usuario = ? AND activo = TRUE ORDER BY fecha_hora ASC',
      [req.params.id_usuario]
    );

    res.json({ ok: true, recordatorios: rows });
  } catch (err) {
    console.error('Error en /:id_usuario:', err?.stack || err);
    res.status(500).json({ ok: false, error: err?.message || 'Error al obtener recordatorios' });
  }
});

router.get('/calendario/:id_usuario', async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ ok: false, error: 'Rango de fechas requerido' });
    }

    const today = toDateOnly(new Date());
    const [rows] = await db.query(
      'SELECT * FROM recordatorios WHERE id_usuario = ? AND activo = TRUE ORDER BY fecha_hora ASC',
      [req.params.id_usuario]
    );

    const recordatorioIds = rows.map((row) => row.id_recordatorio);
    const cumplidosMap = await getCumplidosMap(recordatorioIds, from, to);

    const ocurrencias = [];
    let currentDate = from;
    while (compareDateOnly(currentDate, to) <= 0) {
      rows.forEach((row) => {
        if (occursOnDate(row, currentDate)) {
          ocurrencias.push(buildOccurrence(row, currentDate, cumplidosMap, today));
        }
      });
      currentDate = addDays(currentDate, 1);
    }

    res.json({ ok: true, recordatorios: ocurrencias });
  } catch (err) {
    console.error('Error en /calendario:', err?.stack || err);
    res.status(500).json({ ok: false, error: err?.message || 'Error al obtener recordatorios del calendario' });
  }
});

router.put('/:id', async (req, res) => {
  const { titulo, descripcion, fecha_hora, tipo, recurrencia, tipo_alerta } = req.body;
  try {
    await db.query(
      'UPDATE recordatorios SET titulo=?, descripcion=?, fecha_hora=?, tipo=?, recurrencia=?, tipo_alerta=? WHERE id_recordatorio=?',
      [titulo, descripcion, fecha_hora, tipo, recurrencia, tipo_alerta, req.params.id]
    );
    res.json({ ok: true });
  } catch (_err) {
    res.status(500).json({ ok: false });
  }
});

router.put('/:id/cumplido', async (req, res) => {
  const { cumplido, fecha_ocurrencia } = req.body;
  try {
    const fechaFinal = fecha_ocurrencia || toDateOnly(new Date());
    if (cumplido) {
      await db.query(
        `
          INSERT INTO recordatorios_cumplidos (id_recordatorio, fecha_ocurrencia, cumplido)
          VALUES (?, ?, 1)
          ON DUPLICATE KEY UPDATE
            cumplido = 1,
            cumplido_en = CURRENT_TIMESTAMP
        `,
        [req.params.id, fechaFinal]
      );
    } else {
      await db.query(
        'DELETE FROM recordatorios_cumplidos WHERE id_recordatorio = ? AND fecha_ocurrencia = ?',
        [req.params.id, fechaFinal]
      );
    }
    res.json({ ok: true });
  } catch (_err) {
    res.status(500).json({ ok: false });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM recordatorios WHERE id_recordatorio = ?', [req.params.id]);
    res.status(200).json({ ok: true });
  } catch (_err) {
    res.status(500).json({ ok: false });
  }
});

module.exports = router;
