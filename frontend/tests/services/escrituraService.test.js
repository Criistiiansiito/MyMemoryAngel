jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
}));

import axios from 'axios';
import { escrituraService } from '../../src/services/escrituraService';

describe('escrituraService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.localStorage.getItem = jest.fn().mockReturnValue('token-web');
  });

  //Verifica que se solicitan las escrituras de un usuario con autenticacion.
  test('obtenerEscrituras llama al endpoint con query y token', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, texto: 'Hola' }] });

    const data = await escrituraService.obtenerEscrituras('abc123XYZ789');

    expect(data).toEqual([{ id: 1, texto: 'Hola' }]);
    expect(axios.get).toHaveBeenCalledWith(
      'http://api.test/escritura/get-escrituras',
      {
        params: { id_usuario: 'abc123XYZ789' },
        headers: { Authorization: 'Bearer token-web' },
      }
    );
  });

  //Verifica que crear una escritura envia el body esperado.
  test('insertarEscritura envia los datos correctos', async () => {
    axios.post.mockResolvedValueOnce({ data: { ok: true } });

    const data = await escrituraService.insertarEscritura('abc123XYZ789', 'Lunes', 'Texto');

    expect(data).toEqual({ ok: true });
    expect(axios.post).toHaveBeenCalledWith(
      'http://api.test/escritura/add-escritura',
      { id_usuario: 'abc123XYZ789', dia: 'Lunes', texto: 'Texto' },
      { headers: { Authorization: 'Bearer token-web' } }
    );
  });

  //Verifica que eliminar una escritura llama al endpoint correcto.
  test('eliminarEscritura llama al endpoint de borrado', async () => {
    axios.delete.mockResolvedValueOnce({ data: { ok: true } });

    const data = await escrituraService.eliminarEscritura(10);

    expect(data).toEqual({ ok: true });
    expect(axios.delete).toHaveBeenCalledWith(
      'http://api.test/escritura/delete-escritura/10',
      { headers: { Authorization: 'Bearer token-web' } }
    );
  });
});
