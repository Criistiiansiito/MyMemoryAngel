const request = require('supertest');
const express = require('express');
const mockDb = require('./helpers/mockDb');

jest.mock('../db', () => mockDb);
jest.mock('../firebaseAdmin', () => ({ auth: jest.fn() }));

const db = require('../db');
const admin = require('../firebaseAdmin');
const authRouter = require('../routes/auth');

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.resetDbMocks();
    admin.auth.mockReset();
  });

  //Verifica que la sincronizacion de usuario exige un token de autenticacion.
  test('POST /auth/sync -> 401 sin token', async () => {
    const res = await request(app).post('/auth/sync').send({ nombre: 'Cristian' });
    expect(res.status).toBe(401);
  });

  //Verifica que la sincronizacion completa la transaccion cuando el token es valido.
  test('POST /auth/sync -> ok con transaccion', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'abc123XYZ789', email: 'cris@test.com' });
    admin.auth.mockReturnValue({ verifyIdToken });

    const connection = {
      beginTransaction: jest.fn().mockResolvedValue(),
      query: jest.fn().mockResolvedValue([{}]),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      release: jest.fn(),
    };
    db.getConnection.mockResolvedValue(connection);

    const res = await request(app)
      .post('/auth/sync')
      .set('Authorization', 'Bearer token')
      .send({ nombre: 'Cristian', tipo_usuario: 'paciente' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(connection.beginTransaction).toHaveBeenCalled();
    expect(connection.commit).toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
  });

  //Verifica que se hace rollback y se responde error si falla la verificacion del token.
  test('POST /auth/sync -> 500 y rollback si falla verifyIdToken', async () => {
    const verifyIdToken = jest.fn().mockRejectedValue(new Error('bad token'));
    admin.auth.mockReturnValue({ verifyIdToken });

    const connection = {
      beginTransaction: jest.fn().mockResolvedValue(),
      query: jest.fn().mockResolvedValue([{}]),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      release: jest.fn(),
    };
    db.getConnection.mockResolvedValue(connection);

    const res = await request(app)
      .post('/auth/sync')
      .set('Authorization', 'Bearer token')
      .send({ nombre: 'Cristian' });

    expect(res.status).toBe(500);
    expect(connection.rollback).toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
  });

  //Verifica que el tipo de usuario por defecto es paciente cuando no se envia en la peticion.
  test('POST /auth/sync -> usa tipo_usuario por defecto', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'abc123XYZ789', email: 'cris@test.com' });
    admin.auth.mockReturnValue({ verifyIdToken });

    const connection = {
      beginTransaction: jest.fn().mockResolvedValue(),
      query: jest.fn().mockResolvedValue([{}]),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      release: jest.fn(),
    };
    db.getConnection.mockResolvedValue(connection);

    const res = await request(app)
      .post('/auth/sync')
      .set('Authorization', 'Bearer token')
      .send({ nombre: 'Cristian' });

    expect(res.status).toBe(200);
    expect(connection.query).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      expect.arrayContaining(['abc123XYZ789', 'Cristian', null, 'cris@test.com', null, 'paciente', null, expect.any(Date)])
    );
  });

  //Verifica que se hace rollback si una query falla despues de iniciar la transaccion.
  test('POST /auth/sync -> 500 y rollback si falla una query', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'abc123XYZ789', email: 'cris@test.com' });
    admin.auth.mockReturnValue({ verifyIdToken });

    const connection = {
      beginTransaction: jest.fn().mockResolvedValue(),
      query: jest.fn()
        .mockResolvedValueOnce([{}])
        .mockRejectedValueOnce(new Error('db fail')),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      release: jest.fn(),
    };
    db.getConnection.mockResolvedValue(connection);

    const res = await request(app)
      .post('/auth/sync')
      .set('Authorization', 'Bearer token')
      .send({ nombre: 'Cristian' });

    expect(res.status).toBe(500);
    expect(connection.rollback).toHaveBeenCalled();
    expect(connection.commit).not.toHaveBeenCalled();
  });
});
