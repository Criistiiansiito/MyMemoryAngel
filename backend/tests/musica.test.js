const request = require('supertest');
const express = require('express');
const mockDb = require('./helpers/mockDb');

jest.mock('../db', () => mockDb);

const db = require('../db');
const musicaRouter = require('../routes/musica');

const app = express();
app.use(express.json());
app.use('/musica', musicaRouter);

describe('Musica API', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.resetDbMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  //Verifica que la musica general se filtra por el tipo interno esperado.
  test('GET /musica/get-musica filtra por tipo normal', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1, tipo: 'clasica' }]]);

    const res = await request(app).get('/musica/get-musica?tipo=clasica&id_usuario=abc123XYZ789');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE tipo = ?'),
      ['clasica']
    );
  });

  //Verifica que la musica personal aplica tambien el filtro por usuario.
  test('GET /musica/get-musica en tipo personal aniade filtro por usuario', async () => {
    db.query.mockResolvedValueOnce([[{ id: 2, tipo: 'personal' }]]);

    const res = await request(app).get('/musica/get-musica?tipo=personal&id_usuario=abc123XYZ789');

    expect(res.status).toBe(200);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('id_usuario = ? OR id_usuario IS NULL'),
      ['personal', 'abc123XYZ789']
    );
  });

  //Verifica que el listado de musica responde 500 si falla la base de datos.
  test('GET /musica/get-musica -> 500 en error DB', async () => {
    db.query.mockRejectedValueOnce(new Error('db fail'));
    const res = await request(app).get('/musica/get-musica?tipo=personal&id_usuario=abc123XYZ789');
    expect(res.status).toBe(500);
  });

  //Verifica que no se puede insertar musica si no se adjunta un archivo.
  test('POST /musica/insert-musica falla sin archivo', async () => {
    const res = await request(app)
      .post('/musica/insert-musica')
      .field('titulo', 'Queen - Bohemian Rhapsody')
      .field('tipo', 'personal')
      .field('id_usuario', 'abc123XYZ789');

    expect(res.status).toBe(400);
  });

  //Verifica que solo se aceptan archivos MP3 al subir musica.
  test('POST /musica/insert-musica rechaza mimetype no mp3', async () => {
    const res = await request(app)
      .post('/musica/insert-musica')
      .field('titulo', 'Michael Jackson - Billie Jean')
      .field('tipo', 'personal')
      .field('id_usuario', 'abc123XYZ789')
      .attach('audio', Buffer.from('abc'), { filename: 'a.wav', contentType: 'audio/wav' });

    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/MP3/);
  });

  //Verifica que un MP3 valido se inserta correctamente.
  test('POST /musica/insert-musica inserta con mp3', async () => {
    db.query.mockResolvedValueOnce([{}]);

    const res = await request(app)
      .post('/musica/insert-musica')
      .field('titulo', 'Michael Jackson - Billie Jean')
      .field('tipo', 'personal')
      .field('id_usuario', 'abc123XYZ789')
      .attach('audio', Buffer.from('abc'), { filename: 'a.mp3', contentType: 'audio/mpeg' });

    expect(res.status).toBe(200);
    expect(res.body.res).toBe('ok');
  });

  //Verifica que tambien se aceptan archivos con mimetype audio/mp3.
  test('POST /musica/insert-musica acepta mimetype audio/mp3', async () => {
    db.query.mockResolvedValueOnce([{}]);

    const res = await request(app)
      .post('/musica/insert-musica')
      .field('titulo', 'Queen - Bohemian Rhapsody')
      .field('tipo', 'personal')
      .field('id_usuario', 'abc123XYZ789')
      .attach('audio', Buffer.from('abc'), { filename: 'a.mp3', contentType: 'audio/mp3' });

    expect(res.status).toBe(200);
    expect(res.body.res).toBe('ok');
  });

  //Verifica que un fallo al insertar la musica devuelve un error interno.
  test('POST /musica/insert-musica -> 500 si falla la base de datos', async () => {
    db.query.mockRejectedValueOnce(new Error('db fail'));

    const res = await request(app)
      .post('/musica/insert-musica')
      .field('titulo', 'Michael Jackson - Billie Jean')
      .field('tipo', 'personal')
      .field('id_usuario', 'abc123XYZ789')
      .attach('audio', Buffer.from('abc'), { filename: 'a.mp3', contentType: 'audio/mpeg' });

    expect(res.status).toBe(500);
    expect(res.text).toMatch(/Error interno/i);
  });
});
