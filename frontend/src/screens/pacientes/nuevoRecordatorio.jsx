import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker'; // Importante
import { styles } from '../../style/styles'; 

export default function NuevoRecordatorio({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('Tarea');
  const [frecuencia, setFrecuencia] = useState('Puntual');
  const [alertaSonora, setAlertaSonora] = useState(true);
  const [soloMensaje, setSoloMensaje] = useState(false);

  // Estados para Fecha y Hora
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState('date');

  const tipos = [
    { id: 'Medicación', icon: 'pill', color: '#E8F0FE', iconColor: '#3B82F6' },
    { id: 'Cita médica', icon: 'calendar-check', color: '#E7F9ED', iconColor: '#22C55E' },
    { id: 'Tarea', icon: 'checkbox-marked-outline', color: '#F3E8FF', iconColor: '#A855F7' },
    { id: 'Evento personal', icon: 'account-outline', color: '#FFF7E6', iconColor: '#F59E0B' },
    { id: 'Otro', icon: 'plus', color: '#F7FAFC', iconColor: '#718096' },
  ];

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios'); // En iOS queda abierto, en Android se cierra
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    setShowPicker(true);
    setMode(currentMode);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#334155" />
          </TouchableOpacity>
          <Text style={[styles.brandName, { marginLeft: 15 }]}>Nuevo Recordatorio</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 50 }]} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.label}>Título</Text>
        <View style={styles.inputContainer}>
          <TextInput placeholder="Ej: Tomar medicamento" value={titulo} onChangeText={setTitulo} style={styles.input} />
        </View>

        <Text style={styles.label}>Descripción</Text>
        <View style={[styles.inputContainer, { height: 80, alignItems: 'flex-start', paddingTop: 10 }]}>
          <TextInput placeholder="Detalles..." value={descripcion} onChangeText={setDescripcion} style={styles.input} multiline />
        </View>

        {/* TIPO DE RECORDATORIO */}
        <Text style={styles.label}>Tipo de recordatorio</Text>
        <View style={styles.gridRecordatorios}>
          {tipos.map((item) => {
            const isSelected = tipoSeleccionado === item.id;
            return (
              <TouchableOpacity 
                key={item.id}
                onPress={() => setTipoSeleccionado(item.id)}
                activeOpacity={0.7}
                style={[
                  styles.cardTipoRecordatorio, 
                  isSelected && styles.cardTipoActive // Se aplica si coincide el ID
                ]}
              >
                <View style={[styles.iconoTipoCirculo, { backgroundColor: item.color }]}>
                  <MaterialCommunityIcons name={item.icon} size={24} color={item.iconColor} />
                </View>
                <Text style={[styles.textoTipo, isSelected && styles.textoTipoActive]}>
                  {item.id}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* FRECUENCIA */}
        <Text style={styles.label}>Repetición</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          {['Puntual', 'Semanal', 'Mensual'].map((f) => (
            <TouchableOpacity 
              key={f} 
              onPress={() => setFrecuencia(f)}
              style={[styles.optionButton, { flex: 0.32, marginBottom: 0 }, frecuencia === f && styles.optionButtonActive]}
            >
              <Text style={[styles.optionText, frecuencia === f && styles.optionTextActive, { fontSize: 13 }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DÍA Y HORA REAL */}
        <Text style={styles.label}>Fecha y Hora</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => showMode('date')} style={[styles.inputContainer, { flex: 0.55, marginRight: 10 }]}>
              <MaterialCommunityIcons name="calendar" size={20} color="#4D6BFE" style={{ marginRight: 10 }} />
              <Text style={{ color: '#2D3748' }}>{date.toLocaleDateString()}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => showMode('time')} style={[styles.inputContainer, { flex: 0.4 }]}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#4D6BFE" style={{ marginRight: 10 }} />
              <Text style={{ color: '#2D3748' }}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode={mode}
            is24Hour={true}
            display="default"
            onChange={onChangeDate}
          />
        )}

        {/* ALERTAS */}
        <View style={[styles.settingsCard, { marginTop: 25 }]}>
          <View style={[styles.rowSpace, { marginBottom: 15 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name={alertaSonora ? "volume-high" : "volume-off"} size={22} color={alertaSonora ? "#4D6BFE" : "#4A5568"} />
              <Text style={{ marginLeft: 10, fontWeight: '600' }}>Alerta Sonora</Text>
            </View>
            <Switch value={alertaSonora} onValueChange={setAlertaSonora} trackColor={{ true: '#4D6BFE' }} />
          </View>

          <View style={styles.rowSpace}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="message-text-outline" size={22} color={soloMensaje ? "#4D6BFE" : "#4A5568"} />
              <Text style={{ marginLeft: 10, fontWeight: '600' }}>Solo Mensaje (Push)</Text>
            </View>
            <Switch value={soloMensaje} onValueChange={setSoloMensaje} trackColor={{ true: '#4D6BFE' }} />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.mainButton, { marginTop: 30 }]} 
          onPress={() => {
            console.log("Datos:", { titulo, tipoSeleccionado, date, alertaSonora });
            navigation.goBack();
          }}
        >
          <Text style={styles.mainButtonText}>Guardar Recordatorio</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}