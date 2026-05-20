jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  crearRecordatorio,
  fetchRecordatorios,
  fetchRecordatoriosCalendarioPorUsuario,
  fetchRecordatoriosHoyPorUsuario,
  formatearFechaYHora,
  formatToMySQL,
  getIconConfig,
  getStoredUser,
  marcarRecordatorioCumplido,
  parseMySQLDateTime,
} from '../../src/services/recordatoriosService';

describe('recordatoriosService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //Verifica que el usuario almacenado se recupera y parsea correctamente.
  test('getStoredUser devuelve el usuario de AsyncStorage', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ uid: 'abc123XYZ789' }));

    const user = await getStoredUser();

    expect(user).toEqual({ uid: 'abc123XYZ789' });
  });

  //Verifica que no se consulta el backend cuando no hay identificador de usuario.
  test('fetchRecordatoriosHoyPorUsuario devuelve vacio sin userId', async () => {
    const result = await fetchRecordatoriosHoyPorUsuario(null);

    expect(result).toEqual({ ok: false, data: [] });
    expect(axios.get).not.toHaveBeenCalled();
  });

  //Verifica que el listado de recordatorios usa el usuario guardado en sesion.
  test('fetchRecordatorios devuelve los recordatorios del usuario actual', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ uid: 'abc123XYZ789' }));
    axios.get.mockResolvedValueOnce({
      data: { recordatorios: [{ id_recordatorio: 1, titulo: 'Tomar agua' }] },
    });

    const result = await fetchRecordatorios();

    expect(result).toEqual({
      ok: true,
      data: [{ id_recordatorio: 1, titulo: 'Tomar agua' }],
    });
    expect(axios.get).toHaveBeenCalledWith(
      'http://api.test/recordatorios/hoy/abc123XYZ789'
    );
  });

  //Verifica que el calendario envia el rango de fechas por query params.
  test('fetchRecordatoriosCalendarioPorUsuario envia from y to', async () => {
    axios.get.mockResolvedValueOnce({ data: { recordatorios: [{ id_recordatorio: 2 }] } });

    const result = await fetchRecordatoriosCalendarioPorUsuario(
      'abc123XYZ789',
      '2026-05-18',
      '2026-05-20'
    );

    expect(result).toEqual({ ok: true, data: [{ id_recordatorio: 2 }] });
    expect(axios.get).toHaveBeenCalledWith(
      'http://api.test/recordatorios/calendario/abc123XYZ789',
      { params: { from: '2026-05-18', to: '2026-05-20' } }
    );
  });

  //Verifica que la configuracion visual normaliza tipos con acentos correctamente.
  test('getIconConfig normaliza tipos con acentos', () => {
    expect(getIconConfig('Hidrataci\u00f3n')).toEqual({
      icon: 'cup-water',
      color: '#E0F2FE',
      iconColor: '#0284C7',
    });
  });

  //Verifica que una fecha MySQL valida se convierte en un Date utilizable.
  test('parseMySQLDateTime convierte una fecha MySQL', () => {
    const result = parseMySQLDateTime('2026-05-18 09:30:00');

    expect(result).toBeInstanceOf(Date);
    expect(Number.isNaN(result.getTime())).toBe(false);
  });

  //Verifica que el formateo de fecha y hora devuelve placeholders cuando no hay valor.
  test('formatearFechaYHora devuelve placeholders para valor vacio', () => {
    expect(formatearFechaYHora(null)).toEqual({ fecha: '--', hora: '--:--' });
  });

  //Verifica que una fecha se transforma al formato MySQL en zona Madrid.
  test('formatToMySQL devuelve YYYY-MM-DD HH:mm:ss', () => {
    expect(formatToMySQL(new Date('2026-05-18T07:30:00Z'))).toBe('2026-05-18 09:30:00');
  });

  //Verifica que al crear un recordatorio se reutiliza el usuario almacenado si no se envia otro.
  test('crearRecordatorio usa el usuario de sesion por defecto', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ uid: 'abc123XYZ789' }));
    const response = { data: { ok: true, id_recordatorio: 10 } };
    axios.post.mockResolvedValueOnce(response);

    const result = await crearRecordatorio({ titulo: 'Tomar agua' });

    expect(result).toBe(response);
    expect(axios.post).toHaveBeenCalledWith(
      'http://api.test/recordatorios/crear',
      { titulo: 'Tomar agua', id_usuario: 'abc123XYZ789' }
    );
  });

  //Verifica que marcar un recordatorio como cumplido envia el estado y la fecha de ocurrencia.
  test('marcarRecordatorioCumplido envia cumplido y fecha_ocurrencia', async () => {
    axios.put.mockResolvedValueOnce({ data: { ok: true } });

    const result = await marcarRecordatorioCumplido(10, true, '2026-05-18');

    expect(result).toEqual({ ok: true });
    expect(axios.put).toHaveBeenCalledWith(
      'http://api.test/recordatorios/10/cumplido',
      { cumplido: true, fecha_ocurrencia: '2026-05-18' }
    );
  });
});
