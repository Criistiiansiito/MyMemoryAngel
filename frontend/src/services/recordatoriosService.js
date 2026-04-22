import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = Platform.OS === 'web' ? 'http://localhost:5000/api' : `http://${process.env.EXPO_PUBLIC_IP}:5000/api`;

const normalizarTipo = (tipo = '') =>
  tipo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const getCurrentUserId = async () => {
  const userJSON = await AsyncStorage.getItem('user');
  if (!userJSON) return null;
  const user = JSON.parse(userJSON);
  return user.uid;
};

export const fetchRecordatorios = async () => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { ok: false, data: [] };

    const response = await axios.get(`${API}/auth/recordatorios-hoy/${userId}`);
    return { ok: true, data: response.data.recordatorios || [] };
  } catch (error) {
    console.error('Error fetching recordatorios:', error);
    return { ok: false, data: [], status: error.response?.status };
  }
};

export const fetchAllRecordatorios = async () => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { ok: false, data: [] };

    const response = await axios.get(`${API}/auth/recordatorios/${userId}`);
    return { ok: true, data: response.data.recordatorios || [] };
  } catch (error) {
    console.error('Error fetching all recordatorios:', error);
    return { ok: false, data: [], status: error.response?.status };
  }
};

export const fetchRecordatoriosCalendario = async (fromDate, toDate) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { ok: false, data: [] };

    const response = await axios.get(`${API}/auth/recordatorios-calendario/${userId}`, {
      params: { from: fromDate, to: toDate },
    });
    return { ok: true, data: response.data.recordatorios || [] };
  } catch (error) {
    console.error('Error fetching recordatorios calendario:', error);
    return { ok: false, data: [], status: error.response?.status };
  }
};

export const getIconConfig = (tipo) => {
  switch (normalizarTipo(tipo)) {
    case 'medicacion':
      return { icon: 'pill', color: '#DBEAFE', iconColor: '#3B82F6' };
    case 'cita medica':
      return { icon: 'calendar-check', color: '#DCFCE7', iconColor: '#22C55E' };
    case 'tarea':
      return { icon: 'checkbox-marked-outline', color: '#F3E8FF', iconColor: '#A855F7' };
    case 'evento personal':
      return { icon: 'account-outline', color: '#FFEDD5', iconColor: '#F97316' };
    case 'hidratacion':
      return { icon: 'cup-water', color: '#E0F2FE', iconColor: '#0284C7' };
    default:
      return { icon: 'bell-outline', color: '#F1F5F9', iconColor: '#64748B' };
  }
};

export const formatearFechaYHora = (fechaRaw) => {
  if (!fechaRaw) return { fecha: '--', hora: '--:--' };
  try {
    const d = new Date(fechaRaw);
    if (isNaN(d.getTime())) return { fecha: 'Error', hora: '--:--' };
    const fechaTexto = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '');
    const horaTexto = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    return { fecha: fechaTexto, hora: horaTexto };
  } catch (_e) {
    return { fecha: '---', hora: '00:00' };
  }
};

export const TIPOS_RECORDATORIO = [
  { id: 'Medicación', icon: 'pill', color: '#E8F0FE', iconColor: '#3B82F6' },
  { id: 'Cita médica', icon: 'calendar-check', color: '#E7F9ED', iconColor: '#22C55E' },
  { id: 'Tarea', icon: 'checkbox-marked-outline', color: '#F3E8FF', iconColor: '#A855F7' },
  { id: 'Evento personal', icon: 'account-outline', color: '#FFF7E6', iconColor: '#F59E0B' },
  { id: 'Hidratación', icon: 'cup-water', color: '#E0F2FE', iconColor: '#0284C7' },
  { id: 'Otro', icon: 'plus', color: '#F7FAFC', iconColor: '#718096' },
];

export const formatToMySQL = (date) => {
  const pad = (n) => (n < 10 ? `0${n}` : n);
  return (
    `${date.getFullYear()}-` +
    `${pad(date.getMonth() + 1)}-` +
    `${pad(date.getDate())} ` +
    `${pad(date.getHours())}:` +
    `${pad(date.getMinutes())}:` +
    `${pad(date.getSeconds())}`
  );
};

export const crearRecordatorio = async (datos) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('No hay sesión de usuario');

    const body = { ...datos, id_usuario: userId };
    const response = await axios.post(`${API}/auth/crear`, body);
    return response;
  } catch (error) {
    console.error('Error en crearRecordatorio:', error);
    throw error;
  }
};

export const actualizarRecordatorio = async (recordatorioId, datos) => {
  try {
    const response = await axios.put(`${API}/auth/recordatorios/${recordatorioId}`, datos);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar recordatorio:', error);
    throw error;
  }
};

export const eliminarRecordatorio = async (recordatorioId) => {
  try {
    const response = await axios.delete(`${API}/auth/recordatorios/${recordatorioId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar recordatorio:', error);
    throw error;
  }
};

export const marcarRecordatorioCumplido = async (recordatorioId, cumplido, fechaOcorrencia) => {
  try {
    const response = await axios.put(`${API}/auth/recordatorios/${recordatorioId}/cumplido`, {
      cumplido,
      fecha_ocurrencia: fechaOcorrencia,
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar cumplido:', error);
    throw error;
  }
};
