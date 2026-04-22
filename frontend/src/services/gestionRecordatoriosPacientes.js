import axios from 'axios';
import { Platform } from 'react-native';

import { parseMySQLDateTime } from './recordatoriosService';
import { toMadridDateOnly } from '../utils/dateMadrid';

const API =
  Platform.OS === 'web'
    ? 'http://localhost:5000/api'
    : `http://${process.env.EXPO_PUBLIC_IP}:5000/api`;

const addDays = (dateString, delta) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + delta);
  return toMadridDateOnly(date);
};

export const gestionRecordatoriosPacientesService = {
  listarRecordatoriosPaciente: async (pacienteId) => {
    try {
      if (!pacienteId) {
        return { ok: false, recordatorios: [] };
      }

      const response = await axios.get(`${API}/auth/recordatorios/${pacienteId}`);
      return { ok: true, recordatorios: response.data.recordatorios || [] };
    } catch (error) {
      console.error('Error cargando recordatorios del paciente:', error);
      return { ok: false, recordatorios: [], error };
    }
  },

  obtenerHistorialUltimoMesPaciente: async (pacienteId) => {
    try {
      if (!pacienteId) {
        return { ok: false, historial: [] };
      }

      const today = toMadridDateOnly(new Date());
      const from = addDays(today, -30);

      const response = await axios.get(`${API}/auth/recordatorios-calendario/${pacienteId}`, {
        params: { from, to: today },
      });

      const historial = (response.data.recordatorios || [])
        .filter((item) => item.fecha_ocurrencia && item.fecha_ocurrencia <= today)
        .sort((a, b) => {
          if (a.fecha_ocurrencia === b.fecha_ocurrencia) {
            return parseMySQLDateTime(a.fecha_hora) - parseMySQLDateTime(b.fecha_hora);
          }
          return a.fecha_ocurrencia < b.fecha_ocurrencia ? 1 : -1;
        });

      return { ok: true, historial };
    } catch (error) {
      console.error('Error cargando historial de recordatorios:', error);
      return { ok: false, historial: [], error };
    }
  },
};
