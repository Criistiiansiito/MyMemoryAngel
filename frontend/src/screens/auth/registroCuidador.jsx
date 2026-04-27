import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { auth } from '../../services/firebase'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';
import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';
import { registerForPushNotificationsAsync, enviarPushTokenAlBackend } from '../../services/notificacionesService';

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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  const [date, setDate] = useState(new Date(2000, 0, 1));
  const [tempDate, setTempDate] = useState(new Date(2000, 0, 1));
  const [showPicker, setShowPicker] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(false);

  const [errores, setErrores] = useState({});

  const handleNombreChange = (text) => {
    const soloLetras = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    setNombre(soloLetras);
    setErrores({ ...errores, nombre: null });
  };

  const validarFormulario = () => {
    let nuevosErrores = {};
    if (!nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio";
    if (!email.trim()) nuevosErrores.email = "El correo es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(email)) nuevosErrores.email = "Email no válido";
    if (!password) nuevosErrores.password = "La contraseña es obligatoria";
    else if (password.length < 6) nuevosErrores.password = "Mínimo 6 caracteres";
    if (!fechaSeleccionada) nuevosErrores.fecha = "Selecciona tu fecha de nacimiento";

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Solo se pone verde si el registro ya fue exitoso
  const getInputBorderStyle = (campo) => {
    if (errores[campo]) {
      return { borderColor: '#FEB2B2', backgroundColor: '#FFF5F5', borderWidth: 2 };
    }
    if (registroExitoso) {
      return { borderColor: '#C6F6D5', backgroundColor: '#F0FFF4', borderWidth: 2 };
    }
    return { borderColor: '#E2E8F0', borderWidth: 1.5 };
  };

  const getIconColor = (campo) => {
    if (errores[campo]) return '#E53E3E';
    if (registroExitoso) return '#38A169';
    return '#A0AEC0';
  };

  const handleRegistro = async () => {
    setErrores({});
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      try {
        const expoPushToken = await registerForPushNotificationsAsync();
        await enviarPushTokenAlBackend({
          token: expoPushToken,
          firebaseToken: idToken,
          platform: Platform.OS,
        });
      } catch (pushError) {
        console.log('Push error ignored');
      }      

      await setToken('userToken', idToken);

      await axios.post(`${API}/auth/sync`, {
        nombre: nombre,
        email: email,
        fecha_nacimiento: date.toISOString().split('T')[0],
        tipo_usuario: 'cuidador'
      }, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      setLoading(false);
      setRegistroExitoso(true); // Aquí es cuando todo se ilumina en verde

      setTimeout(() => {
        navigation.replace('DashboardCuidador');
      }, 2000);

    } catch (err) {
      setLoading(false);
      if (err.code === 'auth/email-already-in-use') {
        setErrores({ email: "Este correo ya está registrado" });
      } else {
        Alert.alert("Error", "No se pudo completar el registro.");
      }
    }
  };

  const ErrorText = ({ campo }) => (
    errores[campo] ? (
      <Text style={{ color: '#E53E3E', fontSize: 12, marginTop: 6, marginBottom: 12, marginLeft: 5, fontWeight: '600' }}>
        {errores[campo]}
      </Text>
    ) : null
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.contentPadding} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 25, marginTop: 10 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#1A202C' }}>Registro Cuidador</Text>
          {registroExitoso ? (
            <Text style={{ fontSize: 18, color: '#38A169', fontWeight: 'bold', marginTop: 5 }}>
              ¡Bienvenido/a, {nombre}!
            </Text>
          ) : (
            <Text style={{ fontSize: 15, color: '#718096', marginTop: 5 }}>Crea una cuenta para gestionar a tus pacientes</Text>
          )}
        </View>

        <Text style={styles.label}>Nombre completo</Text>
        <View style={[styles.inputContainer, getInputBorderStyle('nombre'), { borderRadius: 12 }]}>
          <MaterialCommunityIcons name="account-outline" size={20} color={getIconColor('nombre')} style={styles.inputIcon} />
          <TextInput 
            placeholder="Tu nombre" 
            value={nombre} 
            onChangeText={handleNombreChange} 
            style={[styles.input, { backgroundColor: 'transparent' }]}
            placeholderTextColor="#A0AEC0"
          />
        </View>
        <ErrorText campo="nombre" />

        <Text style={styles.label}>Correo electrónico</Text>
        <View style={[styles.inputContainer, getInputBorderStyle('email'), { borderRadius: 12 }]}>
          <MaterialCommunityIcons name="email-outline" size={20} color={getIconColor('email')} style={styles.inputIcon} />
          <TextInput 
            placeholder="ejemplo@gmail.com" 
            value={email} 
            onChangeText={(val) => { setEmail(val); setErrores({...errores, email: null}); }} 
            style={[styles.input, { backgroundColor: 'transparent' }]} 
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#A0AEC0"
          />
        </View>
        <ErrorText campo="email" />

        <Text style={styles.label}>Contraseña</Text>
        <View style={[styles.inputContainer, getInputBorderStyle('password'), { borderRadius: 12 }]}>
          <MaterialCommunityIcons name="lock-outline" size={20} color={getIconColor('password')} style={styles.inputIcon} />
          <TextInput 
            placeholder="Mínimo 6 caracteres" 
            secureTextEntry={!showPassword} 
            value={password} 
            onChangeText={(val) => { setPassword(val); setErrores({...errores, password: null}); }} 
            style={[styles.input, { backgroundColor: 'transparent' }]}
            placeholderTextColor="#A0AEC0"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#A0AEC0" />
          </TouchableOpacity>
        </View>
        <ErrorText campo="password" />

        <Text style={styles.label}>Fecha de nacimiento</Text>
        <TouchableOpacity 
          style={[styles.inputContainer, getInputBorderStyle('fecha'), { borderRadius: 12 }]} 
          onPress={() => {
            setTempDate(date);
            setShowPicker(true);
          }}
        >
          <MaterialCommunityIcons name="calendar-outline" size={20} color={getIconColor('fecha')} style={styles.inputIcon} />
          <Text style={{ color: fechaSeleccionada ? '#2D3748' : '#A0AEC0' }}>
            {fechaSeleccionada ? date.toLocaleDateString() : 'Seleccionar fecha'}
          </Text>
        </TouchableOpacity>
        <ErrorText campo="fecha" />

        {showPicker && Platform.OS === 'ios' && (
          <View style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: 20, 
            padding: 15, 
            marginTop: 5, 
            borderWidth: 1, 
            borderColor: '#E2E8F0',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5
          }}>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                if (selectedDate) setTempDate(selectedDate);
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingHorizontal: 10 }}>
              <TouchableOpacity 
                onPress={() => setShowPicker(false)} 
                style={{ backgroundColor: '#EDF2F7', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 12 }}
              >
                <Text style={{ color: '#4A5568', fontWeight: 'bold', fontSize: 16 }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  setDate(tempDate);
                  setFechaSeleccionada(true);
                  setShowPicker(false);
                  setErrores({...errores, fecha: null});
                }} 
                style={{ backgroundColor: '#4D6BFE', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 12 }}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {showPicker && Platform.OS !== 'ios' && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) {
                setDate(selectedDate);
                setFechaSeleccionada(true);
                setErrores({...errores, fecha: null});
              }
            }}
          />
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.mainButton, 
            { height: 60, justifyContent: 'center' },
            registroExitoso && { backgroundColor: '#38A169' }
          ]} 
          onPress={handleRegistro}
          disabled={loading || registroExitoso}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.mainButtonText}>
              {registroExitoso ? "¡Cuenta Creada!" : "Registrar"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}