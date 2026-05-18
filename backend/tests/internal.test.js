const request = require('supertest');
const express = require('express');

jest.mock('../notificationsWorker', () => ({
  ejecutarRecordatoriosPendientes: jest.fn(),
}));

const worker = require('../notificationsWorker');
const internalRouter = require('../routes/internal');

const app = express();
app.use(express.json());
app.use('/internal', internalRouter);

describe('Internal API', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.INTERNAL_CRON_SECRET = 'secret-test';
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  //Verifica que la ejecucion interna de recordatorios requiere el secreto configurado.
  test('GET /internal/run-reminders -> 401 sin secreto', async () => {
    const res = await request(app).get('/internal/run-reminders');
    expect(res.status).toBe(401);
  });

  //Verifica que el endpoint GET ejecuta el worker cuando recibe el token por query.
  test('GET /internal/run-reminders -> ok con token query', async () => {
    worker.ejecutarRecordatoriosPendientes.mockResolvedValue(3);
    const res = await request(app).get('/internal/run-reminders?token=secret-test');
    expect(res.status).toBe(200);
    expect(res.body.revisados).toBe(3);
  });

  //Verifica que el endpoint POST ejecuta el worker cuando recibe el secreto por header.
  test('POST /internal/run-reminders -> ok con header secreto', async () => {
    worker.ejecutarRecordatoriosPendientes.mockResolvedValue(5);
    const res = await request(app)
      .post('/internal/run-reminders')
      .set('x-cron-secret', 'secret-test');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.revisados).toBe(5);
  });

  //Verifica que el endpoint propaga un error 500 si falla el worker de recordatorios.
  test('POST /internal/run-reminders -> 500 si worker falla', async () => {
    worker.ejecutarRecordatoriosPendientes.mockRejectedValue(new Error('boom'));
    const res = await request(app)
      .post('/internal/run-reminders')
      .set('x-cron-secret', 'secret-test');

    expect(res.status).toBe(500);
    expect(res.body.ok).toBe(false);
  });

  //Verifica que el endpoint interno rechaza la peticion si no hay secreto configurado.
  test('GET /internal/run-reminders -> 401 si no existe secreto configurado', async () => {
    delete process.env.INTERNAL_CRON_SECRET;

    const res = await request(app).get('/internal/run-reminders?token=secret-test');

    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });
});
