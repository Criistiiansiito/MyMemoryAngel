import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, 
  Platform, StatusBar, ActivityIndicator, Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';

import BottomTabBar from '../../components/BottomTabBarCuidador';

export default function GestionPacientes() {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('main'); 
  const [pacientes, setPacientes] = useState([
    { id: 1, nombre: 'Carmen García', edad: 82, ultimaActividad: 'Hace 2 horas' },
    { id: 2, nombre: 'Ricardo Manuel', edad: 75, ultimaActividad: 'Ayer' },
  ]);

  const [selectedPaciente, setSelectedPaciente] = useState(null);

  if (selectedPaciente) {

    console.log("Paciente seleccionado:", selectedPaciente.nombre);
  }

  const renderMainMenu = () => (
    <View style={{ flex: 1 }}>
      {/* CABECERA */}
      <View style={[
        styles.topBar, 
        { paddingTop: Platform.OS === 'ios' ? insets.top : 20 }
      ]}>
        <View style={styles.headerActions}>
          <Text style={styles.brandName}>Mis Pacientes</Text>
          <TouchableOpacity 
            style={[styles.headerIconButton, { backgroundColor: '#F3E8FF' }]}
            onPress={() => setView('vincular')} 
          >
            <MaterialCommunityIcons name="account-plus" size={24} color="#A855F7" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100, paddingTop: 0 }]} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateHeaderContainer}>
          <Text style={styles.dateText}>Panel de supervisión</Text>
        </View>

        {/* LISTADO DE PACIENTES */}
        {pacientes.length > 0 ? (
          pacientes.map((paciente) => (
            <TouchableOpacity 
              key={paciente.id} 
              style={[styles.menuCard, { height: 100, borderLeftWidth: 4, borderLeftColor: '#A855F7' }]}
              onPress={() => setSelectedPaciente(paciente)}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#F3E8FF', borderRadius: 50 }]}>
                <MaterialCommunityIcons name="account" size={30} color="#A855F7" />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.menuTitle}>{paciente.nombre}</Text>
                <Text style={styles.menuSubtitle}>{paciente.edad} años • {paciente.ultimaActividad}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <MaterialCommunityIcons name="account-search-outline" size={80} color="#CBD5E1" />
            <Text style={[styles.menuSubtitle, { textAlign: 'center', marginTop: 10 }]}>
              No tienes pacientes vinculados todavía.
            </Text>
          </View>
        )}

        {/* CAJA DE INFORMACIÓN / AYUDA */}
        <View style={[styles.infoBox, { marginTop: 20, backgroundColor: '#F8FAFC' }]}>
          <View style={[styles.infoIconCircle, { backgroundColor: '#E2E8F0' }]}>
            <MaterialCommunityIcons name="information-variant" size={24} color="#64748B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>¿Cómo vincular?</Text>
            <Text style={styles.infoText}>
              Pulsa el botón de arriba para añadir un nuevo paciente mediante su código identificador único.
            </Text>
          </View>
        </View>

      </ScrollView>

      <BottomTabBar />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#A855F7" />
        </View>
      ) : (
        <>
          {view === 'main' && renderMainMenu()}
          
          {view === 'vincular' && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
               <MaterialCommunityIcons name="qrcode-scan" size={100} color="#A855F7" />
               <Text style={styles.menuTitle}>Vincular Paciente</Text>
               <Text style={[styles.menuSubtitle, { textAlign: 'center' }]}>
                 Aquí iría el escáner o el input para el código del paciente.
               </Text>
               <TouchableOpacity 
                 style={[styles.musicaUploadButton, { backgroundColor: '#A855F7', marginTop: 20 }]}
                 onPress={() => setView('main')}
               >
                 <Text style={styles.musicaUploadButtonText}>Volver</Text>
               </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}