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
import { musicaService } from '../../src/services/musicaService';

describe('musicaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.localStorage.getItem = jest.fn().mockReturnValue('token-web');
  });

  //Verifica que la musica se consulta con tipo, usuario y token.
  test('obtenerMusicaPorTipo llama al endpoint con params y auth', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, tipo: 'personal' }] });

    const data = await musicaService.obtenerMusicaPorTipo('personal', 'abc123XYZ789');

    expect(data).toEqual([{ id: 1, tipo: 'personal' }]);
    expect(axios.get).toHaveBeenCalledWith(
      'http://api.test/musica/get-musica',
      {
        params: { tipo: 'personal', id_usuario: 'abc123XYZ789' },
        headers: { Authorization: 'Bearer token-web' },
      }
    );
  });

  //Verifica que la subida de musica construye el FormData esperado.
  test('insertarMusicaPersonal envia archivo y metadatos en multipart', async () => {
    axios.post.mockResolvedValueOnce({ data: { res: 'ok' } });

    const data = await musicaService.insertarMusicaPersonal(
      'file:///audio/song.mp3',
      'mi-cancion',
      'abc123XYZ789'
    );

    expect(data).toEqual({ res: 'ok' });
    expect(axios.post).toHaveBeenCalledTimes(1);

    const [url, formData, config] = axios.post.mock.calls[0];
    expect(url).toBe('http://api.test/musica/insert-musica');
    expect(formData.fields).toEqual([
      ['audio', { uri: 'file:///audio/song.mp3', name: 'mi-cancion.mp3', type: 'audio/mpeg' }],
      ['titulo', 'mi-cancion'],
      ['tipo', 'personal'],
      ['id_usuario', 'abc123XYZ789'],
    ]);
    expect(config.headers).toEqual({
      Authorization: 'Bearer token-web',
      'Content-Type': 'multipart/form-data',
    });
    expect(typeof config.onUploadProgress).toBe('function');
  });

  //Verifica que el servicio relanza errores al subir un archivo.
  test('insertarMusicaPersonal relanza errores de subida', async () => {
    const error = new Error('upload fail');
    axios.post.mockRejectedValueOnce(error);

    await expect(
      musicaService.insertarMusicaPersonal('file:///audio/song.mp3', 'mi-cancion', 'abc123XYZ789')
    ).rejects.toBe(error);
  });
});
