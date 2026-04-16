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

const API = Platform.OS === 'web' ? 'http://localhost:5000/api' : `http://${process.env.EXPO_PUBLIC_IP}:5000/api`;

const setToken = async (key, value) => {
  if (Platform.OS === 'web') localStorage.setItem(key, value);
  else await SecureStore.setItemAsync(key, value);
};

export default function RegistroCuidador({ navigation }) {
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
    // 1. Validación local (Igual que en paciente)
    if (!nombre || !email || !password || !fechaSQL) {
      Alert.alert("Error", "Por favor, completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      // 2. Crear usuario en Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // 3. Guardar token localmente
      await setToken('userToken', idToken);

      // 4. Sincronizar con MySQL 
      await axios.post(`${API}/auth/sync`, {
        nombre: nombre,
        email: email,
        fecha_nacimiento: fechaSQL,
        tipo_usuario: 'responsable'
      }, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      setLoading(false);
      Alert.alert("¡Éxito!", "Cuenta de cuidador creada correctamente", [
        { text: "Entrar", onPress: () => navigation.replace('DashboardCuidador') }
      ]);

    } catch (err) {
      setLoading(false);
      console.log("Error completo:", err);
      const errorMsg = err.response?.data?.error || err.message || "Error al conectar con el servidor";
      Alert.alert("Error de registro", errorMsg);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateText(selectedDate.toLocaleDateString());
      const isoDate = selectedDate.toISOString().split('T')[0];
      setFechaSQL(isoDate);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.contentPadding} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 25, marginTop: 10 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#1A202C' }}>Registro Cuidador</Text>
          <Text style={{ fontSize: 15, color: '#718096', marginTop: 5 }}>Crea una cuenta para gestionar a tus pacientes</Text>
        </View>

        <Text style={styles.label}>Nombre completo</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="account-outline" style={styles.inputIcon} />
          <TextInput 
            placeholder="Ej: Juan Pérez" 
            value={nombre} 
            onChangeText={setNombre} 
            style={styles.input}
            placeholderTextColor="#A0AEC0"
          />
        </View>

        <Text style={styles.label}>Correo electrónico</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="email-outline" style={styles.inputIcon} />
          <TextInput 
            placeholder="cuidador@email.com" 
            value={email} 
            onChangeText={setEmail} 
            style={styles.input} 
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#A0AEC0"
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
            placeholderTextColor="#A0AEC0"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} style={styles.inputIcon} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Fecha de nacimiento</Text>
        <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
          <MaterialCommunityIcons name="calendar-outline" style={styles.inputIcon} />
          <Text style={[styles.dateDisplay, { color: fechaSQL ? '#2D3748' : '#A0AEC0' }]}>{dateText}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker 
            value={new Date(2000, 0, 1)} 
            mode="date" 
            display="default" 
            onChange={onDateChange} 
            maximumDate={new Date()}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.mainButton} 
          onPress={handleRegistro}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.mainButtonText}>Registrar como Cuidador</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}