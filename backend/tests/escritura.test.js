const request = require('supertest');
const express = require('express');
const mockDb = require('./helpers/mockDb');

jest.mock('../db', () => mockDb);

const db = require('../db');
const escrituraRouter = require('../routes/escritura');

const app = express();
app.use(express.json());
app.use('/escritura', escrituraRouter);

describe('Escritura API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.resetDbMocks();
  });

  //Verifica que el listado de escrituras devuelve las filas recuperadas de base de datos.
  test('GET /escritura/get-escrituras devuelve filas', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1, texto: 'Escrito de prueba' }]]);
    const res = await request(app).get('/escritura/get-escrituras?id_usuario=abc123XYZ789');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });

  //Verifica que el listado responde 500 cuando falla la consulta a base de datos.
  test('GET /escritura/get-escrituras -> 500 error', async () => {
    db.query.mockRejectedValueOnce(new Error('db fail'));
    const res = await request(app).get('/escritura/get-escrituras?id_usuario=abc123XYZ789');
    expect(res.status).toBe(500);
  });

  //Verifica que no se puede crear una escritura si faltan campos obligatorios.
  test('POST /escritura/add-escritura valida campos', async () => {
    const res = await request(app).post('/escritura/add-escritura').send({ id_usuario: 'abc123XYZ789' });
    expect(res.status).toBe(400);
  });

  //Verifica que una escritura valida se guarda correctamente.
  test('POST /escritura/add-escritura guarda correctamente', async () => {
    db.query.mockResolvedValueOnce([{}]);
    const res = await request(app).post('/escritura/add-escritura').send({ id_usuario: 'abc123XYZ789', dia: 'Lunes', texto: 'Escrito de prueba' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  // Verifica que se elimina una escritura existente por identificador.
  test('DELETE /escritura/delete-escritura/:id elimina entrada', async () => {
    db.query.mockResolvedValueOnce([{}]);
    const res = await request(app).delete('/escritura/delete-escritura/9');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/eliminada/i);
  });
});
