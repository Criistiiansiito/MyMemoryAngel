import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API = Platform.OS === 'web' ? 'http://localhost:5000/api' : `http://${process.env.EXPO_PUBLIC_IP}:5000/api`;

const getAuthToken = async () => {
    return Platform.OS === 'web' 
        ? localStorage.getItem('userToken') 
        : await SecureStore.getItemAsync('userToken');
};

export const vinculacionesService = {
    // Obtiene los datos del paciente usando el ID del QR, que es el udi
    obtenerPacientePorId: async (id) => {
        const token = await getAuthToken();
        const res = await axios.get(`${API}/auth/paciente/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data; 
    },

    // Esto registra la relación en la tabla vinculaciones
    vincularPaciente: async (idPaciente) => {
        const token = await getAuthToken();
        const res = await axios.post(`${API}/auth/vincular-paciente`, {
            id_paciente: idPaciente
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    }
};