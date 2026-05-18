const request = require('supertest');
const express = require('express');
const mockDb = require('./helpers/mockDb');

jest.mock('../db', () => mockDb);

jest.mock('../firebaseAdmin', () => ({
  auth: jest.fn(),
}));

const db = require('../db');
const admin = require('../firebaseAdmin');
const vinculacionesRouter = require('../routes/vinculaciones.js');

const app = express();
app.use(express.json());
app.use('/vinculaciones', vinculacionesRouter);

describe('Vinculaciones API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.resetDbMocks();
    admin.auth.mockReset();
  });

  //Verifica que vincular un paciente requiere un token de autenticacion.
  test('POST /vinculaciones/vincular-paciente devuelve 401 sin token', async () => {
    const res = await request(app)
      .post('/vinculaciones/vincular-paciente')
      .send({ id_paciente: 'abc123XYZ789' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Token faltante/);
  });

  //Verifica que el endpoint valida que se envie el identificador del paciente.
  test('POST /vinculaciones/vincular-paciente devuelve 400 sin id_paciente', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'def123XYZ789' });
    admin.auth.mockReturnValue({ verifyIdToken });

    const res = await request(app)
      .post('/vinculaciones/vincular-paciente')
      .set('Authorization', 'Bearer token-valido')
      .send({});

    expect(res.status).toBe(400);
  });

  //Verifica que la vinculacion se guarda correctamente cuando la peticion es valida.
  test('POST /vinculaciones/vincular-paciente devuelve ok en caso feliz', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'def123XYZ789' });
    admin.auth.mockReturnValue({ verifyIdToken });
    db.query.mockResolvedValueOnce([{}]);

    const res = await request(app)
      .post('/vinculaciones/vincular-paciente')
      .set('Authorization', 'Bearer token-valido')
      .send({ id_paciente: 'abc123XYZ789' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  //Verifica que un intento duplicado de vinculacion devuelve un error controlado.
  test('POST /vinculaciones/vincular-paciente devuelve error controlado en duplicado', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'def123XYZ789' });
    admin.auth.mockReturnValue({ verifyIdToken });

    const duplicateError = new Error('Duplicate entry');
    duplicateError.code = 'ER_DUP_ENTRY';
    db.query.mockRejectedValueOnce(duplicateError);

    const res = await request(app)
      .post('/vinculaciones/vincular-paciente')
      .set('Authorization', 'Bearer token-valido')
      .send({ id_paciente: 'abc123XYZ789' });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/Ya est/);
  });

  //Verifica que un cuidador autenticado puede listar sus pacientes vinculados.
  test('GET /vinculaciones/mis-pacientes devuelve lista', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'def123XYZ789' });
    admin.auth.mockReturnValue({ verifyIdToken });

    db.query.mockResolvedValueOnce([
      [{ uid: 'abc123XYZ789', nombre: 'Cristian', correo: 'cris@test.com' }],
    ]);

    const res = await request(app)
      .get('/vinculaciones/mis-pacientes')
      .set('Authorization', 'Bearer token-valido');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.pacientes)).toBe(true);
    expect(res.body.pacientes).toHaveLength(1);
  });

  //Verifica que se puede consultar un paciente concreto cuando existe.
  test('GET /vinculaciones/paciente/:id devuelve paciente', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'def123XYZ789' });
    admin.auth.mockReturnValue({ verifyIdToken });
    db.query.mockResolvedValueOnce([[{ nombre: 'Cristian', tipo_usuario: 'paciente' }]]);

    const res = await request(app)
      .get('/vinculaciones/paciente/abc123XYZ789')
      .set('Authorization', 'Bearer token-valido');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.paciente.nombre).toBe('Cristian');
  });

  //Verifica que consultar un paciente devuelve 404 cuando no existe.
  test('GET /vinculaciones/paciente/:id devuelve 404 si no existe', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'def123XYZ789' });
    admin.auth.mockReturnValue({ verifyIdToken });
    db.query.mockResolvedValueOnce([[]]);

    const res = await request(app)
      .get('/vinculaciones/paciente/no-existe')
      .set('Authorization', 'Bearer token-valido');

    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
  });
});
