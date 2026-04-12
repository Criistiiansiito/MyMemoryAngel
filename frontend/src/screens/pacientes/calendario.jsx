import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform, StatusBar } from 'react-native';
// Importamos el hook y quitamos SafeAreaView
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Estilos y servicios
import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';
import { fetchRecordatorios, getIconConfig, formatearFechaYHora } from '../../services/recordatoriosService';

// Idioma del calendario
LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export default function CalendarioView({ navigation }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  
  // Hook para el notch de iOS
  const insets = useSafeAreaInsets();

  const [selected, setSelected] = useState(new Date().toISOString().split('T')[0]);
  const [reminders, setReminders] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const result = await fetchRecordatorios();
      if (result.ok) {
        setReminders(result.data);
        actualizarMarcadores(result.data, selected);
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarMarcadores = (lista, diaSeleccionado) => {
    const marcas = {};
    lista.forEach(item => {
      const fecha = item.fecha_hora.substring(0, 10);
      if (!marcas[fecha]) marcas[fecha] = { dots: [] };
      const config = getIconConfig(item.tipo);
      if (marcas[fecha].dots.length < 3) {
        marcas[fecha].dots.push({ key: String(item.id_recordatorio), color: config.iconColor });
      }
    });

    marcas[diaSeleccionado] = { 
      ...marcas[diaSeleccionado], 
      selected: true, 
      selectedColor: '#4D6BFE' 
    };
    setMarkedDates(marcas);
  };

  useFocusEffect(useCallback(() => { cargarDatos(); }, []));

  const recordatoriosDelDia = reminders.filter(r => 
    r.fecha_hora && r.fecha_hora.substring(0, 10) === selected
  );

  const textoSeparador = () => {
    const d = new Date(selected + "T00:00:00");
    const opciones = { day: 'numeric', month: 'short' };
    return `Eventos para el ${d.toLocaleDateString('es-ES', opciones)}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER CON PADDING DINÁMICO */}
      <View style={[
        styles.topBar, 
        { paddingTop: Platform.OS === 'ios' ? insets.top : 20 }
      ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Mi calendario</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* Card del Calendario */}
        <View style={styles.calendarCard}>
          <Calendar
            current={selected}
            onDayPress={(day) => {
              setSelected(day.dateString);
              actualizarMarcadores(reminders, day.dateString);
            }}
            markedDates={markedDates}
            markingType={'multi-dot'}
            theme={styles.calendarTheme} 
          />
        </View>

        {/* BARRA SEPARADORA DINÁMICA */}
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
              <TouchableOpacity 
                key={item.id_recordatorio} 
                style={styles.menuCard}
                onPress={() => navigation.navigate('ModificarRecordatorio', { recordatorio: item })}
              >
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
                <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}