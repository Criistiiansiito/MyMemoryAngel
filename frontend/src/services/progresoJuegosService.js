import axios from 'axios';
import { auth } from './firebase';

const API = `${process.env.EXPO_PUBLIC_IP}`;

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

  obtenerProgresoPorPaciente: async (pacienteUid) => {
    if (!pacienteUid) throw new Error('UID del paciente es requerido');
    return await progresoJuegosService.obtenerProgreso(pacienteUid);
  },

  obtenerMiProgreso: async () => {
    const currentUserUid = auth.currentUser?.uid;
    if (!currentUserUid) {
      throw new Error('No hay usuario autenticado');
    }

    return await progresoJuegosService.obtenerProgreso(currentUserUid);
  },
};
