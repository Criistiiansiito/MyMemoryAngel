jest.mock('axios', () => ({
  get: jest.fn(),
  put: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
}));

import axios from 'axios';
import { configuracionPerfil } from '../../src/services/configuracionPerfil';

describe('configuracionPerfil service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.localStorage.getItem = jest.fn().mockReturnValue('token-web');
  });

  //Verifica que se solicita el perfil autenticado del usuario actual.
  test('obtenerPerfil usa el token en la cabecera', async () => {
    axios.get.mockResolvedValueOnce({ data: { ok: true, usuario: { uid: 'u1' } } });

    const data = await configuracionPerfil.obtenerPerfil();

    expect(data).toEqual({ ok: true, usuario: { uid: 'u1' } });
    expect(axios.get).toHaveBeenCalledWith(
      'http://api.test/perfil/profile',
      { headers: { Authorization: 'Bearer token-web' } }
    );
  });

  //Verifica que la actualizacion del perfil envia los campos normalizados al backend.
  test('actualizarPerfil envia nombre, foto y fecha', async () => {
    axios.put.mockResolvedValueOnce({ data: { ok: true } });

    const data = await configuracionPerfil.actualizarPerfil('Cristian', null, '2003-01-01');

    expect(data).toEqual({ ok: true });
    expect(axios.put).toHaveBeenCalledWith(
      'http://api.test/perfil/actualizar-perfil',
      { nombre: 'Cristian', foto_perfil: null, fecha_nacimiento: '2003-01-01' },
      { headers: { Authorization: 'Bearer token-web' } }
    );
  });

  //Verifica que la actualizacion del perfil de un paciente usa la ruta especifica del paciente.
  test('actualizarPerfilPaciente usa el endpoint del paciente', async () => {
    axios.put.mockResolvedValueOnce({ data: { ok: true } });

    const data = await configuracionPerfil.actualizarPerfilPaciente('p1', { nombre: 'Ana' });

    expect(data).toEqual({ ok: true });
    expect(axios.put).toHaveBeenCalledWith(
      'http://api.test/perfil/paciente-profile/p1',
      { nombre: 'Ana' },
      { headers: { Authorization: 'Bearer token-web' } }
    );
  });

  //Verifica que la configuracion de accesibilidad devuelve la respuesta completa de axios.
  test('actualizarAccesibilidad devuelve la respuesta de axios', async () => {
    const response = { data: { ok: true } };
    axios.put.mockResolvedValueOnce(response);

    const data = await configuracionPerfil.actualizarAccesibilidad({ tamano_texto: 'Grande' });

    expect(data).toBe(response);
    expect(axios.put).toHaveBeenCalledWith(
      'http://api.test/perfil/actualizar-accesibilidad',
      { tamano_texto: 'Grande' },
      { headers: { Authorization: 'Bearer token-web' } }
    );
  });
});
