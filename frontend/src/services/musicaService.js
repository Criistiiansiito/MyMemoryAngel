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
    obtenerMusicaPorTipo: async (tipo, id_usuario = null) => {
        const token = await getAuthToken();
        const res = await axios.get(`${API}/musica/get-musica`, {
            params: { tipo, id_usuario },
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    // CAMBIO AQUÍ: Ahora recibe los parámetros por separado para construir el FormData
    insertarMusicaPersonal: async (uri, titulo, id_usuario) => {
        const token = await getAuthToken();
        
        const formData = new FormData();
        
        formData.append('audio', {
            uri: uri,
            name: `${titulo}.mp3`, 
            type: 'audio/mpeg'  
        });

        formData.append('titulo', titulo);
        formData.append('tipo', 'personal');
        formData.append('id_usuario', id_usuario);

        try {
            const res = await axios.post(`${API}/musica/insert-musica`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data', 
                },
                onUploadProgress: (progressEvent) => {
                    let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Subiendo: ${percentCompleted}%`);
                }
            });
            return res.data;
        } catch (error) {
            console.error("Error al subir archivo:", error.response?.data || error.message);
            throw error;
        }
    }
};