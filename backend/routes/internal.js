const express = require('express');
const router = express.Router();
const { ejecutarRecordatoriosPendientes } = require('../notificationsWorker');

const validarSecreto = (req) => {
  const expected = process.env.INTERNAL_CRON_SECRET;
  if (!expected) return false;

  const tokenFromQuery = req.query?.token;
  const tokenFromHeader = req.headers['x-cron-secret'];

  return tokenFromQuery === expected || tokenFromHeader === expected;
};

const ejecutar = async (req, res) => {
  if (!validarSecreto(req)) {
    return res.status(401).json({ ok: false, error: 'No autorizado' });
  }

  try {
    const total = await ejecutarRecordatoriosPendientes();
    return res.json({ ok: true, revisados: total });
  } catch (error) {
    console.error('Error ejecutando recordatorios por endpoint interno:', error);
    return res.status(500).json({ ok: false, error: 'Error ejecutando recordatorios' });
  }
};

router.get('/run-reminders', ejecutar);
router.post('/run-reminders', ejecutar);

module.exports = router;
