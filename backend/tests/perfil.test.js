const request = require('supertest');
const express = require('express');
const mockDb = require('./helpers/mockDb');

jest.mock('../db', () => mockDb);
jest.mock('../firebaseAdmin', () => ({ auth: jest.fn() }));

const db = require('../db');
const admin = require('../firebaseAdmin');
const perfilRouter = require('../routes/perfil');

const app = express();
app.use(express.json());
app.use('/perfil', perfilRouter);

describe('Perfil API', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.resetDbMocks();
    admin.auth.mockReset();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  //Verifica que el perfil del usuario requiere autenticacion.
  test('GET /perfil/profile -> 401 sin token', async () => {
    const res = await request(app).get('/perfil/profile');
    expect(res.status).toBe(401);
  });

  //Verifica que el perfil responde 404 si el usuario autenticado no existe en base de datos.
  test('GET /perfil/profile -> 404 si usuario no existe', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'abc123XYZ789' });
    admin.auth.mockReturnValue({ verifyIdToken });
    db.query.mockResolvedValueOnce([[]]);

    const res = await request(app)
      .get('/perfil/profile')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(404);
  });

  //Verifica que el perfil devuelve los datos del usuario autenticado cuando existe.
  test('GET /perfil/profile -> 200 con usuario', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'abc123XYZ789' });
    admin.auth.mockReturnValue({ verifyIdToken });
    db.query.mockResolvedValueOnce([[{ uid: 'abc123XYZ789', nombre: 'Cristian' }]]);

    const res = await request(app)
      .get('/perfil/profile')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.usuario.uid).toBe('abc123XYZ789');
  });

  //Verifica que el perfil devuelve 401 cuando el token no es valido.
  test('GET /perfil/profile -> 401 con token invalido', async () => {
    const verifyIdToken = jest.fn().mockRejectedValue(new Error('bad token'));
    admin.auth.mockReturnValue({ verifyIdToken });

    const res = await request(app)
      .get('/perfil/profile')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(401);
  });

  //Verifica que la configuracion de accesibilidad no puede actualizarse sin token.
  test('PUT /perfil/actualizar-accesibilidad -> 401 sin token', async () => {
    const res = await request(app).put('/perfil/actualizar-accesibilidad').send({ tamano_texto: 'Grande', modo_daltonico: true });
    expect(res.status).toBe(401);
  });

  //Verifica que la configuracion de accesibilidad se actualiza con autenticacion valida.
  test('PUT /perfil/actualizar-accesibilidad -> 200 actualiza', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'abc123XYZ789' });
    admin.auth.mockReturnValue({ verifyIdToken });
    db.query.mockResolvedValueOnce([{}]);

    const res = await request(app)
      .put('/perfil/actualizar-accesibilidad')
      .set('Authorization', 'Bearer token')
      .send({ tamano_texto: 'Grande', modo_daltonico: true });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  //Verifica que el modo daltonico se guarda como 0 cuando se envia false.
  test('PUT /perfil/actualizar-accesibilidad -> convierte modo_daltonico a entero', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'abc123XYZ789' });
    admin.auth.mockReturnValue({ verifyIdToken });
    db.query.mockResolvedValueOnce([{}]);

    const res = await request(app)
      .put('/perfil/actualizar-accesibilidad')
      .set('Authorization', 'Bearer token')
      .send({ tamano_texto: 'Mediano', modo_daltonico: false });

    expect(res.status).toBe(200);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE accesibilidad'),
      ['Mediano', 0, 'abc123XYZ789']
    );
  });

  //Verifica que la actualizacion de accesibilidad devuelve 500 si falla la consulta.
  test('PUT /perfil/actualizar-accesibilidad -> 500 si falla la base de datos', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'abc123XYZ789' });
    admin.auth.mockReturnValue({ verifyIdToken });
    db.query.mockRejectedValueOnce(new Error('db fail'));

    const res = await request(app)
      .put('/perfil/actualizar-accesibilidad')
      .set('Authorization', 'Bearer token')
      .send({ tamano_texto: 'Grande', modo_daltonico: true });

    expect(res.status).toBe(500);
  });

  //Verifica que la actualizacion del perfil valida el campo nombre.
  test('PUT /perfil/actualizar-perfil -> 400 sin nombre', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'abc123XYZ789' });
    admin.auth.mockReturnValue({ verifyIdToken });

    const res = await request(app)
      .put('/perfil/actualizar-perfil')
      .set('Authorization', 'Bearer token')
      .send({ nombre: '' });

    expect(res.status).toBe(400);
  });

  //Verifica que los datos basicos del perfil se actualizan correctamente.
  test('PUT /perfil/actualizar-perfil -> 200 en actualizacion', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'abc123XYZ789' });
    admin.auth.mockReturnValue({ verifyIdToken });
    db.query.mockResolvedValueOnce([{}]);

    const res = await request(app)
      .put('/perfil/actualizar-perfil')
      .set('Authorization', 'Bearer token')
      .send({ nombre: 'Cristian', foto_perfil: null, fecha_nacimiento: '2003-01-01' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  //Verifica que una fecha vacia se transforma en null antes de actualizar el perfil.
  test('PUT /perfil/actualizar-perfil -> convierte fecha vacia a null', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'abc123XYZ789' });
    admin.auth.mockReturnValue({ verifyIdToken });
    db.query.mockResolvedValueOnce([{}]);

    const res = await request(app)
      .put('/perfil/actualizar-perfil')
      .set('Authorization', 'Bearer token')
      .send({ nombre: 'Cristian', foto_perfil: 'foto.png', fecha_nacimiento: '   ' });

    expect(res.status).toBe(200);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE usuarios'),
      ['Cristian', 'foto.png', null, 'abc123XYZ789']
    );
  });

  //Verifica que el progreso de juegos exige todos los campos obligatorios.
  test('POST /perfil/progreso-juegos -> 400 si faltan campos', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'abc123XYZ789' });
    admin.auth.mockReturnValue({ verifyIdToken });

    const res = await request(app)
      .post('/perfil/progreso-juegos')
      .set('Authorization', 'Bearer token')
      .send({ juego: 'memoria' });

    expect(res.status).toBe(400);
  });

  //Verifica que se crea un nuevo registro de progreso cuando aun no existe.
  test('POST /perfil/progreso-juegos -> inserta cuando no existe progreso', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'abc123XYZ789' });
    admin.auth.mockReturnValue({ verifyIdToken });
    db.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{}]);

    const res = await request(app)
      .post('/perfil/progreso-juegos')
      .set('Authorization', 'Bearer token')
      .send({ juego: 'memoria', categoria: 'A', puntuacion: 10, ultimo_resultado: 'ok' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  //Verifica que se actualiza el progreso acumulado cuando ya existe un registro previo.
  test('POST /perfil/progreso-juegos -> actualiza cuando existe progreso', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'abc123XYZ789' });
    admin.auth.mockReturnValue({ verifyIdToken });
    db.query
      .mockResolvedValueOnce([[{ partidas_jugadas: 2, promedio_puntuacion: 6, mejor_puntuacion: 8 }]])
      .mockResolvedValueOnce([{}]);

    const res = await request(app)
      .post('/perfil/progreso-juegos')
      .set('Authorization', 'Bearer token')
      .send({ juego: 'memoria', categoria: 'A', puntuacion: 9, ultimo_resultado: 'ok' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  //Verifica que la actualizacion recalcula partidas, promedio y mejor puntuacion.
  test('POST /perfil/progreso-juegos -> recalcula metricas correctamente', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'abc123XYZ789' });
    admin.auth.mockReturnValue({ verifyIdToken });
    db.query
      .mockResolvedValueOnce([[{ partidas_jugadas: 2, promedio_puntuacion: 6, mejor_puntuacion: 8 }]])
      .mockResolvedValueOnce([{}]);

    const res = await request(app)
      .post('/perfil/progreso-juegos')
      .set('Authorization', 'Bearer token')
      .send({ juego: 'memoria', categoria: 'A', puntuacion: 9, ultimo_resultado: 'ok' });

    expect(res.status).toBe(200);
    expect(db.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('UPDATE progreso_juegos'),
      ['A', 3, 9, 7, 'ok', 'abc123XYZ789', 'memoria']
    );
  });

  //Verifica que consultar el progreso de juegos requiere autenticacion.
  test('GET /perfil/progreso-juegos/:user_uid -> 401 sin token', async () => {
    const res = await request(app).get('/perfil/progreso-juegos/abc123XYZ789');
    expect(res.status).toBe(401);
  });

  //Verifica que se puede consultar el progreso de un usuario autenticado con datos existentes.
  test('GET /perfil/progreso-juegos/:user_uid -> 200 con datos', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'cuidador' });
    admin.auth.mockReturnValue({ verifyIdToken });
    db.query.mockResolvedValueOnce([[{ juego: 'memoria' }]]);

    const res = await request(app)
      .get('/perfil/progreso-juegos/abc123XYZ789')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  //Verifica que el asistente del perfil devuelve una respuesta por defecto sin contexto.
  test('POST /perfil/preguntar -> responde fallback', async () => {
    db.query.mockResolvedValueOnce([[]]);
    const res = await request(app).post('/perfil/preguntar').send({ mensajeUsuario: 'x' });
    expect(res.status).toBe(200);
    expect(res.body.respuesta).toMatch(/No tengo/);
  });

  //Verifica que el asistente devuelve una respuesta almacenada cuando encuentra coincidencias.
  test('POST /perfil/preguntar -> responde con contenido encontrado', async () => {
    db.query.mockResolvedValueOnce([[{ respuesta: 'Puedes respirar profundamente.' }]]);

    const res = await request(app)
      .post('/perfil/preguntar')
      .send({ mensajeUsuario: 'respirar' });

    expect(res.status).toBe(200);
    expect(res.body.respuesta).toBe('Puedes respirar profundamente.');
  });

  //Verifica que el asistente responde 500 cuando falla la base de datos.
  test('POST /perfil/preguntar -> 500 si falla la base de datos', async () => {
    db.query.mockRejectedValueOnce(new Error('db fail'));

    const res = await request(app)
      .post('/perfil/preguntar')
      .send({ mensajeUsuario: 'respirar' });

    expect(res.status).toBe(500);
  });

  //Verifica que el perfil de paciente responde 404 si el paciente no existe.
  test('GET /perfil/paciente-profile/:id -> 404 sin paciente', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'cuidador' });
    admin.auth.mockReturnValue({ verifyIdToken });
    db.query.mockResolvedValueOnce([[]]);

    const res = await request(app)
      .get('/perfil/paciente-profile/p1')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(404);
  });

  //Verifica que el perfil de paciente requiere autenticacion.
  test('GET /perfil/paciente-profile/:id -> 401 sin token', async () => {
    const res = await request(app).get('/perfil/paciente-profile/p1');

    expect(res.status).toBe(401);
  });

  //Verifica que la actualizacion del perfil de paciente valida el nombre antes de guardar.
  test('PUT /perfil/paciente-profile/:id -> 400 sin nombre', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'cuidador' });
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
      .put('/perfil/paciente-profile/p1')
      .set('Authorization', 'Bearer token')
      .send({ nombre: '' });

    expect(res.status).toBe(400);
    expect(connection.release).toHaveBeenCalled();
  });

  //Verifica que la actualizacion del perfil de paciente completa la transaccion correctamente.
  test('PUT /perfil/paciente-profile/:id -> 200 con transaccion', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'cuidador' });
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
      .put('/perfil/paciente-profile/p1')
      .set('Authorization', 'Bearer token')
      .send({ nombre: 'Cristian', foto_perfil: null, fecha_nacimiento: '2003-01-01', tamano_texto: 'Mediano', modo_daltonico: false });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(connection.commit).toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
  });

  //Verifica que se hace rollback si una query falla al actualizar el perfil del paciente.
  test('PUT /perfil/paciente-profile/:id -> 500 y rollback si falla una query', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'cuidador' });
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
      .put('/perfil/paciente-profile/p1')
      .set('Authorization', 'Bearer token')
      .send({ nombre: 'Cristian', foto_perfil: null, fecha_nacimiento: '2003-01-01', tamano_texto: 'Mediano', modo_daltonico: false });

    expect(res.status).toBe(500);
    expect(connection.rollback).toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
  });
});
