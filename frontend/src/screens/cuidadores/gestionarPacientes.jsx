import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, 
  Platform, StatusBar, ActivityIndicator, Alert, StyleSheet, Image 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';
import { vinculacionesService } from '../../services/vinculacionesService';
import { gestionPacientesService } from '../../services/gestionPacientesService';
import InformacionPaciente from './informacion/informacionPaciente';
import BottomTabBar from '../../components/BottomTabBarCuidador';

export default function GestionPacientes() {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('main');
  const [pacientes, setPacientes] = useState([]);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const isScanningRef = useRef(false);

  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const seleccionarPaciente = (paciente) => {
    setPacienteSeleccionado(paciente);
    setView('detalle');
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      setLoading(true);
      const res = await gestionPacientesService.listarMisPacientes();
      if (res.ok) {
        setPacientes(res.pacientes);
      } else {
        console.error("Error al obtener pacientes:", res.error);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (isScanningRef.current) return;
    isScanningRef.current = true;
    setScanned(true);

    try {
      const res = await vinculacionesService.obtenerPacientePorId(data);

      if (res.ok && res.paciente) {
        Alert.alert(
          "Paciente Detectado",
          `¿Quieres vincularte con ${res.paciente.nombre}?`,
          [
            { 
              text: "Cancelar", 
              style: "cancel",
              onPress: () => {
                setScanned(false);
                isScanningRef.current = false;
              }
            },
            { 
              text: "Sí, vincular", 
              onPress: async () => {
                const vinculo = await vinculacionesService.vincularPaciente(data);
                if (vinculo.ok) {
                  Alert.alert("¡Éxito!", "Vinculación completada correctamente.");
                  cargarPacientes();
                  setView('main');  
                } else {
                  Alert.alert("Error", vinculo.error || "No se pudo realizar la vinculación.");
                }
                setScanned(false);
                isScanningRef.current = false;
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", res.error || "Código no válido.", [
          { text: "OK", onPress: () => { isScanningRef.current = false; setScanned(false); } }
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Hubo un problema con el escaneo.");
      isScanningRef.current = false;
      setScanned(false);
    }
  };

  const abrirEscaner = async () => {
    const { granted } = await requestPermission();
    if (!granted) {
      Alert.alert("Permisos", "Se requiere acceso a la cámara para escanear el código del paciente.");
      return;
    }
    setScanned(false);
    isScanningRef.current = false;
    setView('vincular');
  };

  // VISTA DEL ESCÁNER
  const renderScanner = () => (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView 
        style={StyleSheet.absoluteFillObject} 
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned} 
      />
      
      {/* CAPA VISUAL */}
      <View style={styles.scanCameraContainer}>
        <View style={styles.scanMarker} />
        <Text style={styles.scanMarkerText}>Alinea el QR dentro del recuadro</Text>
      </View>

      <TouchableOpacity 
        style={styles.scanCloseModal} 
        onPress={() => setView('main')}
      >
        <MaterialCommunityIcons name="close" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  const renderMainMenu = () => (
    <View style={{ flex: 1 }}>
      {/* HEADER */}
      <View style={[
        styles.topBar, 
        { paddingTop: insets.top }
      ]}>
        <View style={styles.headerActions}>
          <Text style={styles.brandName}>Mis Pacientes</Text>
          <TouchableOpacity 
            style={[styles.headerIconButton, { backgroundColor: '#F3E8FF' }]}
            onPress={abrirEscaner} 
          >
            <MaterialCommunityIcons name="account-plus" size={24} color="#A855F7" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: 0 }]} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateHeaderContainer}>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>  

        {loading ? (
          <ActivityIndicator size="large" color="#A855F7" style={{ marginTop: 50 }} />
        ) : pacientes.length > 0 ? (
                  pacientes.map((paciente) => (
                    <TouchableOpacity key={paciente.uid} style={styles.menuCard}onPress={() => seleccionarPaciente(paciente)}>
                      <View style={styles.menuIconContainer}>
                        {paciente.foto_perfil ? (
                          <Image source={{ uri: paciente.foto_perfil }} style={styles.avatarImage} />
                        ) : (
                          <MaterialCommunityIcons name="account" size={30} color="#A855F7" />
                        )}
                      </View>

                      <View style={{ flex: 1, marginLeft: 5 }}>
                        <Text style={styles.menuTitle}>{paciente.nombre}</Text>
                        <Text style={[styles.menuSubtitle]}> {paciente.correo} </Text>
                      </View>

                      <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
                    </TouchableOpacity>
                  ))
        ) : (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <MaterialCommunityIcons name="account-search-outline" size={80} color="#CBD5E1" />
            <Text style={[styles.menuSubtitle]}>
              No tienes pacientes vinculados todavía.
            </Text>
          </View>
        )}

        {/* CAJA DE AYUDA */}
        <View style={[styles.infoBox, { backgroundColor: '#F8FAFC' }]}>
          <View style={[styles.infoIconCircle, { backgroundColor: '#E2E8F0' }]}>
            <MaterialCommunityIcons name="information-variant" size={24} color="#64748B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>¿Cómo vincular?</Text>
            <Text style={styles.infoText}>
              Pide al paciente que te muestre su código QR desde configuracion del perfil y escanéalo con el botón superior.
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
      {view === 'main' && renderMainMenu()}
      {view === 'vincular' && renderScanner()}
      {view === 'detalle' && (
        <InformacionPaciente 
          paciente={pacienteSeleccionado} 
          onBack={() => setView('main')} 
          styles={styles}
        />
      )}
    </View>
  );
}