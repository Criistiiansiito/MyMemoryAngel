jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

jest.mock('../../src/services/firebase', () => ({
  auth: {
    currentUser: {
      uid: 'abc123XYZ789',
      getIdToken: jest.fn(),
    },
  },
}));

import axios from 'axios';
import { auth } from '../../src/services/firebase';
import { progresoJuegosService } from '../../src/services/progresoJuegosService';

describe('progresoJuegosService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.currentUser.uid = 'abc123XYZ789';
    auth.currentUser.getIdToken.mockResolvedValue('firebase-token');
  });

  //Verifica que guardar progreso envia los datos y el token de Firebase.
  test('guardarProgreso envia body y cabecera de autenticacion', async () => {
    axios.post.mockResolvedValueOnce({ data: { ok: true } });

    const data = await progresoJuegosService.guardarProgreso({
      juego: 'memoria',
      categoria: 'A',
      puntuacion: 10,
      ultimo_resultado: 'ok',
      user_uid: 'paciente-1',
    });

    expect(data).toEqual({ ok: true });
    expect(axios.post).toHaveBeenCalledWith(
      'http://api.test/perfil/progreso-juegos',
      {
        juego: 'memoria',
        categoria: 'A',
        puntuacion: 10,
        ultimo_resultado: 'ok',
        user_uid: 'paciente-1',
      },
      { headers: { Authorization: 'Bearer firebase-token' } }
    );
  });

  //Verifica que obtener progreso de un usuario usa la ruta parametrizada.
  test('obtenerProgreso consulta el endpoint del usuario indicado', async () => {
    axios.get.mockResolvedValueOnce({ data: { ok: true, progreso: [] } });

    const data = await progresoJuegosService.obtenerProgreso('paciente-1');

    expect(data).toEqual({ ok: true, progreso: [] });
    expect(axios.get).toHaveBeenCalledWith(
      'http://api.test/perfil/progreso-juegos/paciente-1',
      { headers: { Authorization: 'Bearer firebase-token' } }
    );
  });

  //Verifica que obtenerProgresoPorPaciente valida que se reciba un uid.
  test('obtenerProgresoPorPaciente falla si falta el uid del paciente', async () => {
    await expect(progresoJuegosService.obtenerProgresoPorPaciente()).rejects.toThrow(
      /requerido/i
    );
  });

  //Verifica que obtenerMiProgreso usa el uid del usuario autenticado.
  test('obtenerMiProgreso reutiliza el uid del usuario actual', async () => {
    axios.get.mockResolvedValueOnce({ data: { ok: true, progreso: [{ juego: 'memoria' }] } });

    const data = await progresoJuegosService.obtenerMiProgreso();

    expect(data).toEqual({ ok: true, progreso: [{ juego: 'memoria' }] });
    expect(axios.get).toHaveBeenCalledWith(
      'http://api.test/perfil/progreso-juegos/abc123XYZ789',
      { headers: { Authorization: 'Bearer firebase-token' } }
    );
  });

  //Verifica que se rechaza la operacion si no existe token de autenticacion.
  test('guardarProgreso falla si no hay token', async () => {
    auth.currentUser.getIdToken.mockResolvedValueOnce(null);

    await expect(
      progresoJuegosService.guardarProgreso({ juego: 'memoria', categoria: 'A' })
    ).rejects.toThrow(/token/i);
  });
});
