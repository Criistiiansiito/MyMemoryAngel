import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, TextInput, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { styles } from '../../style/styles';

const API = Platform.OS === 'web' ? 'http://localhost:5000/api' : 'http://172.20.10.5:5000/api';

export default function ConfiguracionPaciente({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // 1. El estado ahora guarda la etiqueta, pero usaremos una función para obtener el número
  const [textSizeLabel, setTextSizeLabel] = useState('Mediano');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isDaltonic, setIsDaltonic] = useState(false);

  // 2. Función auxiliar para convertir la etiqueta en un tamaño real
  const getFontSize = (baseSize) => {
    switch (textSizeLabel) {
      case 'Pequeño': return baseSize - 4;
      case 'Grande': return baseSize + 6;
      default: return baseSize;
    }
  };

  useEffect(() => {
    obtenerDatosPerfil();
  }, []);

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
    if (resultPermission.granted === false) {
      alert("Se necesitan permisos para acceder a la galería");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
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
        <View style={styles.logoRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#334155" />
          </TouchableOpacity>
          <Text style={[styles.brandName, { marginLeft: 15, fontSize: getFontSize(22) }]}>Mi Perfil y Ajustes</Text>
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

          <Text style={[styles.label, { fontSize: getFontSize(14) }]}>Nombre completo</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="account" size={20} color="#A0AEC0" style={styles.inputIcon} />
            <TextInput 
              style={[styles.input, { fontSize: getFontSize(16) }]} 
              value={nombre} 
              onChangeText={setNombre}
              placeholder="Nombre"
            />
          </View>

          <Text style={[styles.label, { fontSize: getFontSize(14) }]}>Correo electrónico</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
            <TextInput 
              style={[styles.input, { fontSize: getFontSize(16) }]} 
              value={email} 
              editable={false} 
              color="#94A3B8" 
            />
          </View>

          <TouchableOpacity style={[styles.mainButton, { marginTop: 25 }]}>
            <Text style={[styles.mainButtonText, { fontSize: getFontSize(16) }]}>Guardar Cambios</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={[styles.dividerText, { fontSize: getFontSize(14) }]}>Configuración</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* CARD: TAMAÑO DE TEXTO */}
        <View style={styles.settingsCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="format-size" size={22} color="#4D6BFE" />
            <Text style={[styles.sectionTitle, { fontSize: getFontSize(18) }]}>Tamaño del texto</Text>
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
                onPress={() => setTextSizeLabel(size)} // Cambia el estado
              >
                <Text style={[
                  styles.optionText, 
                  { fontSize: 14 },
                  textSizeLabel === size && styles.optionTextActive
                ]}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CARD: ACCESIBILIDAD / COLORES */}
        <View style={styles.settingsCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons 
              name="eye-outline" 
              size={22} 
              color={isDaltonic ? "#000000" : "#8B5CF6"} 
            />
            <Text style={[styles.sectionTitle, { fontSize: getFontSize(18) }]}>Accesibilidad de colores</Text>
          </View>
          
          <View style={styles.rowSpace}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={{ 
                fontSize: getFontSize(16), 
                color: '#2D3748', 
                fontWeight: '600' 
              }}>
                Modo Daltónico
              </Text>
              <Text style={{ 
                fontSize: getFontSize(13), 
                color: '#718096', 
                marginTop: 2 
              }}>
                Optimiza el contraste y los colores de la interfaz.
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#CBD5E0", true: isDaltonic ? "#000000" : "#8B5CF6" }}
              thumbColor={isDaltonic ? "#FFFFFF" : "#F4F3F4"}
              onValueChange={setIsDaltonic}
              value={isDaltonic}
            />
          </View>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.rowSpace}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="volume-high" size={22} color="#F59E0B" />
              <Text style={[styles.sectionTitle, { fontSize: getFontSize(18) }]}>Audio</Text>
            </View>
            <Switch
              trackColor={{ false: "#CBD5E0", true: "#4D6BFE" }}
              thumbColor={audioEnabled ? "#FFFFFF" : "#F4F3F4"}
              onValueChange={setAudioEnabled}
              value={audioEnabled}
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}