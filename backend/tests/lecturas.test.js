const request = require('supertest');
const express = require('express');
const mockDb = require('./helpers/mockDb');

jest.mock('../db', () => mockDb);

const db = require('../db');
const lecturasRouter = require('../routes/lecturas');

const app = express();
app.use(express.json());
app.use('/lecturas', lecturasRouter);

describe('Lecturas API', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.resetDbMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  //Verifica que el listado de lecturas devuelve resultados filtrados por tipo.
  test('GET /lecturas/get-lecturas devuelve resultados por tipo', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1, tipo: 'poesia', titulo: 'Cantar de Primavera' }]]);

    const res = await request(app).get('/lecturas/get-lecturas?tipo=poesia');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  //Verifica que el listado responde 500 si la consulta a base de datos falla.
  test('GET /lecturas/get-lecturas -> 500 si falla la base de datos', async () => {
    db.query.mockRejectedValueOnce(new Error('db fail'));
    const res = await request(app).get('/lecturas/get-lecturas?tipo=reminiscencia');
    expect(res.status).toBe(500);
  });

  //Verifica que la consulta recibe exactamente el tipo solicitado por query.
  test('GET /lecturas/get-lecturas pasa el tipo a la consulta', async () => {
    db.query.mockResolvedValueOnce([[{ id: 2, tipo: 'historia', titulo: 'Recuerdos de verano' }]]);

    const res = await request(app).get('/lecturas/get-lecturas?tipo=historia');

    expect(res.status).toBe(200);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE tipo = ?'),
      ['historia']
    );
  });
});
