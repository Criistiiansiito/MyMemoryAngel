import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import Bienvenida from './screens/auth/bienvenida';
import RegistroPaciente from './screens/auth/registroPaciente';
import RegistroCuidador from './screens/auth/registroCuidador';
import InicioSesion from './screens/auth/inicioSesion';
import DashboardPaciente from './screens/pacientes/dashBoardPaciente';
import DashboardCuidador from './screens/responsables/dashBoardCuidador';
import Recordatorios from './screens/pacientes/recordatorios';
import ModificarRecordatorio from './screens/pacientes/modificarRecordatorio';
import ChatBot from './screens/common/chatBot';
import Actividades from './screens/pacientes/actividades';
import ConfiguracionPaciente from './screens/pacientes/configuracionPaciente';
import NuevoRecordatorio from './screens/pacientes/nuevoRecordatorio';
import Calendario from './screens/pacientes/calendario';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Bienvenida" screenOptions={{ headerShown: true, headerBackTitleVisible: false, headerTintColor: '#2D3748',headerTitleStyle: { fontWeight: '700' }, animation: 'fade_from_bottom'}}>
        <Stack.Screen name="Bienvenida" component={Bienvenida} options={{ headerShown: false }} />
        <Stack.Screen name="RegistroPaciente" component={RegistroPaciente} />
        <Stack.Screen name="RegistroCuidador" component={RegistroCuidador} />
        <Stack.Screen name="InicioSesion" component={InicioSesion} />
        <Stack.Screen name="DashboardPaciente" component={DashboardPaciente} options={{ headerShown: false }} />
        <Stack.Screen name="DashboardCuidador" component={DashboardCuidador} options={{ headerShown: false }} />
        <Stack.Screen name="Configuracion" component={ConfiguracionPaciente} options={{ headerShown: false }} />
        <Stack.Screen name="NuevoRecordatorio" component={NuevoRecordatorio} options={{ headerShown: false }} />
        <Stack.Screen name="ModificarRecordatorio" component={ModificarRecordatorio} options={{ headerShown: false }} />
        <Stack.Screen name="Calendario" component={Calendario} options={{ headerShown: false }} />
        <Stack.Screen name="Recordatorios" component={Recordatorios} options={{ headerShown: false }} />
        <Stack.Screen name="ChatBot" component={ChatBot} options={{ headerShown: false }} />
        <Stack.Screen name="Actividades" component={Actividades} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
