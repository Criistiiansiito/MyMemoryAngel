import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useStoredUser = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await AsyncStorage.getItem('user');
      if (data) setUser(JSON.parse(data));
    };
    load();
  }, []);

  return user;
};