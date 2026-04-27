import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Platform, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';
import { getAccesibilidadColors } from '../../services/accesibilidadColors';
import {
  getTiposRecordatorioConfig,
  formatToMySQL,
  parseMySQLDateTime,
  actualizarRecordatorio,
  eliminarRecordatorio,
} from '../../services/recordatoriosService';

const MADRID_TIMEZONE = 'Europe/Madrid';

const formatRecurrencia = (recurrencia = 'puntual') => {
  const value = recurrencia.toLowerCase();
  if (value === 'diaria') return 'Diaria';
  if (value === 'semanal') return 'Semanal';
  if (value === 'mensual') return 'Mensual';
  return 'Puntual';
};

export default function ModificarRecordatorio({ route, navigation }) {
  const { aplicarEscala, isDarkMode } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDarkMode);
  const colors = getAccesibilidadColors(isDarkMode);
  const tiposRecordatorio = getTiposRecordatorioConfig(isDarkMode);
  const insets = useSafeAreaInsets();
  const { recordatorio } = route.params;

  const [titulo, setTitulo] = useState(recordatorio.titulo || '');
  const [descripcion, setDescripcion] = useState(recordatorio.descripcion || '');
  const [tipoSeleccionado, setTipoSeleccionado] = useState(recordatorio.tipo || tiposRecordatorio[0].id);
  const [frecuencia, setFrecuencia] = useState(formatRecurrencia(recordatorio.recurrencia));
  const [alertaSonora, setAlertaSonora] = useState((recordatorio.tipo_alerta || 'sonora') === 'sonora');
  const initialDate = parseMySQLDateTime(recordatorio.fecha_hora) || new Date();
  const [date, setDate] = useState(initialDate);
  const [tempDate, setTempDate] = useState(initialDate);
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState('date');
  const [loading, setLoading] = useState(false);

  const showMode = (currentMode) => {
    setMode(currentMode);
    setTempDate(date);
    setShowPicker(true);
  };

  const fechaTexto = date.toLocaleDateString('es-ES', { timeZone: MADRID_TIMEZONE });
  const horaTexto = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: MADRID_TIMEZONE });

  const handleActualizar = async () => {
    if (!titulo.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    setLoading(true);
    try {
      await actualizarRecordatorio(recordatorio.id_recordatorio, {
        titulo,
        descripcion,
        fecha_hora: formatToMySQL(date),
        tipo: tipoSeleccionado,
        recurrencia: frecuencia.toLowerCase(),
        tipo_alerta: alertaSonora ? 'sonora' : 'visual',
      });

      navigation.goBack();
    } catch (_error) {
      Alert.alert('Error', 'No se pudo actualizar el recordatorio.');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = () => {
    Alert.alert('Eliminar', '¿Estás seguro de borrar este recordatorio?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eliminarRecordatorio(recordatorio.id_recordatorio);
            navigation.goBack();
          } catch (_error) {
            Alert.alert('Error', 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Editar recordatorio</Text>
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

        <Text style={styles.label}>Descripción</Text>
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
          {tiposRecordatorio.map((item) => {
            const esSeleccionado = tipoSeleccionado === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setTipoSeleccionado(item.id)}
                activeOpacity={0.7}
                style={[
                  styles.cardTipoRecordatorio,
                  esSeleccionado && {
                    borderColor: colors.primary,
                    borderWidth: 2,
                    backgroundColor: colors.primarySoft,
                  },
                ]}
              >
                <View style={[styles.iconoTipoCirculo, { backgroundColor: 'transparent' }]}>
                  <MaterialCommunityIcons name={item.icon} size={24} color={item.iconColor} />
                </View>
                <Text
                  style={[
                    styles.textoTipo,
                    !esSeleccionado && isDarkMode && { color: '#000000' },
                    esSeleccionado && { fontWeight: 'bold', color: colors.primary },
                    esSeleccionado && isDarkMode && { color: '#FFFFFF' },
                  ]}
                >
                  {item.id}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Frecuencia</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          {['Puntual', 'Diaria', 'Semanal', 'Mensual'].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setFrecuencia(item)}
              style={[
                styles.optionButton,
                { flex: 0.235 },
                frecuencia === item && styles.optionButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  isDarkMode && frecuencia !== item && { color: '#000000' },
                  frecuencia === item && styles.optionTextActive,
                  isDarkMode && frecuencia === item && { color: '#FFFFFF' },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Programación</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => showMode('date')} style={[styles.inputContainer, { flex: 0.52, marginRight: 10 }]}>
            <MaterialCommunityIcons name="calendar" size={20} color="#4D6BFE" style={{ marginRight: 8 }} />
            <Text style={{ color: isDarkMode ? '#FFFFFF' : '#1E293B' }}>{fechaTexto}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => showMode('time')} style={[styles.inputContainer, { flex: 0.43 }]}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#4D6BFE" style={{ marginRight: 8 }} />
            <Text style={{ color: isDarkMode ? '#FFFFFF' : '#1E293B' }}>
              {horaTexto}
            </Text>
          </TouchableOpacity>
        </View>

        {showPicker && Platform.OS === 'ios' && (
          <View style={[styles.settingsCard, { marginTop: 15 }]}>
            <DateTimePicker
              value={tempDate}
              mode={mode}
              is24Hour={true}
              timeZoneName={MADRID_TIMEZONE}
              display="spinner"
              onChange={(_event, selectedDate) => {
                if (selectedDate) {
                  setTempDate(selectedDate);
                }
              }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
              <TouchableOpacity
                onPress={() => setShowPicker(false)}
                style={[styles.optionButton, { marginRight: 10, paddingHorizontal: 18 }]}
              >
                <Text style={styles.optionText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setDate(tempDate);
                  setShowPicker(false);
                }}
                style={[styles.optionButton, styles.optionButtonActive, { paddingHorizontal: 18 }]}
              >
                <Text style={[styles.optionText, styles.optionTextActive]}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {showPicker && Platform.OS !== 'ios' && (
          <DateTimePicker
            value={date}
            mode={mode}
            is24Hour={true}
            timeZoneName={MADRID_TIMEZONE}
            display="default"
            onChange={(_event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
          />
        )}

        <Text style={[styles.label, { marginTop: 25 }]}>Aviso de notificación</Text>
        <View style={[styles.settingsCard, { paddingVertical: 15, marginBottom: 10 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{ width: 40, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <MaterialCommunityIcons
                  name={alertaSonora ? 'bell-outline' : 'bell-off-outline'}
                  size={26}
                  color={alertaSonora ? '#4D6BFE' : '#94A3B8'}
                />
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: isDarkMode ? '#FFFFFF' : '#1E293B' }}>
                  {alertaSonora ? 'Sonido Activado' : 'Modo Silencioso'}
                </Text>
                <Text style={{ fontSize: 12, color: isDarkMode ? '#FFFFFF' : '#64748B' }}>
                  {alertaSonora ? 'Recibirás un aviso con sonido' : 'Solo notificación visual'}
                </Text>
              </View>
            </View>

            <Switch
              trackColor={{ false: '#CBD5E0', true: '#4D6BFE' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#CBD5E0"
              onValueChange={() => setAlertaSonora((prev) => !prev)}
              value={alertaSonora}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.mainButton, { marginTop: 25, opacity: loading ? 0.7 : 1 }]}
          onPress={handleActualizar}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.mainButtonText}>Guardar cambios</Text>}
        </TouchableOpacity>

        {!loading && (
          <TouchableOpacity style={[styles.btnDangerOutline, { backgroundColor: '#EF4444', marginTop: 14, marginBottom: 20 }]} onPress={handleEliminar}>
            <Text style={{ color:'#FFF', fontWeight: 'bold' }}>Eliminar recordatorio</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
