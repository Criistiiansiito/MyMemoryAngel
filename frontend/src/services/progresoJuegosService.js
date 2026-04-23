import axios from 'axios';
import { Platform } from 'react-native';
import { auth } from './firebase';

const API =
  Platform.OS === 'web'
    ? 'http://localhost:5000/api'
    : `http://${process.env.EXPO_PUBLIC_IP}:5000/api`;

const getAuthHeaders = async () => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('No hay token de autenticacion');

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const progresoJuegosService = {
  guardarProgreso: async ({ juego, categoria, puntuacion, ultimo_resultado, user_uid }) => {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API}/auth/progreso-juegos`,
      { juego, categoria, puntuacion, ultimo_resultado, user_uid },
      { headers }
    );
    return response.data;
  },

  obtenerProgreso: async (userUid) => {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API}/auth/progreso-juegos/${userUid}`, { headers });
    return response.data;
  },

  obtenerMiProgreso: async () => {
    const currentUserUid = auth.currentUser?.uid;
    if (!currentUserUid) {
      throw new Error('No hay usuario autenticado');
    }

    return await progresoJuegosService.obtenerProgreso(currentUserUid);
  },
};
