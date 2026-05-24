import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { onAuthStateChanged } from 'firebase/auth';

import { AccesibilidadProvider } from './services/accesibilidadContext';
import { auth } from './services/firebase';
import { clearStoredSession, setStoredToken } from './services/session';

// Auth
import Bienvenida from './screens/auth/bienvenida';
import InicioSesion from './screens/auth/inicioSesion';
import RegistroCuidador from './screens/auth/registroCuidador';
import RegistroPaciente from './screens/auth/registroPaciente';

// Paciente
import Actividades from './screens/pacientes/actividades';
import Calendario from './screens/pacientes/calendario';
import ConfiguracionPaciente from './screens/pacientes/configuracionPaciente';
import DashboardPaciente from './screens/pacientes/dashBoardPaciente';
import GestionarRecordatorios from './screens/pacientes/gestionarRecordatorios';
import Recordatorios from './screens/pacientes/recordatorios';

// Cuidador
import ConfiguracionCuidador from './screens/cuidadores/configuracionCuidador';
import DashboardCuidador from './screens/cuidadores/dashBoardCuidador';
import GestionarPacientes from './screens/cuidadores/gestionarPacientes';
import RecordatoriosCuidador from './screens/cuidadores/recordatoriosCuidador';
import CalendarioCuidador from './screens/cuidadores/calendarioCuidador';
import InformacionPaciente from './screens/cuidadores/informacion/informacionPaciente';
import GestionarMusicaPaciente from './screens/cuidadores/informacion/gestionarMusicaPaciente';
import GestionarEscriturasPaciente from './screens/cuidadores/informacion/gestionarEscriturasPaciente';
import GestionarInformacionGeneralPaciente from './screens/cuidadores/informacion/gestionarInformacionGeneralPaciente';
import GestionarRecordatoriosPaciente from './screens/cuidadores/informacion/gestionRecordatorios/gestionarRecordatoriosPaciente';
import GestionarListaRecordatoriosPaciente from './screens/cuidadores/informacion/gestionRecordatorios/gestionarListaRecordatoriosPaciente';
import GestionarHistorialRecordatoriosPaciente from './screens/cuidadores/informacion/gestionRecordatorios/gestionarHistorialRecordatoriosPaciente';
import GestionarProgresoJuegosPaciente from './screens/cuidadores/informacion/gestionarProgresoJuegosPaciente';

// Common
import ModificarRecordatorio from './screens/common/modificarRecordatorio';
import NuevoRecordatorio from './screens/common/nuevoRecordatorio';
import ChatBot from './screens/common/chatBot';
import ChatBotCuidador from './screens/common/chatBotCuidador';
import { inicializarNotificaciones, registrarDispositivoParaNotificaciones } from './services/notificacionesService';

const Stack = createNativeStackNavigator();
const API = `${process.env.EXPO_PUBLIC_IP}`;

const getRouteForUser = (user) => (
  user?.tipo_usuario === 'paciente' ? 'DashboardPaciente' : 'DashboardCuidador'
);

