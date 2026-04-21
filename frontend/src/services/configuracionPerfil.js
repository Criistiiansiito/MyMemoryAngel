import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API = Platform.OS === 'web' ? 'http://localhost:5000/api' : `http://${process.env.EXPO_PUBLIC_IP}:5000/api`;

const getAuthToken = async () => {
    return Platform.OS === 'web' 
        ? localStorage.getItem('userToken') 
        : await SecureStore.getItemAsync('userToken');
};

export const configuracionPerfil = {
    obtenerPerfil: async () => {
        const token = await getAuthToken();
        const res = await axios.get(`${API}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    obtenerPerfilPaciente: async (pacienteId) => {
        const token = await getAuthToken();
        const res = await axios.get(`${API}/auth/paciente-profile/${pacienteId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    actualizarPerfil: async (nombre, foto, fecha) => {
        const token = await getAuthToken();
        const res = await axios.put(`${API}/auth/actualizar-perfil`, {
            nombre,
            foto_perfil: foto,
            fecha_nacimiento: fecha
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    actualizarPerfilPaciente: async (pacienteId, datos) => {
        const token = await getAuthToken();
        const res = await axios.put(`${API}/auth/paciente-profile/${pacienteId}`, datos, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    actualizarAccesibilidad: async (ajustes) => {
        const token = Platform.OS === 'web' 
            ? localStorage.getItem('userToken') 
            : await SecureStore.getItemAsync('userToken');

        return await axios.put(`${API}/auth/actualizar-accesibilidad`, ajustes, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }    
};
