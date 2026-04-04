import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { styles } from '../../style/styles';

const API = Platform.OS === 'web' ? 'http://localhost:5000/api' : 'http://10.0.2.2:5000/api';

export default function ModificarRecordatorio({ route, navigation }) {
  const { recordatorio } = route.params;

  const [titulo, setTitulo] = useState(recordatorio.titulo);
  const [descripcion, setDescripcion] = useState(recordatorio.descripcion || '');
  const [date, setDate] = useState(new Date(recordatorio.fecha_hora));
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState('date');
  const [loading, setLoading] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleActualizar = async () => {
    if (!titulo.trim()) return Alert.alert("Error", "El título es obligatorio");
    setLoading(true);
    
    try {
      const pad = (n) => (n < 10 ? '0' + n : n);
      const fechaMySQL = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
      
      await axios.put(`${API}/auth/recordatorios/${recordatorio.id_recordatorio}`, {
        titulo, 
        descripcion, 
        fecha_hora: fechaMySQL, 
        tipo: recordatorio.tipo
      }, { timeout: 3000 });

      setLoading(false);
      navigation.navigate('Recordatorios');
    } catch (error) {
      setLoading(false);
      navigation.navigate('Recordatorios');
    }
  };

  const handleEliminar = () => {
    Alert.alert("Eliminar", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Borrar", 
        style: "destructive", 
        onPress: async () => {
          try {
            await axios.delete(`${API}/auth/recordatorios/${recordatorio.id_recordatorio}`);
            navigation.navigate('Recordatorios');
          } catch (e) { 
            Alert.alert("Error", "No se pudo eliminar"); 
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Reutilizado */}
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={[styles.brandName]}>Editar Recordatorio</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.settingsCard}>
          
          <Text style={styles.inputLabel}>Título del recordatorio</Text>
          <TextInput 
            style={styles.textInput} 
            value={titulo} 
            onChangeText={setTitulo} 
            placeholder="Ej: Tomar medicina"
          />

          <Text style={styles.inputLabel}>Notas adicionales</Text>
          <TextInput 
            style={[styles.textInput, styles.textArea]} 
            value={descripcion} 
            onChangeText={setDescripcion} 
            multiline 
            placeholder="Añade detalles aquí..."
          />

          <Text style={styles.inputLabel}>Fecha y Hora</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity 
              onPress={() => { setMode('date'); setShowPicker(true); }} 
              style={styles.dateTimeButton}
            >
              <MaterialCommunityIcons name="calendar" size={20} color="#4D6BFE" />
              <Text style={styles.dateTimeText}>{date.toLocaleDateString()}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => { setMode('time'); setShowPicker(true); }} 
              style={styles.dateTimeButton}
            >
              <MaterialCommunityIcons name="clock-outline" size={20} color="#4D6BFE" />
              <Text style={styles.dateTimeText}>
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          {showPicker && (
            <DateTimePicker 
              value={date} 
              mode={mode} 
              is24Hour={true} 
              display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
              onChange={onChange} 
            />
          )}

          {/* Botones de Acción */}
          <TouchableOpacity 
            style={[styles.btnPrimary, loading && { backgroundColor: '#CBD5E0' }]} 
            onPress={handleActualizar} 
            disabled={loading}
          >
            <Text style={styles.btnTextPrimary}>
              {loading ? "Sincronizando..." : "Guardar Cambios"}
            </Text>
          </TouchableOpacity>

          {!loading && (
            <TouchableOpacity 
              style={styles.btnDangerOutline} 
              onPress={handleEliminar}
            >
              <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>Eliminar recordatorio</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}