export default function App() {
  const [initialRouteName, setInitialRouteName] = useState(null);

  useEffect(() => {
    inicializarNotificaciones().catch((error) => {
      console.log('No se pudieron inicializar las notificaciones:', error.message);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          await clearStoredSession();
          setInitialRouteName('Bienvenida');
          return;
        }

        const idToken = await firebaseUser.getIdToken();
        await setStoredToken(idToken);

        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          registrarDispositivoParaNotificaciones(idToken).catch((error) => {
            console.log('No se pudo registrar push token:', error.message);
          });
          setInitialRouteName(getRouteForUser(JSON.parse(storedUser)));
          return;
        }

        const res = await axios.get(`${API}/perfil/profile`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const perfil = res.data.usuario;

        await AsyncStorage.setItem('user', JSON.stringify(perfil));
        registrarDispositivoParaNotificaciones(idToken).catch((error) => {
          console.log('No se pudo registrar push token:', error.message);
        });
        setInitialRouteName(getRouteForUser(perfil));
      } catch (error) {
        console.log('No se pudo restaurar la sesion:', error.message);
        await clearStoredSession();
        setInitialRouteName('Bienvenida');
      }
    });

    return unsubscribe;
  }, []);

  if (!initialRouteName) {
    return (
      <AccesibilidadProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
          <ActivityIndicator size="large" color="#4D6BFE" />
        </View>
      </AccesibilidadProvider>
    );
  }

  return (
    <AccesibilidadProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRouteName}
          screenOptions={{
            headerShown: true,
            headerBackTitleVisible: false,
            headerTintColor: '#2D3748',
            headerTitleStyle: { fontWeight: '700' },
            animation: 'fade_from_bottom',
          }}
        >
          <Stack.Screen name="Bienvenida" component={Bienvenida} options={{ headerShown: false }} />
          <Stack.Screen name="RegistroPaciente" component={RegistroPaciente} options={{ headerTitle: "" }}/>
          <Stack.Screen name="RegistroCuidador" component={RegistroCuidador} options={{ headerTitle: "" }}/>
          <Stack.Screen name="InicioSesion" component={InicioSesion} options={{ headerTitle: "" }}/>

          <Stack.Screen name="DashboardPaciente" component={DashboardPaciente} options={{ headerShown: false }} />
          <Stack.Screen name="DashboardCuidador" component={DashboardCuidador} options={{ headerShown: false }} />
          <Stack.Screen name="ConfiguracionPaciente" component={ConfiguracionPaciente} options={{ headerShown: false }} />
          <Stack.Screen name="ConfiguracionCuidador" component={ConfiguracionCuidador} options={{ headerShown: false }} />
          <Stack.Screen name="NuevoRecordatorio" component={NuevoRecordatorio} options={{ headerShown: false }} />
          <Stack.Screen name="ModificarRecordatorio" component={ModificarRecordatorio} options={{ headerShown: false }} />
          <Stack.Screen name="GestionarRecordatorios" component={GestionarRecordatorios} options={{ headerShown: false }} />
          <Stack.Screen name="Calendario" component={Calendario} options={{ headerShown: false }} />
          <Stack.Screen name="Recordatorios" component={Recordatorios} options={{ headerShown: false }} />
          <Stack.Screen name="ChatBot" component={ChatBot} options={{ headerShown: false }} />
          <Stack.Screen name="Actividades" component={Actividades} options={{ headerShown: false }} />
          <Stack.Screen name="GestionarPacientes" component={GestionarPacientes} options={{ headerShown: false }} />
          <Stack.Screen name="InformacionPaciente" component={InformacionPaciente} options={{ headerShown: false }} />
          <Stack.Screen name="RecordatoriosCuidador" component={RecordatoriosCuidador} options={{ headerShown: false }} />
          <Stack.Screen name="CalendarioCuidador" component={CalendarioCuidador} options={{ headerShown: false }} />
          <Stack.Screen name="ChatBotCuidador" component={ChatBotCuidador} options={{ headerShown: false }} />
          <Stack.Screen name="GestionarMusicaPaciente" component={GestionarMusicaPaciente} options={{ headerShown: false }} />
          <Stack.Screen name="GestionarEscriturasPaciente" component={GestionarEscriturasPaciente} options={{ headerShown: false }} />
          <Stack.Screen name="GestionarInformacionGeneralPaciente" component={GestionarInformacionGeneralPaciente} options={{ headerShown: false }} />
          <Stack.Screen name="GestionarRecordatoriosPaciente" component={GestionarRecordatoriosPaciente} options={{ headerShown: false }} />
          <Stack.Screen name="GestionarListaRecordatoriosPaciente" component={GestionarListaRecordatoriosPaciente} options={{ headerShown: false }} />
          <Stack.Screen name="GestionarHistorialRecordatoriosPaciente" component={GestionarHistorialRecordatoriosPaciente} options={{ headerShown: false }} />
          <Stack.Screen name="GestionarProgresoJuegosPaciente" component={GestionarProgresoJuegosPaciente} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AccesibilidadProvider>
  );
}
