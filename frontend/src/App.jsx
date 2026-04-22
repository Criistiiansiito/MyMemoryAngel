import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AccesibilidadProvider } from './services/accesibilidadContext';

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
import ModificarRecordatorio from './screens/pacientes/modificarRecordatorio';
import NuevoRecordatorio from './screens/pacientes/nuevoRecordatorio';
import Recordatorios from './screens/pacientes/recordatorios';

// Cuidador
import ConfiguracionCuidador from './screens/cuidadores/configuracionCuidador';
import DashboardCuidador from './screens/cuidadores/dashBoardCuidador';
import GestionarPacientes from './screens/cuidadores/gestionarPacientes';
import RecordatoriosCuidador from './screens/cuidadores/recordatoriosCuidador';
import InformacionPaciente from './screens/cuidadores/informacion/informacionPaciente';
import GestionarMusicaPaciente from './screens/cuidadores/informacion/gestionarMusicaPaciente';
import GestionarEscriturasPaciente from './screens/cuidadores/informacion/gestionarEscriturasPaciente';
import GestionarInformacionGeneralPaciente from './screens/cuidadores/informacion/gestionarInformacionGeneralPaciente';

// Common
import ChatBot from './screens/common/chatBot';
import ChatBotCuidador from './screens/common/chatBotCuidador';
import { inicializarNotificaciones } from './services/notificacionesService';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    inicializarNotificaciones().catch((error) => {
      console.log('No se pudieron inicializar las notificaciones:', error.message);
    });
  }, []);

  return (
    <AccesibilidadProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Bienvenida"
          screenOptions={{
            headerShown: true,
            headerBackTitleVisible: false,
            headerTintColor: '#2D3748',
            headerTitleStyle: { fontWeight: '700' },
            animation: 'fade_from_bottom',
          }}
        >
          <Stack.Screen name="Bienvenida" component={Bienvenida} options={{ headerShown: false }} />
          <Stack.Screen name="RegistroPaciente" component={RegistroPaciente} />
          <Stack.Screen name="RegistroCuidador" component={RegistroCuidador} />
          <Stack.Screen name="InicioSesion" component={InicioSesion} />

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
          <Stack.Screen name="ChatBotCuidador" component={ChatBotCuidador} options={{ headerShown: false }} />
          <Stack.Screen name="GestionarMusicaPaciente" component={GestionarMusicaPaciente} options={{ headerShown: false }} />
          <Stack.Screen name="GestionarEscriturasPaciente" component={GestionarEscriturasPaciente} options={{ headerShown: false }} />
          <Stack.Screen name="GestionarInformacionGeneralPaciente" component={GestionarInformacionGeneralPaciente} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AccesibilidadProvider>
  );
}
