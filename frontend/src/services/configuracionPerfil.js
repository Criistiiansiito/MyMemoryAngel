import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API = Platform.OS === 'web' ? 'http://localhost:5000/api' : 'http://172.20.10.5:5000/api';

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
    }
};