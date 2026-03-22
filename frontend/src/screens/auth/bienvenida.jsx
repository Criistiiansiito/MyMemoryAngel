import { View, Text, TouchableOpacity, Image, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../style/styles';
export default function Bienvenida({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <Image source={require('../../../assets/icons/logo.png')} style={styles.logoHeader} resizeMode="contain" />
          <View style={styles.textContainer}>
            <Text style={styles.brandName}>MyMemoryAngel</Text>
            <Text style={styles.subtitle}>Tu compañero de cuidado y memoria</Text>
          </View>
        </View>
      </View>

      <View style={styles.contentCenter}>
        <View style={styles.buttonWrapper}>
          <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('RegistroPaciente')}>
            <View style={[styles.iconCircle, { backgroundColor: '#E8F0FE' }]}>
              <MaterialCommunityIcons name="account-outline" size={30} color="#4285F4" />
            </View>
            <Text style={styles.cardButtonText}>Soy Paciente</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('RegistroCuidador')}>
            <View style={[styles.iconCircle, { backgroundColor: '#E7F7EF' }]}>
              <MaterialCommunityIcons name="heart-outline" size={30} color="#34A853" />
            </View>
            <Text style={styles.cardButtonText}>Soy Cuidador</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('InicioSesion')}>
          <Text style={styles.loginText}>¿Tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.botPosition}>
        <View style={styles.botCircle}>
           <Image source={require('../../../assets/icons/bot-icon.png')} style={styles.botImage} resizeMode="contain" />
        </View>
      </View>
    </View>
  );
}