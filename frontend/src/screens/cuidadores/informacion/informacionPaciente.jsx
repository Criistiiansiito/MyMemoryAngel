import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, StatusBar, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function InformacionPaciente({ paciente, onBack, styles }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={[styles.topBar, { paddingTop: Platform.OS === 'ios' ? insets.top : 20 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={onBack}>
                    <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
                </TouchableOpacity>
                <Text style={styles.brandName}>Paciente</Text>
            </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 15}}>

        {/* RECUADRO DE PERFIL DEL PACIENTE */}
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <View style={[ styles.iconCircle, { backgroundColor: '#F3E8FF', width: 120, height: 120, borderRadius: 60, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }]}>
            {paciente?.foto_perfil ? (
              <Image source={{ uri: paciente.foto_perfil }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <MaterialCommunityIcons name="account" size={60} color="#6B21A8" />
            )}
          </View>

          <Text style={[styles.menuTitle, { fontSize: 22, textAlign: 'center' }]}>
            {paciente?.nombre || 'Paciente'}
          </Text>
        </View>

        {/* INFORMACIÓN GENERAL */}
        <TouchableOpacity 
          style={styles.menuCard} 
          onPress={() => console.log("Ir a Información General")}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: '#F3E8FF' }]}>
            <MaterialCommunityIcons name="account-details-outline" size={28} color="#A855F7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Información General</Text>
            <Text style={styles.menuSubtitle}>Datos personales y contacto</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
        </TouchableOpacity>

        {/* MÚSICA */}
          <TouchableOpacity 
            style={styles.menuCard} 
            onPress={() => navigation.navigate('GestionarMusicaPaciente', { paciente: paciente })}
          >
          <View style={[styles.menuIconContainer, { backgroundColor: '#E1E7FF' }]}>
            <MaterialCommunityIcons name="music-note-outline" size={28} color="#4D6BFE" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Música</Text>
            <Text style={styles.menuSubtitle}>Preferencias y listas del paciente</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
        </TouchableOpacity>

        {/* ESCRITOS */}
        <TouchableOpacity 
          style={styles.menuCard} 
          onPress={() => console.log("Ir a Escritos")}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: '#DCFCE7' }]}>
            <MaterialCommunityIcons name="fountain-pen-tip" size={28} color="#22C55E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Escritos</Text>
            <Text style={styles.menuSubtitle}>Notas y reflexiones compartidas</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
        </TouchableOpacity>

        {/* RECORDATORIOS */}
        <TouchableOpacity 
          style={styles.menuCard} 
          onPress={() => console.log("Ir a Recordatorios")}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: '#FEF3C7' }]}>
            <MaterialCommunityIcons name="bell-outline" size={28} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Recordatorios</Text>
            <Text style={styles.menuSubtitle}>Supervisión de medicación y citas</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
        </TouchableOpacity>

        {/* CARD: PROGRESO DE LOS JUEGOS */}
        <TouchableOpacity 
          style={styles.menuCard} 
          onPress={() => console.log("Ir a Progreso de los juegos")}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: '#E0F2FE' }]}>
            <MaterialCommunityIcons name="controller-classic-outline" size={28} color="#0EA5E9" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Progreso en juegos</Text>
            <Text style={styles.menuSubtitle}>Desempeño cognitivo</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
        </TouchableOpacity>     

      </ScrollView>
    </View>
  );
}