import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API = Platform.OS === 'web' ? 'http://localhost:5000/api' : `http://${process.env.EXPO_PUBLIC_IP}:5000/api`;

const getAuthToken = async () => {
    return Platform.OS === 'web' 
        ? localStorage.getItem('userToken') 
        : await SecureStore.getItemAsync('userToken');
};

export const escrituraService = {
    obtenerEscrituras: async (id_usuario) => {
        const token = await getAuthToken();
        const res = await axios.get(`${API}/escritura/get-escrituras`, {
            params: { id_usuario }, 
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data; 
    },
    insertarEscritura: async (id_usuario, dia, texto) => {
        const token = await getAuthToken();
        const res = await axios.post(`${API}/escritura/add-escritura`, 
            { id_usuario, dia, texto },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.data;
    },
    eliminarEscritura: async (id) => {
        const token = await getAuthToken();
        const res = await axios.delete(`${API}/escritura/delete-escritura/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    }
};