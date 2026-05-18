jest.mock('axios', () => ({
  get: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
}));

import axios from 'axios';
import { lecturaService } from '../../src/services/lecturaService';

describe('lecturaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.localStorage.getItem = jest.fn().mockReturnValue('token-web');
  });

  //Verifica que las lecturas se solicitan con el tipo indicado y autenticacion.
  test('obtenerLecturasPorTipo llama al endpoint con tipo y token', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, titulo: 'Lectura' }] });

    const data = await lecturaService.obtenerLecturasPorTipo('poesia');

    expect(data).toEqual([{ id: 1, titulo: 'Lectura' }]);
    expect(axios.get).toHaveBeenCalledWith(
      'http://api.test/lecturas/get-lecturas',
      {
        params: { tipo: 'poesia' },
        headers: { Authorization: 'Bearer token-web' },
      }
    );
  });

  //Verifica que el servicio propaga el error si la peticion falla.
  test('obtenerLecturasPorTipo relanza errores de red', async () => {
    const error = new Error('network fail');
    axios.get.mockRejectedValueOnce(error);

    await expect(lecturaService.obtenerLecturasPorTipo('poesia')).rejects.toBe(error);
  });
});
