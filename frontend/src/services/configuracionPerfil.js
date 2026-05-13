import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API = `${process.env.EXPO_PUBLIC_IP}`;

const getAuthToken = async () => {
    return Platform.OS === 'web' 
        ? localStorage.getItem('userToken') 
        : await SecureStore.getItemAsync('userToken');
};

export const configuracionPerfil = {
    obtenerPerfil: async () => {
        const token = await getAuthToken();
        const res = await axios.get(`${API}/perfil/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    obtenerPerfilPaciente: async (pacienteId) => {
        const token = await getAuthToken();
        const res = await axios.get(`${API}/perfil/paciente-profile/${pacienteId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    actualizarPerfil: async (nombre, foto, fecha) => {
        const token = await getAuthToken();
        const res = await axios.put(`${API}/perfil/actualizar-perfil`, {
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
        const res = await axios.put(`${API}/perfil/paciente-profile/${pacienteId}`, datos, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    actualizarAccesibilidad: async (ajustes) => {
        const token = Platform.OS === 'web' 
            ? localStorage.getItem('userToken') 
            : await SecureStore.getItemAsync('userToken');

        return await axios.put(`${API}/perfil/actualizar-accesibilidad`, ajustes, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }    
};
