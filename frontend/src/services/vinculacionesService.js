import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API = `${process.env.EXPO_PUBLIC_IP}`;

const getAuthToken = async () => {
    return Platform.OS === 'web' 
        ? localStorage.getItem('userToken') 
        : await SecureStore.getItemAsync('userToken');
};

export const vinculacionesService = {
    // Obtiene los datos del paciente usando el ID del QR, que es el udi
    obtenerPacientePorId: async (id) => {
        const token = await getAuthToken();
        const res = await axios.get(`${API}/vinculaciones/paciente/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data; 
    },

    // Esto registra la relación en la tabla vinculaciones
    vincularPaciente: async (idPaciente) => {
        const token = await getAuthToken();
        const res = await axios.post(`${API}/vinculaciones/vincular-paciente`, {
            id_paciente: idPaciente
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    }
};
