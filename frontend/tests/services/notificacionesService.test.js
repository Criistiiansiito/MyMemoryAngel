jest.mock('axios', () => ({
  post: jest.fn(),
}));

jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
  Platform: { OS: 'android' },
}));

jest.mock('expo-device', () => ({
  isDevice: true,
}));

const mockNotificationListener = jest.fn();

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationCategoryAsync: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn((handler) => {
    mockNotificationListener.mockImplementation(handler);
    return { remove: jest.fn() };
  }),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  AndroidImportance: { MAX: 'MAX' },
}));

jest.mock('expo-constants', () => ({
  expoConfig: { extra: { eas: { projectId: 'project-123' } } },
  easConfig: null,
}));

import axios from 'axios';
import { Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {
  enviarPushTokenAlBackend,
  inicializarNotificaciones,
  registerForPushNotificationsAsync,
} from '../../src/services/notificacionesService';

describe('notificacionesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Device, 'isDevice', { value: true, writable: true, configurable: true });
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: 'ExponentPushToken[token]' });
  });

  //Verifica que la inicializacion registra la categoria y el listener de respuesta.
  test('inicializarNotificaciones configura acciones de recordatorio', async () => {
    await inicializarNotificaciones();

    expect(Notifications.setNotificationCategoryAsync).toHaveBeenCalledWith(
      'recordatorio-actions',
      expect.any(Array)
    );
    expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalledTimes(1);
  });

  //Verifica que el registro devuelve el token Expo cuando todo esta correctamente configurado.
  test('registerForPushNotificationsAsync devuelve el token Expo', async () => {
    const token = await registerForPushNotificationsAsync();

    expect(token).toBe('ExponentPushToken[token]');
    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
      'default',
      expect.objectContaining({ importance: 'MAX' })
    );
  });

  //Verifica que el registro rechaza si el usuario deniega el permiso de notificaciones.
  test('registerForPushNotificationsAsync falla si se deniega el permiso', async () => {
    Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    Notifications.requestPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });

    await expect(registerForPushNotificationsAsync()).rejects.toThrow(/denegado/i);
  });

  //Verifica que el token push se envia al backend con cabecera Bearer.
  test('enviarPushTokenAlBackend hace post con token y plataforma', async () => {
    axios.post.mockResolvedValueOnce({ data: { ok: true } });

    await enviarPushTokenAlBackend({
      token: 'ExponentPushToken[token]',
      firebaseToken: 'firebase-token',
      platform: 'android',
    });

    expect(axios.post).toHaveBeenCalledWith(
      'http://api.test/recordatorios/push-token',
      { expo_push_token: 'ExponentPushToken[token]', platform: 'android' },
      { headers: { Authorization: 'Bearer firebase-token' } }
    );
  });

  //Verifica que la accion de notificacion dispara la alerta esperada.
  test('el listener de respuesta reacciona a la accion marcar-cumplido', async () => {
    await inicializarNotificaciones();

    mockNotificationListener({ actionIdentifier: 'marcar-cumplido' });

    expect(Alert.alert).toHaveBeenCalled();
  });
});
