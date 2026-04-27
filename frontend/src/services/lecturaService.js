import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API = `${process.env.EXPO_PUBLIC_IP}`;

const getAuthToken = async () => {
    return Platform.OS === 'web' 
        ? localStorage.getItem('userToken') 
        : await SecureStore.getItemAsync('userToken');
};

export const lecturaService = {
    obtenerLecturasPorTipo: async (tipo) => {
        try {
            const token = await getAuthToken();
            const res = await axios.get(`${API}/lecturas/get-lecturas`, {
                params: { tipo },
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data; 
        } catch (error) {
            console.error("Error en lecturaService:", error);
            throw error;
        }
    }
};