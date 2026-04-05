import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, TextInput, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { getStyles } from '../../style/styles';
// 1. Importamos el hook global
import { useAccesibilidad } from '../../services/accesibilidadContext'; 

const API = Platform.OS === 'web' ? 'http://localhost:5000/api' : 'http://172.20.10.5:5000/api';

export default function ConfiguracionPaciente({ navigation }) {
  const { aplicarEscala, textSizeLabel, setTextSizeLabel } = useAccesibilidad();
  const styles = getStyles(aplicarEscala);
  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDaltonic, setIsDaltonic] = useState(false);

  useEffect(() => { obtenerDatosPerfil(); }, []);

  const obtenerDatosPerfil = async () => {
    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('userToken') : await SecureStore.getItemAsync('userToken');
      const res = await axios.get(`${API}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.ok) {
        setNombre(res.data.usuario.nombre);
        setEmail(res.data.usuario.correo);
        if (res.data.usuario.foto_perfil) setProfilePhoto(res.data.usuario.foto_perfil);
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let resultPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!resultPermission.granted) {
      alert("Se necesitan permisos para acceder a la galería");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) setProfilePhoto(result.assets[0].uri);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#4D6BFE" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={[styles.brandName, { fontSize: aplicarEscala(18) }]}>Configuración de mi perfil</Text>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.profilePhotoContainer} onPress={pickImage}>
            <View style={styles.photoCircle}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={{ width: 130, height: 130, borderRadius: 65 }} />
              ) : (
                <MaterialCommunityIcons name="account" size={80} color="#334155" />
              )}
            </View>
            <View style={styles.editPhotoButton}>
              <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Aplicamos aplicarEscala(valorBase) a cada texto */}
          <Text style={[styles.label, { fontSize: aplicarEscala(14) }]}>Nombre completo</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="account" size={20} color="#A0AEC0" style={styles.inputIcon} />
            <TextInput 
              style={[styles.input, { fontSize: aplicarEscala(16) }]} 
              value={nombre} 
              onChangeText={setNombre}
              placeholder="Nombre"
            />
          </View>

          <Text style={[styles.label, { fontSize: aplicarEscala(14) }]}>Correo electrónico</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
            <TextInput 
              style={[styles.input, { fontSize: aplicarEscala(16) }]} 
              value={email} 
              editable={false} 
              color="#94A3B8" 
            />
          </View>

          <TouchableOpacity style={[styles.mainButton, { marginTop: 25 }]}>
            <Text style={[styles.mainButtonText, { fontSize: aplicarEscala(16) }]}>Guardar Cambios</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={[styles.dividerText, { fontSize: aplicarEscala(14) }]}>Configuración</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* CARD: TAMAÑO DE TEXTO */}
        <View style={styles.settingsCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="format-size" size={22} color="#4D6BFE" />
            <Text style={[styles.sectionTitle, { fontSize: aplicarEscala(18) }]}>Tamaño del texto</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {['Pequeño', 'Mediano', 'Grande'].map((size) => (
              <TouchableOpacity 
                key={size}
                style={[
                  styles.optionButton, 
                  { flex: 1, marginHorizontal: 4 },
                  textSizeLabel === size && styles.optionButtonActive
                ]}
                onPress={() => setTextSizeLabel(size)} 
              >
                <Text style={[
                  styles.optionText, 
                  { fontSize: aplicarEscala(14) },
                  textSizeLabel === size && styles.optionTextActive
                ]}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* MODO DALTÓNICO Y AUDIO USANDO EL ESCALADO */}
        <View style={styles.settingsCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="eye-outline" size={22} color={isDaltonic ? "#000" : "#8B5CF6"} />
            <Text style={[styles.sectionTitle, { fontSize: aplicarEscala(18) }]}>Accesibilidad</Text>
          </View>
          <View style={styles.rowSpace}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: aplicarEscala(16), fontWeight: '600' }}>Modo Daltónico</Text>
            </View>
            <Switch onValueChange={setIsDaltonic} value={isDaltonic} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}