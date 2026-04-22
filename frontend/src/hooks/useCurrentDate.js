import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export const useCurrentDate = () => {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useFocusEffect(
    useCallback(() => {
      setCurrentDate(new Date());

      const intervalId = setInterval(() => {
        setCurrentDate(new Date());
      }, 60000);

      return () => clearInterval(intervalId);
    }, [])
  );

  return currentDate;
};
