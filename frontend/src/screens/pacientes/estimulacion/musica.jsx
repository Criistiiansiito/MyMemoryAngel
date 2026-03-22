import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Musica({ onBack }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={onBack}>
        <MaterialCommunityIcons name="close" size={30} color="#334155" />
      </TouchableOpacity>

      <View style={styles.card}>
        <MaterialCommunityIcons name="music-circle" size={100} color="#6366F1" />
        <Text style={styles.title}>Música para Relajar</Text>
        <Text style={styles.subtitle}>Presiona para escuchar sonidos de la naturaleza</Text>
        
        <View style={styles.controls}>
          <TouchableOpacity style={styles.playBtn}>
            <MaterialCommunityIcons name="play" size={50} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0E7FF', justifyContent: 'center', padding: 20 },
  closeBtn: { position: 'absolute', top: 50, right: 20 },
  card: { backgroundColor: 'white', borderRadius: 30, padding: 40, alignItems: 'center', elevation: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 20, color: '#1E1B4B' },
  subtitle: { textAlign: 'center', color: '#4338CA', marginTop: 10, fontSize: 16 },
  controls: { marginTop: 30 },
  playBtn: { backgroundColor: '#6366F1', width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' }
});