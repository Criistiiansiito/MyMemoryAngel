import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Estilos y servicios
import { styles } from '../../style/styles';
import { 
  fetchRecordatorios, 
  getIconConfig, 
  formatearFechaYHora 
} from '../../services/recordatoriosService';

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
  const [selected, setSelected] = useState(new Date().toISOString().split('T')[0]);
  const [reminders, setReminders] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);

  // Cargar datos del backend
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

  // Puntos debajo de los días
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

  // Filtrar eventos por el día seleccionado
  const recordatoriosDelDia = reminders.filter(r => 
    r.fecha_hora && r.fecha_hora.substring(0, 10) === selected
  );

  // Formatear el texto de la barra separadora
  const textoSeparador = () => {
    const d = new Date(selected + "T00:00:00");
    const opciones = { day: 'numeric', month: 'short' };
    return `Eventos para el ${d.toLocaleDateString('es-ES', opciones)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header simple */}
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={[styles.brandName]}>Mi calendario</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
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
    </SafeAreaView>
  );
}