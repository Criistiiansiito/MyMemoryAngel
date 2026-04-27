import { Alert, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';

const API = `${process.env.EXPO_PUBLIC_IP}`;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let notificationResponseSubscription = null;

export const inicializarNotificaciones = async () => {
  await Notifications.setNotificationCategoryAsync('recordatorio-actions', [
    {
      identifier: 'marcar-cumplido',
      buttonTitle: 'Cumplido',
      options: {
        opensAppToForeground: true,
      },
    },
  ]);

  if (!notificationResponseSubscription) {
    notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      if (response.actionIdentifier === 'marcar-cumplido') {
        Alert.alert('Prueba', 'Acción "Cumplido" pulsada');
      }
    });
  }
};

export const registerForPushNotificationsAsync = async () => {
  await inicializarNotificaciones();

  if (!Device.isDevice) {
    throw new Error('Las push notifications requieren dispositivo físico');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    throw new Error('Permiso de notificaciones denegado');
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId;

  if (!projectId) {
    throw new Error('No se encontró el projectId de Expo/EAS');
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenResponse.data;
};

export const enviarPushTokenAlBackend = async ({ token, firebaseToken, platform }) => {
  await axios.post(
    `${API}/auth/push-token`,
    {
      expo_push_token: token,
      platform,
    },
    {
      headers: {
        Authorization: `Bearer ${firebaseToken}`,
      },
    }
  );
};
