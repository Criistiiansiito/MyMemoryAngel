const request = require('supertest');
const express = require('express');
const mockDb = require('./helpers/mockDb');

jest.mock('../db', () => mockDb);

const db = require('../db');
const recordatoriosRouter = require('../routes/recordatorios.js');

const app = express();
app.use(express.json());
app.use('/recordatorios', recordatoriosRouter);

const getTodayMadrid = () => {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  return `${year}-${month}-${day}`;
};

describe('Recordatorios API', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.resetDbMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  //Verifica que se puede crear un recordatorio valido y devolver su identificador.
  test('POST /recordatorios/crear -> 201', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 123 }]);

    const res = await request(app)
      .post('/recordatorios/crear')
      .send({
        id_usuario: 'abc123XYZ789',
        titulo: 'Tomar un vaso de agua para merendar',
        descripcion: '',
        tipo: 'Hidratacion',
        recurrencia: 'diaria',
        fecha_hora: '2026-05-14 18:00:00',
        tipo_alerta: 'sonora',
      });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.id_recordatorio).toBe(123);
  });

  //Verifica que el calendario exige rango de fechas para consultar recordatorios.
  test('GET /recordatorios/calendario/:id sin from/to -> 400', async () => {
    const res = await request(app).get('/recordatorios/calendario/abc123XYZ789');

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  //Verifica que el listado de hoy incluye ocurrencias puntuales y recurrentes aplicables.
  test('GET /recordatorios/hoy/:id devuelve ocurrencias segun recurrencia', async () => {
    const today = getTodayMadrid();

    db.query
      .mockResolvedValueOnce([
        [
          { id_recordatorio: 1, id_usuario: 'abc123XYZ789', titulo: 'Prueba recordatorio puntual', recurrencia: 'puntual', fecha_hora: `${today} 09:00:00`, activo: 1 },
          { id_recordatorio: 2, id_usuario: 'abc123XYZ789', titulo: 'Prueba recordatorio diario', recurrencia: 'diaria', fecha_hora: `${today} 10:00:00`, activo: 1 },
          { id_recordatorio: 3, id_usuario: 'abc123XYZ789', titulo: 'Prueba recordatorio semanal', recurrencia: 'semanal', fecha_hora: `${today} 11:00:00`, activo: 1 },
          { id_recordatorio: 4, id_usuario: 'abc123XYZ789', titulo: 'Prueba recordatorio mensual', recurrencia: 'mensual', fecha_hora: `${today} 12:00:00`, activo: 1 },
        ],
      ])
      .mockResolvedValueOnce([[]]);

    const res = await request(app).get('/recordatorios/hoy/abc123XYZ789');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.recordatorios).toHaveLength(4);

    const titulos = res.body.recordatorios.map((r) => r.titulo);
    expect(titulos).toEqual(expect.arrayContaining(['Prueba recordatorio puntual', 'Prueba recordatorio diario', 'Prueba recordatorio semanal', 'Prueba recordatorio mensual']));
  });

  //Verifica que el listado de hoy devuelve una lista vacia cuando no hay recordatorios activos.
  test('GET /recordatorios/hoy/:id devuelve lista vacia si no hay recordatorios', async () => {
    db.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[]]);

    const res = await request(app).get('/recordatorios/hoy/abc123XYZ789');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.recordatorios)).toBe(true);
    expect(res.body.recordatorios).toHaveLength(0);
  });

  //Verifica que el listado general devuelve los recordatorios activos del usuario.
  test('GET /recordatorios/:id devuelve recordatorios activos', async () => {
    db.query.mockResolvedValueOnce([[{ id_recordatorio: 1, titulo: 'Tomar agua', activo: 1 }]]);

    const res = await request(app).get('/recordatorios/abc123XYZ789');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.recordatorios).toHaveLength(1);
  });

  //Verifica que el listado de hoy responde 500 si falla la consulta a base de datos.
  test('GET /recordatorios/hoy/:id devuelve 500 ante error de DB', async () => {
    db.query.mockRejectedValueOnce(new Error('DB down'));

    const res = await request(app).get('/recordatorios/hoy/abc123XYZ789');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeTruthy();
  });

  //Verifica que el calendario genera ocurrencias y marca el estado de las pasadas cumplidas.
  test('GET /recordatorios/calendario/:id genera ocurrencias con estado_calendario', async () => {
    db.query
      .mockResolvedValueOnce([[
        { id_recordatorio: 1, id_usuario: 'abc123XYZ789', titulo: 'Prueba diaria', recurrencia: 'diaria', fecha_hora: '2026-05-17 09:00:00', activo: 1 },
      ]])
      .mockResolvedValueOnce([[
        { id_recordatorio: 1, fecha_ocurrencia: '2026-05-17', cumplido: 1 },
      ]]);

    const res = await request(app).get('/recordatorios/calendario/abc123XYZ789?from=2026-05-17&to=2026-05-18');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.recordatorios).toHaveLength(2);
    expect(res.body.recordatorios[0].estado_calendario).toBe('cumplido');
    expect(res.body.recordatorios[1].fecha_ocurrencia).toBe('2026-05-18');
  });

  //Verifica que marcar un recordatorio como cumplido guarda la ocurrencia correctamente.
  test('PUT /recordatorios/:id/cumplido con true -> ok', async () => {
    db.query.mockResolvedValueOnce([{}]);

    const res = await request(app)
      .put('/recordatorios/10/cumplido')
      .send({ cumplido: true, fecha_ocurrencia: '2026-05-15' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(db.query).toHaveBeenCalled();
  });

  //Verifica que desmarcar un recordatorio cumplido elimina la ocurrencia registrada.
  test('PUT /recordatorios/:id/cumplido con false elimina ocurrencia', async () => {
    db.query.mockResolvedValueOnce([{}]);

    const res = await request(app)
      .put('/recordatorios/10/cumplido')
      .send({ cumplido: false, fecha_ocurrencia: '2026-05-15' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM recordatorios_cumplidos'),
      ['10', '2026-05-15']
    );
  });

  //Verifica que un recordatorio puede actualizarse con todos sus campos editables.
  test('PUT /recordatorios/:id -> ok al actualizar', async () => {
    db.query.mockResolvedValueOnce([{}]);

    const res = await request(app)
      .put('/recordatorios/10')
      .send({
        titulo: 'Nuevo titulo',
        descripcion: 'Nueva descripcion',
        fecha_hora: '2026-05-16 10:00:00',
        tipo: 'Medicina',
        recurrencia: 'diaria',
        tipo_alerta: 'sonora',
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  //Verifica que un recordatorio puede eliminarse correctamente.
  test('DELETE /recordatorios/:id -> ok al eliminar', async () => {
    db.query.mockResolvedValueOnce([{}]);

    const res = await request(app).delete('/recordatorios/10');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  //Verifica que guardar un push token exige autenticacion.
  test('POST /recordatorios/push-token -> 401 sin token', async () => {
    const res = await request(app)
      .post('/recordatorios/push-token')
      .send({ expo_push_token: 'ExponentPushToken[token]', platform: 'android' });

    expect(res.status).toBe(401);
  });
});
