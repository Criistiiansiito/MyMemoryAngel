import { View, Text, TouchableOpacity, Image, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Bienvenida({ navigation }) {
  const { aplicarEscala } = useAccesibilidad();
  const styles = getStyles(aplicarEscala);
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.contentCenter}>
        <View style={{ alignItems: 'center', marginBottom: 120, marginTop: -180 }}>
      
            <View style={styles.cuadradoLogoHeader}>
              <Image 
                source={require('../../../assets/icons/logo.png')} 
                style={styles.logoHeader}
                resizeMode="contain" 
              />
            </View>

            <Text style={styles.brandName}>MyMemoryAngel</Text>
            <Text style={styles.subtitle}>Tu compañero de cuidado y memoria</Text>
        </View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity 
            style={styles.cardButton} 
            onPress={() => navigation.navigate('RegistroPaciente')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E8F0FE' }]}>
              <MaterialCommunityIcons name="account-outline" size={30} color="#4285F4" />
            </View>
            <Text style={styles.cardButtonText}>Soy Paciente</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cardButton} 
            onPress={() => navigation.navigate('RegistroCuidador')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E7F7EF' }]}>
              <MaterialCommunityIcons name="heart-outline" size={30} color="#34A853" />
            </View>
            <Text style={styles.cardButtonText}>Soy Cuidador</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.loginLink} 
          onPress={() => navigation.navigate('InicioSesion')}
        >
          <Text style={styles.loginText}>¿Tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}