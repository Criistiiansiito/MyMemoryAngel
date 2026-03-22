import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../style/styles'; // Tu CSS original
import BottomTabBar from '../../components/BottomTabBar';

export default function Recordatorios({ navigation }) {
 
  const [reminders] = useState([
    { id: 1, time: '08:00', title: 'Desayuno', desc: 'Tomar medicamento con comida', icon: 'silverware-fork-knife', color: '#FFEDD5', iconColor: '#F97316', completed: true },
    { id: 2, time: '14:00', title: 'Medicamento', desc: 'Pastilla azul después de comer', icon: 'pill', color: '#DBEAFE', iconColor: '#3B82F6', completed: false },
    { id: 3, time: '20:00', title: 'Cena', desc: 'Cenar ligero', icon: 'silverware-fork-knife', color: '#DCFCE7', iconColor: '#22C55E', completed: false },
    { id: 4, time: '22:00', title: 'Dormir', desc: 'Hora de descansar', icon: 'moon-waning-crescent', color: '#F3E8FF', iconColor: '#A855F7', completed: false },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER DINÁMICO */}
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.brandName}>Recordatorios</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.navigate('Calendario')}>
              <MaterialCommunityIcons name="calendar-month-outline" size={24} color="#8B5CF6" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerIconButton, { backgroundColor: '#4D6BFE' }]} onPress={() => navigation.navigate('NuevoRecordatorio')}>
              <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* FECHA */}
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <Text style={styles.dateText}>Hoy, martes, 3 de marzo</Text>
        </View>

        {/* LISTA DE CARDS */}
        {reminders.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[
              styles.menuCard, 
              item.completed && { borderColor: '#4ADE80', borderWidth: 1.5 }
            ]}
          >
            {/* ICONO IZQUIERDA */}
            <View style={[styles.menuIconContainer, { backgroundColor: item.color }]}>
              <MaterialCommunityIcons name={item.icon} size={30} color={item.iconColor} />
            </View>

            {/* TEXTO */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 8 }}>
                  <Text style={{ color: '#4D6BFE', fontWeight: 'bold', fontSize: 12 }}>{item.time}</Text>
                </View>
                {item.completed && (
                  <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ color: '#16A34A', fontSize: 11, fontWeight: '700' }}>✓ Completado</Text>
                  </View>
                )}
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
}