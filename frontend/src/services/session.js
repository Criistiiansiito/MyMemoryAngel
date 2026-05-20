import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { signOut } from 'firebase/auth';

import { auth } from './firebase';

export const clearStoredSession = async () => {
  await AsyncStorage.removeItem('user');

  if (Platform.OS === 'web') {
    localStorage.removeItem('userToken');
  } else {
    await SecureStore.deleteItemAsync('userToken');
  }
};

export const setStoredToken = async (token) => {
  if (Platform.OS === 'web') {
    localStorage.setItem('userToken', token);
  } else {
    await SecureStore.setItemAsync('userToken', token);
  }
};

export const logoutUser = async () => {
  await clearStoredSession();
  await signOut(auth);
};
