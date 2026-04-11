import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API = Platform.OS === 'web' ? 'http://localhost:5000/api' : `http://${process.env.EXPO_PUBLIC_IP}:5000/api`;

const getAuthToken = async () => {
    return Platform.OS === 'web' 
        ? localStorage.getItem('userToken') 
        : await SecureStore.getItemAsync('userToken');
};

export const musicaService = {
    obtenerMusicaPorTipo: async (tipo) => {
        const token = await getAuthToken();
        const res = await axios.get(`${API}/musica/get-musica`, {
            params: { tipo },
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data; // Esto devuelve [] si la tabla está vacía
    }
};