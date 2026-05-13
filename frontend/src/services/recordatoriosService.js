import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRecordatorioVisualConfig, getTiposRecordatorio } from './accesibilidadColors';

const API = `${process.env.EXPO_PUBLIC_IP}`;
const MADRID_TIMEZONE = 'Europe/Madrid';

const getTimeZoneOffsetMs = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const getPart = (type) => parts.find((part) => part.type === type)?.value;
  const asUtc = Date.UTC(
    Number(getPart('year')),
    Number(getPart('month')) - 1,
    Number(getPart('day')),
    Number(getPart('hour')),
    Number(getPart('minute')),
    Number(getPart('second'))
  );

  return asUtc - date.getTime();
};

const buildDateFromTimeZoneParts = (year, month, day, hour, minute, second, timeZone) => {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  let date = new Date(utcGuess);
  let offset = getTimeZoneOffsetMs(date, timeZone);
  date = new Date(utcGuess - offset);

  // Segunda pasada para ajustar bien cambios de horario de verano/invierno
  offset = getTimeZoneOffsetMs(date, timeZone);
  return new Date(utcGuess - offset);
};

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

export const getStoredUser = async () => {
  const userJSON = await AsyncStorage.getItem('user');
  return userJSON ? JSON.parse(userJSON) : null;
};

export const fetchRecordatoriosHoyPorUsuario = async (userId) => {
  try {
    if (!userId) return { ok: false, data: [] };

    const response = await axios.get(`${API}/recordatorios/hoy/${userId}`);
    return { ok: true, data: response.data.recordatorios || [] };
  } catch (error) {
    console.error('Error fetching recordatorios por usuario:', error);
    return { ok: false, data: [], status: error.response?.status };
  }
};

export const fetchRecordatorios = async () => {
  try {
    const userId = await getCurrentUserId();
    return await fetchRecordatoriosHoyPorUsuario(userId);
  } catch (error) {
    console.error('Error fetching recordatorios:', error);
    return { ok: false, data: [], status: error.response?.status };
  }
};

export const fetchAllRecordatorios = async () => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { ok: false, data: [] };

    const response = await axios.get(`${API}/recordatorios/${userId}`);
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

    return await fetchRecordatoriosCalendarioPorUsuario(userId, fromDate, toDate);
  } catch (error) {
    console.error('Error fetching recordatorios calendario:', error);
    return { ok: false, data: [], status: error.response?.status };
  }
};

export const fetchRecordatoriosCalendarioPorUsuario = async (userId, fromDate, toDate) => {
  try {
    if (!userId) return { ok: false, data: [] };

    const response = await axios.get(`${API}/recordatorios/calendario/${userId}`, {
      params: { from: fromDate, to: toDate },
    });
    return { ok: true, data: response.data.recordatorios || [] };
  } catch (error) {
    console.error('Error fetching recordatorios calendario por usuario:', error);
    return { ok: false, data: [], status: error.response?.status };
  }
};

export const getIconConfig = (tipo, isDarkMode = false) => {
  return getRecordatorioVisualConfig(normalizarTipo(tipo), isDarkMode);
};

export const parseMySQLDateTime = (fechaRaw) => {
  if (!fechaRaw) return null;
  if (fechaRaw instanceof Date) {
    return Number.isNaN(fechaRaw.getTime()) ? null : fechaRaw;
  }

  const value = String(fechaRaw).trim();
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );

  if (!match) {
    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  const [, year, month, day, hour = '00', minute = '00', second = '00'] = match;
  return buildDateFromTimeZoneParts(
    Number(year),
    Number(month),
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    MADRID_TIMEZONE
  );
};

export const formatearFechaYHora = (fechaRaw) => {
  if (!fechaRaw) return { fecha: '--', hora: '--:--' };
  try {
    const d = parseMySQLDateTime(fechaRaw);
    if (!d || Number.isNaN(d.getTime())) return { fecha: 'Error', hora: '--:--' };
    const fechaTexto = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: MADRID_TIMEZONE }).replace('.', '');
    const horaTexto = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: MADRID_TIMEZONE });
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
export const getTiposRecordatorioConfig = (isDarkMode = false) => getTiposRecordatorio(isDarkMode);

export const formatToMySQL = (date) => {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: MADRID_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const getPart = (type) => parts.find((part) => part.type === type)?.value;

  return `${getPart('year')}-${getPart('month')}-${getPart('day')} ${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;
};

export const crearRecordatorio = async (datos) => {
  try {
    const userId = await getCurrentUserId();
    const targetUserId = datos.id_usuario || userId;
    if (!targetUserId) throw new Error('No hay sesión de usuario');

    const body = { ...datos, id_usuario: targetUserId };
    const response = await axios.post(`${API}/recordatorios/crear`, body);
    return response;
  } catch (error) {
    console.error('Error en crearRecordatorio:', error);
    throw error;
  }
};

export const actualizarRecordatorio = async (recordatorioId, datos) => {
  try {
    const response = await axios.put(`${API}/recordatorios/${recordatorioId}`, datos);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar recordatorio:', error);
    throw error;
  }
};

export const eliminarRecordatorio = async (recordatorioId) => {
  try {
    const response = await axios.delete(`${API}/recordatorios/${recordatorioId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar recordatorio:', error);
    throw error;
  }
};

export const marcarRecordatorioCumplido = async (recordatorioId, cumplido, fechaOcorrencia) => {
  try {
    const response = await axios.put(`${API}/recordatorios/${recordatorioId}/cumplido`, {
      cumplido,
      fecha_ocurrencia: fechaOcorrencia,
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar cumplido:', error);
    throw error;
  }
};
