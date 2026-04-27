import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { auth } from '../../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';
import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync, enviarPushTokenAlBackend } from '../../services/notificacionesService';

const API = `${process.env.EXPO_PUBLIC_IP}`;

const setToken = async (key, value) => {
  if (Platform.OS === 'web') localStorage.setItem(key, value);
  else await SecureStore.setItemAsync(key, value);
};

export default function RegistroPaciente({ navigation }) {
  const { aplicarEscala } = useAccesibilidad();
  const styles = getStyles(aplicarEscala);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fechaSQL, setFechaSQL] = useState(''); 
  const [dateText, setDateText] = useState('dd/mm/aaaa');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegistro = async () => {
    if (!nombre || !email || !password || !fechaSQL) {
      Alert.alert("Error", "Rellena todos los campos");
      return;
    }

    setLoading(true);
    try {
      // 1. Crear usuario en Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // Registrar push token del dispositivo
        try {
          const expoPushToken = await registerForPushNotificationsAsync();
          await enviarPushTokenAlBackend({
            token: expoPushToken,
            firebaseToken: idToken,
            platform: Platform.OS,
          });
        } catch (pushError) {
          console.log('No se pudo registrar push token:', pushError.message);
        }      

      // 2. Guardar token localmente
      await setToken('userToken', idToken);

      // 3. Sincronizar con MySQL
      const res = await axios.post(`${API}/auth/sync`, {
        nombre: nombre,
        email: email,
        fecha_nacimiento: fechaSQL,
        tipo_usuario: 'paciente'
      }, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      // --- CAMBIO AQUÍ: GUARDAR PERFIL PARA PERSISTENCIA ---
      const perfilUsuario = {
        uid: user.uid,
        nombre: nombre,
        correo: email,
        tipo_usuario: 'paciente'
      };

      await AsyncStorage.setItem('user', JSON.stringify(perfilUsuario));
      // -----------------------------------------------------

      setLoading(false);
      Alert.alert("Éxito", "Cuenta creada correctamente", [
        { text: "Continuar", onPress: () => navigation.replace('DashboardPaciente') }
      ]);

    } catch (err) {
      setLoading(false);
      const errorMsg = err.response?.data?.error || err.message || "Error al registrar";
      Alert.alert("Error de registro", errorMsg);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Formato visual para el usuario
      setDateText(selectedDate.toLocaleDateString());
      // Formato ISO para MySQL (YYYY-MM-DD)
      const isoDate = selectedDate.toISOString().split('T')[0];
      setFechaSQL(isoDate);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.contentPadding} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#1A202C' }}>Crear cuenta</Text>
          <Text style={{ fontSize: 14, color: '#718096' }}>Regístrate como paciente</Text>
        </View>

        <Text style={styles.label}>Nombre completo</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="account-outline" style={styles.inputIcon} />
          <TextInput placeholder="Tu nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
        </View>

        <Text style={styles.label}>Correo electrónico</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="email-outline" style={styles.inputIcon} />
          <TextInput 
            placeholder="ejemplo@gmail.com" 
            value={email} 
            onChangeText={setEmail} 
            style={styles.input} 
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock-outline" style={styles.inputIcon} />
          <TextInput 
            placeholder="Mínimo 6 caracteres" 
            secureTextEntry={!showPassword} 
            value={password} 
            onChangeText={setPassword} 
            style={styles.input} 
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons name={showPassword ? "eye-off" : "eye"} style={styles.inputIcon} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Fecha de nacimiento</Text>
        <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
          <MaterialCommunityIcons name="calendar-outline" style={styles.inputIcon} />
          <Text style={[styles.dateDisplay, { color: fechaSQL ? '#2D3748' : '#A0AEC0' }]}>{dateText}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker 
            value={new Date()} 
            mode="date" 
            display="default" 
            onChange={onDateChange} 
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.mainButton} onPress={handleRegistro} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.mainButtonText}>Crear Cuenta</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}