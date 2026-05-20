jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
}));

import axios from 'axios';
import { vinculacionesService } from '../../src/services/vinculacionesService';

describe('vinculacionesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.localStorage.getItem = jest.fn().mockReturnValue('token-web');
  });

  //Verifica que se consulta un paciente por id con cabecera de autenticacion.
  test('obtenerPacientePorId llama al endpoint correcto', async () => {
    axios.get.mockResolvedValueOnce({ data: { ok: true, paciente: { nombre: 'Ana' } } });

    const data = await vinculacionesService.obtenerPacientePorId('paciente-1');

    expect(data).toEqual({ ok: true, paciente: { nombre: 'Ana' } });
    expect(axios.get).toHaveBeenCalledWith(
      'http://api.test/vinculaciones/paciente/paciente-1',
      { headers: { Authorization: 'Bearer token-web' } }
    );
  });

  //Verifica que vincular un paciente envia el uid en el body.
  test('vincularPaciente envia id_paciente y token', async () => {
    axios.post.mockResolvedValueOnce({ data: { ok: true } });

    const data = await vinculacionesService.vincularPaciente('paciente-1');

    expect(data).toEqual({ ok: true });
    expect(axios.post).toHaveBeenCalledWith(
      'http://api.test/vinculaciones/vincular-paciente',
      { id_paciente: 'paciente-1' },
      { headers: { Authorization: 'Bearer token-web' } }
    );
  });
});
