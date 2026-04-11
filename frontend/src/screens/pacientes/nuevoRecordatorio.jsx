import React, { useState } from 'react'; 
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';

import { 
  TIPOS_RECORDATORIO, 
  formatToMySQL, 
  crearRecordatorio 
} from '../../services/recordatoriosService';

export default function NuevoRecordatorio({ navigation }) {

  const { aplicarEscala } = useAccesibilidad();
  const styles = getStyles(aplicarEscala);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  
  const defaultTipo = TIPOS_RECORDATORIO.find(t => t.id === 'Medicamento')?.id || TIPOS_RECORDATORIO[0].id;
  const [tipoSeleccionado, setTipoSeleccionado] = useState(defaultTipo);

  const [frecuencia, setFrecuencia] = useState('Puntual');
  const [alertaSonora, setAlertaSonora] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState('date');

  const handleGuardar = async () => {
    if (!titulo.trim()) {
      Alert.alert("Campos incompletos", "Por favor, escribe un título para el recordatorio.");
      return;
    }

    setEnviando(true);
    try {
      const tipoAlertaFinal = alertaSonora ? 'sonora' : 'visual';

      await crearRecordatorio({
        titulo,
        descripcion,
        tipo: tipoSeleccionado,
        recurrencia: frecuencia.toLowerCase(),
        fecha_hora: formatToMySQL(date),
        tipo_alerta: tipoAlertaFinal
      });

      Alert.alert("¡Éxito!", "El recordatorio se ha guardado correctamente.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  const showMode = (currentMode) => {
    setMode(currentMode);
    setShowPicker(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={[styles.brandName]}>Nuevo Recordatorio</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.label}>Título</Text>
        <View style={styles.inputContainer}>
          <TextInput 
            placeholder="Ej: Tomar paracetamol" 
            value={titulo} 
            onChangeText={setTitulo} 
            style={styles.input} 
            placeholderTextColor="#94A3B8"
          />
        </View>

        <Text style={styles.label}>Descripción (Opcional)</Text>
        <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
          <TextInput 
            placeholder="Detalles adicionales..." 
            value={descripcion} 
            onChangeText={setDescripcion} 
            style={styles.input} 
            multiline 
            placeholderTextColor="#94A3B8"
          />
        </View>

        <Text style={styles.label}>Categoría</Text>
        <View style={styles.gridRecordatorios}>
          {TIPOS_RECORDATORIO.map((item) => {
            const esSeleccionado = tipoSeleccionado === item.id;
            return (
              <TouchableOpacity 
                key={item.id}
                onPress={() => setTipoSeleccionado(item.id)}
                activeOpacity={0.7}
                style={[
                  styles.cardTipoRecordatorio, 
                  esSeleccionado && { 
                    borderColor: '#4D6BFE', // Color azul del recuadro
                    borderWidth: 2,         // Grosor para que se note
                    backgroundColor: '#F0F4FF' // Opcional: un fondo muy clarito para resaltar
                  }
                ]}
              >
                <View style={[styles.iconoTipoCirculo, { backgroundColor: item.color }]}>
                  <MaterialCommunityIcons name={item.icon} size={24} color={item.iconColor} />
                </View>
                <Text style={[
                  styles.textoTipo, 
                  esSeleccionado && { fontWeight: 'bold', color: '#4D6BFE' }
                ]}>
                  {item.id}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Frecuencia</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          {['Puntual', 'Semanal', 'Mensual'].map((f) => (
            <TouchableOpacity 
              key={f} 
              onPress={() => setFrecuencia(f)} 
              style={[
                styles.optionButton, 
                { flex: 0.32 }, 
                frecuencia === f && styles.optionButtonActive
              ]}
            >
              <Text style={[styles.optionText, frecuencia === f && styles.optionTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Programación</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => showMode('date')} style={[styles.inputContainer, { flex: 0.52, marginRight: 10 }]}>
            <MaterialCommunityIcons name="calendar" size={20} color="#4D6BFE" style={{ marginRight: 8 }} />
            <Text style={{ color: '#1E293B' }}>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => showMode('time')} style={[styles.inputContainer, { flex: 0.43 }]}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#4D6BFE" style={{ marginRight: 8 }} />
            <Text style={{ color: '#1E293B' }}>
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker 
            value={date} mode={mode} is24Hour={true} 
            display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
            onChange={(e, d) => { setShowPicker(Platform.OS === 'ios'); if(d) setDate(d); }} 
          />
        )}

        <Text style={[styles.label, { marginTop: 25 }]}>Aviso de notificación</Text>
        <View style={[styles.settingsCard, { paddingVertical: 15, marginBottom: 10 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{ width: 40, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <MaterialCommunityIcons 
                  name={alertaSonora ? "bell-outline" : "bell-off-outline"} 
                  size={26} 
                  color={alertaSonora ? "#4D6BFE" : "#94A3B8"} 
                />
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>
                  {alertaSonora ? "Sonido Activado" : "Modo Silencioso"}
                </Text>
                <Text style={{ fontSize: 12, color: '#64748B' }}>
                  {alertaSonora ? "Recibirás un aviso con sonido" : "Solo notificación visual"}
                </Text>
              </View>
            </View>

            <Switch
              trackColor={{ false: "#CBD5E0", true: "#4D6BFE" }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#CBD5E0"
              onValueChange={() => setAlertaSonora(prev => !prev)}
              value={alertaSonora}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.mainButton, { marginTop: 25, marginBottom: 20, opacity: enviando ? 0.7 : 1 }]} 
          onPress={handleGuardar} 
          disabled={enviando}
        >
          {enviando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.mainButtonText}>Guardar Recordatorio</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}