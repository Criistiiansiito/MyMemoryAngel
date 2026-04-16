import { getAuth } from 'firebase/auth';
import { Platform } from 'react-native';

const API = Platform.OS === 'web' ? 'http://localhost:5000/api' : `http://${process.env.EXPO_PUBLIC_IP}:5000/api`;

export const gestionPacientesService = {
    //Obtiene la lista de pacientes vinculados al cuidador actual
    listarMisPacientes: async () => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser?.getIdToken();

            if (!token) throw new Error("No hay token de autenticación");

            const response = await fetch(`${API}/vinculaciones/mis-pacientes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            return data; 
        } catch (error) {
            console.error("Error en listarMisPacientes:", error);
            return { ok: false, error: error.message };
        }
    },
};