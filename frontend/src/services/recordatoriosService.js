import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = Platform.OS === 'web' ? 'http://localhost:5000/api' : `http://${process.env.EXPO_PUBLIC_IP}:5000/api`;

// 1. Lógica de obtener datos del Backend
export const fetchRecordatorios = async () => {
  try {
    const userJSON = await AsyncStorage.getItem('user');
    if (!userJSON) return { ok: false, data: [] };

    const user = JSON.parse(userJSON);
    const response = await axios.get(`${API}/auth/recordatorios/${user.id_usuario}`);
    
    return { ok: true, data: response.data.recordatorios || [] };
  } catch (error) {
    console.error("Error fetching recordatorios:", error);
    return { ok: false, data: [], status: error.response?.status };
  }
};

// 2. Lógica de Iconos y Colores (Reutilizable en cualquier pantalla)
export const getIconConfig = (tipo) => {
  switch (tipo) {
    case 'Medicación': return { icon: 'pill', color: '#DBEAFE', iconColor: '#3B82F6' };
    case 'Cita médica': return { icon: 'calendar-check', color: '#DCFCE7', iconColor: '#22C55E' };
    case 'Tarea': return { icon: 'checkbox-marked-outline', color: '#F3E8FF', iconColor: '#A855F7' };
    case 'Evento personal': return { icon: 'account-outline', color: '#FFEDD5', iconColor: '#F97316' };
    default: return { icon: 'bell-outline', color: '#F1F5F9', iconColor: '#64748B' };
  }
};

// 3. Lógica de Formateo de fechas
export const formatearFechaYHora = (fechaRaw) => {
  if (!fechaRaw) return { fecha: '--', hora: '--:--' };
  try {
    const d = new Date(fechaRaw);
    if (isNaN(d.getTime())) return { fecha: 'Error', hora: '--:--' };
    const fechaTexto = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '');
    const horaTexto = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    return { fecha: fechaTexto, hora: horaTexto };
  } catch (e) {
    return { fecha: '---', hora: '00:00' };
  }
};

// 1. Configuración de Tipos (Para no repetirlos en cada archivo)
export const TIPOS_RECORDATORIO = [
  { id: 'Medicación', icon: 'pill', color: '#E8F0FE', iconColor: '#3B82F6' },
  { id: 'Cita médica', icon: 'calendar-check', color: '#E7F9ED', iconColor: '#22C55E' },
  { id: 'Tarea', icon: 'checkbox-marked-outline', color: '#F3E8FF', iconColor: '#A855F7' },
  { id: 'Evento personal', icon: 'account-outline', color: '#FFF7E6', iconColor: '#F59E0B' },
  { id: 'Otro', icon: 'plus', color: '#F7FAFC', iconColor: '#718096' },
];

// 2. Formateador de fecha para MySQL (Evita ruido en el componente)
export const formatToMySQL = (date) => {
  const pad = (n) => (n < 10 ? '0' + n : n);
  return (
    date.getFullYear() + '-' + 
    pad(date.getMonth() + 1) + '-' + 
    pad(date.getDate()) + ' ' +
    pad(date.getHours()) + ':' + 
    pad(date.getMinutes()) + ':' + 
    pad(date.getSeconds())
  );
};

// 3. Función para crear el recordatorio en la DB
export const crearRecordatorio = async (datos) => {
  try {
    const userJSON = await AsyncStorage.getItem('user');
    if (!userJSON) throw new Error("No hay sesión de usuario");
    
    const user = JSON.parse(userJSON);
    const body = { ...datos, id_usuario: user.id_usuario };
    
    // Usamos la misma constante API que ya tienes definida en el service
    const response = await axios.post(`${API}/recordatorios/crear`, body);
    return response;
  } catch (error) {
    console.error("Error en crearRecordatorio:", error);
    throw error;
  }
};

