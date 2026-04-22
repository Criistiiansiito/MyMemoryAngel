import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';
import {
  fetchRecordatoriosCalendario,
  fetchRecordatoriosCalendarioPorUsuario,
  getIconConfig,
  formatearFechaYHora,
  getStoredUser,
} from '../../services/recordatoriosService';
import { gestionPacientesService } from '../../services/gestionPacientesService';
import { useCurrentDate } from '../../hooks/useCurrentDate';
import { formatMadridDate, toMadridDateOnly } from '../../utils/dateMadrid';

LocaleConfig.locales.es = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

const toDateOnly = (value) => toMadridDateOnly(value);

const getMonthRange = (dateString) => {
  const baseDate = new Date(`${dateString}T00:00:00`);
  const from = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const to = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
  return {
    from: toDateOnly(from),
    to: toDateOnly(to),
  };
};

export default function CalendarioCuidador({ navigation }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const currentDate = useCurrentDate();
  const today = toDateOnly(currentDate);
  const [selected, setSelected] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today);
  const [reminders, setReminders] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const lastTodayRef = useRef(today);

  const actualizarMarcadores = (lista, diaSeleccionado) => {
    const marcas = {};
    lista.forEach((item, index) => {
      const fecha = item.fecha_ocurrencia || item.fecha_hora.substring(0, 10);
      if (!marcas[fecha]) marcas[fecha] = { dots: [] };
      const config = getIconConfig(item.tipo);
      if (marcas[fecha].dots.length < 3) {
        marcas[fecha].dots.push({ key: `${item.id_recordatorio}-${fecha}-${index}`, color: config.iconColor });
      }
    });

    marcas[diaSeleccionado] = {
      ...marcas[diaSeleccionado],
      selected: true,
      selectedColor: '#8B5CF6',
    };
    setMarkedDates(marcas);
  };

  const cargarDatos = useCallback(async (monthDate = currentMonth, selectedDate = selected) => {
    try {
      if (reminders.length === 0) setLoading(true);
      const { from, to } = getMonthRange(monthDate);

      const usuario = await getStoredUser();
      const propios = await fetchRecordatoriosCalendario(from, to);

      let listaFinal = [];
      if (propios.ok) {
        listaFinal = (propios.data || []).map((item) => ({
          ...item,
          origen_nombre: 'Mis recordatorios',
          origen_uid: usuario?.uid || null,
        }));
      }

      const pacientesRes = await gestionPacientesService.listarMisPacientes();
      if (pacientesRes.ok && Array.isArray(pacientesRes.pacientes)) {
        const resultadosPacientes = await Promise.all(
          pacientesRes.pacientes.map(async (paciente) => {
            const result = await fetchRecordatoriosCalendarioPorUsuario(paciente.uid, from, to);
            if (!result.ok) return [];

            return (result.data || []).map((item) => ({
              ...item,
              origen_nombre: paciente.nombre || 'Paciente vinculado',
              origen_uid: paciente.uid,
            }));
          })
        );

        listaFinal = [...listaFinal, ...resultadosPacientes.flat()];
      }

      listaFinal.sort((a, b) => {
        if (a.fecha_ocurrencia === b.fecha_ocurrencia) {
          return String(a.fecha_hora).localeCompare(String(b.fecha_hora));
        }
        return String(a.fecha_ocurrencia).localeCompare(String(b.fecha_ocurrencia));
      });

      setReminders(listaFinal);
      actualizarMarcadores(listaFinal, selectedDate);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, reminders.length, selected]);

  useFocusEffect(
    useCallback(() => {
      cargarDatos(currentMonth, selected);
    }, [cargarDatos, currentMonth, selected])
  );

  useEffect(() => {
    if (lastTodayRef.current !== today) {
      lastTodayRef.current = today;
      setSelected(today);
      setCurrentMonth(today);
      cargarDatos(today, today);
    }
  }, [today, cargarDatos]);

  const recordatoriosDelDia = reminders.filter(
    (r) => (r.fecha_ocurrencia || r.fecha_hora.substring(0, 10)) === selected
  );

  const textoSeparador = () => {
    const d = new Date(`${selected}T00:00:00`);
    return `Eventos para el ${formatMadridDate(d, { day: 'numeric', month: 'short' })}`;
  };

  const renderEstadoCalendario = (item) => {
    if (item.estado_calendario === 'cumplido') {
      return <MaterialCommunityIcons name="check-circle" size={25} color="#16A34A" />;
    }
    if (item.estado_calendario === 'incumplido') {
      return <MaterialCommunityIcons name="close-circle" size={25} color="#EF4444" />;
    }
    return <MaterialCommunityIcons name="progress-clock" size={25} color="#f59f0b9d" />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Calendario</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarCard}>
          <Calendar
            current={selected}
            onDayPress={(day) => {
              setSelected(day.dateString);
              actualizarMarcadores(reminders, day.dateString);
            }}
            onMonthChange={(month) => {
              const nextMonth = `${month.year}-${String(month.month).padStart(2, '0')}-01`;
              setCurrentMonth(nextMonth);
            }}
            markedDates={markedDates}
            markingType="multi-dot"
            theme={styles.calendarTheme}
          />
        </View>

        <View style={[styles.dividerContainer, { marginVertical: 20 }]}>
          <View style={styles.dividerLine} />
          <Text style={[styles.dividerText, { color: '#8B5CF6', fontWeight: 'bold' }]}>
            {textoSeparador()}
          </Text>
          <View style={styles.dividerLine} />
        </View>

        {loading ? (
          <ActivityIndicator color="#8B5CF6" style={styles.centeredLoader} />
        ) : recordatoriosDelDia.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="calendar-blank" size={50} color="#CBD5E0" />
            <Text style={styles.emptyStateText}>No hay eventos este dia</Text>
          </View>
        ) : (
          recordatoriosDelDia.map((item, index) => {
            const config = getIconConfig(item.tipo);
            const { fecha, hora } = formatearFechaYHora(item.fecha_hora);

            return (
              <View key={`${item.id_recordatorio}-${item.fecha_ocurrencia}-${index}`} style={styles.menuCard}>
                <View style={[styles.menuIconContainer, { backgroundColor: config.color }]}>
                  <MaterialCommunityIcons name={config.icon} size={28} color={config.iconColor} />
                </View>

                <View style={styles.reminderInfoBody}>
                  <Text style={styles.menuTitle} numberOfLines={1}>{item.titulo}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color="#64748B" />
                    <Text style={[styles.menuSubtitle, { marginLeft: 5, marginBottom: 0 }]}>
                      {fecha} | {hora}
                    </Text>
                  </View>
                  {item.origen_nombre ? (
                    <View style={[styles.reminderFooterRow, { marginTop: 6 }]}>
                      <MaterialCommunityIcons name="account-outline" size={14} color="#64748B" />
                      <Text style={[styles.typeTabText, { marginLeft: 6 }]}>{item.origen_nombre}</Text>
                    </View>
                  ) : null}
                </View>

                {renderEstadoCalendario(item)}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
