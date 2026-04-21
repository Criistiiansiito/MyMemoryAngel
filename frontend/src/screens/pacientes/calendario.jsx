import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';
import { fetchRecordatoriosCalendario, getIconConfig, formatearFechaYHora } from '../../services/recordatoriosService';

LocaleConfig.locales.es = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

const toDateOnly = (value) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMonthRange = (dateString) => {
  const baseDate = new Date(`${dateString}T00:00:00`);
  const from = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const to = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
  return {
    from: toDateOnly(from),
    to: toDateOnly(to),
  };
};

export default function CalendarioView({ navigation }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const today = toDateOnly(new Date());
  const [selected, setSelected] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today);
  const [reminders, setReminders] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);

  const actualizarMarcadores = (lista, diaSeleccionado) => {
    const marcas = {};
    lista.forEach((item) => {
      const fecha = item.fecha_ocurrencia || item.fecha_hora.substring(0, 10);
      if (!marcas[fecha]) marcas[fecha] = { dots: [] };
      const config = getIconConfig(item.tipo);
      if (marcas[fecha].dots.length < 3) {
        marcas[fecha].dots.push({ key: `${item.id_recordatorio}-${fecha}`, color: config.iconColor });
      }
    });

    marcas[diaSeleccionado] = {
      ...marcas[diaSeleccionado],
      selected: true,
      selectedColor: '#4D6BFE',
    };
    setMarkedDates(marcas);
  };

  const cargarDatos = useCallback(async (monthDate = currentMonth, selectedDate = selected) => {
    try {
      setLoading(true);
      const { from, to } = getMonthRange(monthDate);
      const result = await fetchRecordatoriosCalendario(from, to);
      if (result.ok) {
        setReminders(result.data);
        actualizarMarcadores(result.data, selectedDate);
      } else {
        setReminders([]);
        actualizarMarcadores([], selectedDate);
      }
    } finally {
      setLoading(false);
    }
  }, [currentMonth, selected]);

  useFocusEffect(
    useCallback(() => {
      cargarDatos(currentMonth, selected);
    }, [cargarDatos, currentMonth, selected])
  );

  const recordatoriosDelDia = reminders.filter(
    (r) => (r.fecha_ocurrencia || r.fecha_hora.substring(0, 10)) === selected
  );

  const textoSeparador = () => {
    const d = new Date(`${selected}T00:00:00`);
    return `Eventos para el ${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
  };

  const renderEstadoCalendario = (item) => {
    if (item.estado_calendario === 'cumplido') {
      return <MaterialCommunityIcons name="check-circle" size={25} color="#16A34A" marginRight={5}/>;
    }
    if (item.estado_calendario === 'incumplido') {
      return <MaterialCommunityIcons name="close-circle" size={25} color="#EF4444" marginRight={5} />;
    }
    return <MaterialCommunityIcons name="progress-clock" size={25} color="#f59f0b9d" marginRight={5} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Mi calendario</Text>
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
          <Text style={[styles.dividerText, { color: '#4D6BFE', fontWeight: 'bold' }]}>
            {textoSeparador()}
          </Text>
          <View style={styles.dividerLine} />
        </View>

        {loading ? (
          <ActivityIndicator color="#4D6BFE" style={styles.centeredLoader} />
        ) : recordatoriosDelDia.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="calendar-blank" size={50} color="#CBD5E0" />
            <Text style={styles.emptyStateText}>No hay eventos este día</Text>
          </View>
        ) : (
          recordatoriosDelDia.map((item) => {
            const config = getIconConfig(item.tipo);
            const { fecha, hora } = formatearFechaYHora(item.fecha_hora);

            return (
              <View key={`${item.id_recordatorio}-${item.fecha_ocurrencia}`} style={styles.menuCard}>
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
