import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';
import { configuracionPerfil } from '../../../services/configuracionPerfil';

export default function GestionarInformacionGeneralPaciente({ route, navigation }) {
  const { aplicarEscala } = useAccesibilidad();
  const [previewDaltonic, setPreviewDaltonic] = useState(false);
  const styles = getStyles(aplicarEscala, previewDaltonic);
  const insets = useSafeAreaInsets();

  const { paciente } = route.params;
  const pacienteId = paciente?.uid || paciente?.id;

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [fechaSQL, setFechaSQL] = useState('');
  const [dateText, setDateText] = useState('dd/mm/aaaa');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  const [textSizeLabel, setTextSizeLabel] = useState('Mediano');
  const [isDaltonic, setIsDaltonic] = useState(false);

  useEffect(() => {
    cargarDatosPaciente();
  }, []);

  const cargarDatosPaciente = async () => {
    try {
      const data = await configuracionPerfil.obtenerPerfilPaciente(pacienteId);

      if (data?.ok && data?.usuario) {
        const usuario = data.usuario;

        setNombre(usuario.nombre || '');
        setEmail(usuario.correo || '');
        setTextSizeLabel(usuario.tamano_texto || 'Mediano');
        setIsDaltonic(!!usuario.modo_daltonico);
        setPreviewDaltonic(!!usuario.modo_daltonico);

        if (usuario.fecha_nacimiento) {
          const fechaLimpia = usuario.fecha_nacimiento.split('T')[0];
          setFechaSQL(fechaLimpia);

          const [year, month, day] = fechaLimpia.split('-');
          setDateText(`${day}/${month}/${year}`);
        }

        if (usuario.foto_perfil) {
          setProfilePhoto(usuario.foto_perfil);
        }
      }
    } catch (error) {
      console.error('Error al cargar perfil del paciente:', error);
      Alert.alert('Error', 'No se pudo cargar la información del paciente.');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);

    if (selectedDate) {
      setDateText(selectedDate.toLocaleDateString('es-ES'));
      const isoDate = selectedDate.toISOString().split('T')[0];
      setFechaSQL(isoDate);
    }
  };

  const pickImage = async () => {
    const resultPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!resultPermission.granted) {
      Alert.alert('Permisos', 'Se necesitan permisos para acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
      base64: true,
    });

    if (!result.canceled) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setProfilePhoto(base64Image);
    }
  };

  const manejarCambioTamano = (size) => {
    setTextSizeLabel(size);
  };

  const manejarCambioDaltonismo = (val) => {
    setIsDaltonic(val);
    setPreviewDaltonic(val);
  };

  const manejarGuardarPerfil = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio.');
      return;
    }

    try {
      setLoading(true);

      const res = await configuracionPerfil.actualizarPerfilPaciente(pacienteId, {
        nombre,
        foto_perfil: profilePhoto,
        fecha_nacimiento: fechaSQL,
        tamano_texto: textSizeLabel,
        modo_daltonico: isDaltonic ? 1 : 0,
      });

      if (res?.ok) {
        Alert.alert('Hecho', 'La información del paciente se ha actualizado correctamente.');
      } else {
        Alert.alert('Error', 'No se pudieron guardar los cambios.');
      }
    } catch (error) {
      console.error('Error al guardar perfil del paciente:', error);
      Alert.alert('Error', 'Hubo un problema al guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4D6BFE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Información General</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.profilePhotoContainer} onPress={pickImage}>
            <View style={styles.photoCircle}>
              {profilePhoto ? (
                <Image
                  source={{ uri: profilePhoto }}
                  style={{ width: 130, height: 130, borderRadius: 65 }}
                />
              ) : (
                <MaterialCommunityIcons name="account" size={80} color="#334155" />
              )}
            </View>

            <View style={styles.editPhotoButton}>
              <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.label}>Nombre completo</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="account-outline" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre del paciente"
            />
          </View>

          <Text style={styles.label}>Correo electrónico</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: '#94A3B8' }]}
              value={email}
              editable={false}
            />
          </View>

          <Text style={styles.label}>Fecha de nacimiento</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialCommunityIcons name="calendar-outline" style={styles.inputIcon} />
            <Text style={styles.input}>{dateText}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={fechaSQL ? new Date(fechaSQL) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={onDateChange}
            />
          )}

          <TouchableOpacity
            style={[styles.mainButton, { marginTop: 25 }]}
            onPress={manejarGuardarPerfil}
          >
            <Text style={styles.mainButtonText}>Guardar Información</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Personalización</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="format-size" size={22} color="#4D6BFE" />
            <Text style={styles.sectionTitle}>Tamaño del texto</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {['Pequeño', 'Mediano', 'Grande'].map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.optionButton,
                  { flex: 1, marginHorizontal: 4 },
                  textSizeLabel === size && styles.optionButtonActive,
                ]}
                onPress={() => manejarCambioTamano(size)}
              >
                <Text
                  style={[
                    styles.optionText,
                    textSizeLabel === size && styles.optionTextActive,
                  ]}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="eye-outline"
              size={22}
              color={isDaltonic ? '#000' : '#8B5CF6'}
            />
            <Text style={styles.sectionTitle}>Modo Daltónico</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: aplicarEscala(16) }}>
              Activar filtros de color
            </Text>
            <Switch onValueChange={manejarCambioDaltonismo} value={isDaltonic} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}