import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

// Importar componentes/pantallas
import Bienvenida from '../components/bienvenida/Bienvenida';
import InicioSesion from '../components/inicioSesion/InicioSesion';
import Home from '../components/home/Home';
import Recordatorios from '../components/recordatorios/Recordatorios';
import Actividades from '../components/juegos/actividades';
import DashboardPaciente from './components/pacientes/DashboardPaciente';
import DashboardCuidador from './components/cuidadores/DashboardCuidador';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Barra inferior (footer)
function AppTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Recordatorios" component={Recordatorios} />
      <Tab.Screen name="Actividades" component={Actividades} />
    </Tab.Navigator>
  );
}

// Stack principal
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Bienvenida" component={Bienvenida} />
        <Stack.Screen name="InicioSesion" component={InicioSesion} />
        <Stack.Screen name="AppTabs" component={AppTabs} />
        <Stack.Screen name="DashboardPaciente" component={DashboardPaciente} />
        <Stack.Screen name="DashboardCuidador" component={DashboardCuidador} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}