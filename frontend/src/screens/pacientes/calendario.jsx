import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../style/styles';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export default function CalendarioView({ onBack }) {
  const [selected, setSelected] = useState('2026-03-03');

  const markedDates = {
    [selected]: { selected: true, disableTouchEvent: true, selectedColor: '#4D6BFE' },
    '2026-03-05': { marked: true, dotColor: '#3B82F6' },
    '2026-03-12': { marked: true, dotColor: '#3B82F6' },
    '2026-03-18': { marked: true, dotColor: '#3B82F6' },
    '2026-03-25': { marked: true, dotColor: '#3B82F6' },
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: 'white' }}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#334155" />
        </TouchableOpacity>
        <Text style={[styles.brandName, { marginLeft: 10 }]}>Calendario</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Card del Calendario */}
        <View style={[styles.settingsCard, { padding: 10, borderRadius: 25 }]}>
          <Calendar
            current={'2026-03-01'}
            onDayPress={day => setSelected(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#64748B',
              selectedDayBackgroundColor: '#4D6BFE',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#4D6BFE',
              dayTextColor: '#334155',
              textDisabledColor: '#CBD5E1',
              dotColor: '#4D6BFE',
              selectedDotColor: '#ffffff',
              arrowColor: '#64748B',
              monthTextColor: '#1E293B',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14
            }}
          />
        </View>

        {/* Leyenda de tipos de recordatorios */}
        <View style={[styles.settingsCard, { marginTop: 20, padding: 20 }]}>
          <Text style={[styles.sectionTitle, { marginBottom: 15 }]}>Tipos de recordatorios</Text>
          
          <LegendItem color="#3B82F6" label="Medicación" />
          <LegendItem color="#10B981" label="Cita médica" />
          <LegendItem color="#A855F7" label="Tarea" />
          <LegendItem color="#F59E0B" label="Evento personal" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-componente para la leyenda
const LegendItem = ({ color, label }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color, marginRight: 10 }} />
    <Text style={{ fontSize: 15, color: '#475569' }}>{label}</Text>
  </View>
);