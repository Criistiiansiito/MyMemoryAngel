import React, { useState, useEffect, useCallback } from 'react';
import {View,Text,TouchableOpacity,ScrollView,ActivityIndicator,Alert,Platform,StatusBar,} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';
import { escrituraService } from '../../../services/escrituraService';

export default function GestionarEscriturasPaciente({ route, navigation }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const { paciente } = route.params;
  const pacienteId = paciente?.uid || paciente?.id;

  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const cargarEscrituras = useCallback(async () => {
    if (!pacienteId) return;

    setCargando(true);
    try {
      const data = await escrituraService.obtenerEscrituras(pacienteId);
      setHistorial(data || []);
    } catch (error) {
      console.error('Error cargando escrituras:', error);
      Alert.alert('Error', 'No se pudo conectar con el diario del paciente.');
    } finally {
      setCargando(false);
    }
  }, [pacienteId]);

  useEffect(() => {
    cargarEscrituras();
  }, [cargarEscrituras]);

  const borrarEntrada = (id) => {
    Alert.alert('Borrar', '¿Deseas eliminar este recuerdo?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí',
        style: 'destructive',
        onPress: async () => {
          try {
            await escrituraService.eliminarEscritura(id);
            if (expandedId === id) setExpandedId(null);
            cargarEscrituras();
          } catch (error) {
            Alert.alert('Error', 'No se pudo borrar.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Escrituras</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 30, paddingTop: 10 }}>
        <Text
          style={{
            color: '#64748B',
            fontSize: 14,
            lineHeight: 22,
            textAlign: 'center',
          }}
        >
          Aquí puedes revisar y eliminar entradas personales de {paciente?.nombre}.
        </Text>
      </View>

      {cargando ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Diario del paciente</Text>
            <View style={styles.dividerLine} />
          </View>

          {historial.length > 0 ? (
            historial.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.escrituraItemHistorial,
                  { flexDirection: 'column', alignItems: 'stretch' },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.escrituraFechaHistorial}>{item.dia}</Text>

                    {expandedId !== item.id && (
                      <Text style={styles.escrituraTextoHistorial} numberOfLines={1}>
                        {item.texto}
                      </Text>
                    )}
                  </View>

                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      onPress={() =>
                        setExpandedId(expandedId === item.id ? null : item.id)
                      }
                      style={styles.escrituraBotonAccionHistorial}
                    >
                      <MaterialCommunityIcons
                        name={expandedId === item.id ? 'eye-off-outline' : 'eye-outline'}
                        size={24}
                        color={expandedId === item.id ? '#10B981' : '#64748B'}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => borrarEntrada(item.id)}
                      style={styles.escrituraBotonAccionHistorial}
                    >
                      <MaterialCommunityIcons
                        name="delete-outline"
                        size={24}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {expandedId === item.id && (
                  <View
                    style={{
                      marginTop: 10,
                      paddingTop: 10,
                      borderTopWidth: 1,
                      borderTopColor: '#F1F5F9',
                    }}
                  >
                    <Text
                      style={[
                        styles.escrituraTextoHistorial,
                        { color: '#334155', lineHeight: 22 },
                      ]}
                    >
                      {item.texto}
                    </Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <MaterialCommunityIcons
                name="notebook-outline"
                size={70}
                color="#CBD5E1"
              />
              <Text
                style={{
                  color: '#94A3B8',
                  marginTop: 15,
                  textAlign: 'center',
                }}
              >
                No hay entradas guardadas para este paciente.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}