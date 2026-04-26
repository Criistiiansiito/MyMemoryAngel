import { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, TextInput, ScrollView, 
  KeyboardAvoidingView, Platform, StatusBar, Alert, 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';
import { escrituraService } from '../../../services/escrituraService';
import { useStoredUser } from '../../../hooks/storedUser';
import MenuCategoriaEstimulacion from '../../../components/estimulacion/MenuCardEstimulacion';

export default function Escritura({ onBack }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const [vista, setVista] = useState('menu'); 
  const [entrada, setEntrada] = useState('');
  const [completado, setCompletado] = useState(false);
  const [historial, setHistorial] = useState([]);
  const user = useStoredUser();
  const userId = user?.uid;
  const [expandedId, setExpandedId] = useState(null); // Estado para controlar el despliegue
  const [isSpeakingSummary, setIsSpeakingSummary] = useState(false);

  const refranes = [
    { id: 1, inicio: "A caballo regalado, no le mires el...", respuesta: "diente" },
    { id: 2, inicio: "Al que madruga, Dios le...", respuesta: "ayuda" },
  ];
  const [indiceRefran, setIndiceRefran] = useState(0);
  const opcionesEscritura = [
    {
      id: 1,
      titulo: 'Completar Refranes',
      descripcion: 'Entrena tu mente terminando frases clásicas.',
      icono: 'comment-quote-outline',
      color: '#6366F1',
      actionIcon: 'pencil-outline',
      actionLabel: 'Practicar',
      meta: 'Memoria verbal',
      onPress: () => {
        setVista('refranes');
        setEntrada('');
        setCompletado(false);
      },
    },
    {
      id: 2,
      titulo: 'Mi Diario',
      descripcion: 'Escribe lo que sientes.',
      icono: 'book-open-variant',
      color: '#10B981',
      actionIcon: 'pencil-outline',
      actionLabel: 'Escribir',
      meta: 'Expresión personal',
      onPress: () => {
        setVista('diario');
        setEntrada('');
      },
    },
  ];

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    if (vista !== 'menu') {
      Speech.stop();
      setIsSpeakingSummary(false);
    }
  }, [vista]);

  useEffect(() => {
    if (vista === 'menu' && userId) {
      const obtenerHistorial = async () => {
        try {
          const data = await escrituraService.obtenerEscrituras(userId);
          setHistorial(data);
        } catch (error) {
          console.error("Error al cargar historial", error);
        }
      };

      obtenerHistorial();
    }
  }, [vista, userId]);

  const leerResumen = () => {
    if (vista !== 'menu') {
      Speech.stop();
      setIsSpeakingSummary(false);
      return;
    }

    if (isSpeakingSummary) {
      Speech.stop();
      setIsSpeakingSummary(false);
      return;
    }

    const mensaje = [
      'Estas en la seccion de escritura.',
      'Completar refranes sirve para trabajar memoria verbal y terminar frases conocidas.',
      'Mi diario te permite escribir lo que sientes y guardar tus recuerdos personales.',
      'Debajo tambien puedes revisar o eliminar escritos anteriores, a modo de diario.',
      'Pulsa una opcion para empezar.',
    ].join(' ');

    setIsSpeakingSummary(true);
    Speech.speak(mensaje, {
      language: 'es-ES',
      pitch: 1,
      rate: 0.8,
      onDone: () => setIsSpeakingSummary(false),
      onStopped: () => setIsSpeakingSummary(false),
      onError: () => setIsSpeakingSummary(false),
    });
  };

  const guardarDiario = async () => {
    if (!entrada.trim()) return Alert.alert("Aviso", "El texto está vacío.");
    if (!userId) return Alert.alert("Error", "No se detectó el usuario.");
    
    try {
      const hoy = new Date().toLocaleDateString('es-ES');
      await escrituraService.insertarEscritura(userId, hoy, entrada);
      Alert.alert("¡Guardado!", "Se ha guardado en tu diario.");
      setVista('menu');
      setEntrada('');
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el servidor.");
    }
  };

  const borrarEntrada = (id) => {
    Alert.alert("Borrar", "¿Deseas eliminar este recuerdo?", [
      { text: "No" },
      { text: "Sí", style: 'destructive', onPress: async () => {
          try {
            await escrituraService.eliminarEscritura(id);
            const data = await escrituraService.obtenerEscrituras(userId);
            setHistorial(data);
          } catch (e) { Alert.alert("Error", "No se pudo borrar."); }
      }}
    ]);
  };

  const renderMenuPrincipal = () => (
    <View>
      <MenuCategoriaEstimulacion
        items={opcionesEscritura}
        onSelectItem={(item) => item.onPress()}
        containerStyle={{ padding: 0 }}
      />

      <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Mi diario</Text>
          <View style={styles.dividerLine} />
      </View>

      <View>
        {historial.length > 0 ? historial.map((item) => (
          <View key={item.id} style={[styles.escrituraItemHistorial, { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.escrituraFechaHistorial}>{item.dia}</Text>
                {/* Ocultamos el texto corto si está expandido para mostrar el largo abajo */}
                {expandedId !== item.id && (
                  <Text style={styles.escrituraTextoHistorial} numberOfLines={1}>{item.texto}</Text>
                )}
              </View>
              <View style={{ flexDirection: 'row', gap: 5 }}>
                  <TouchableOpacity 
                    onPress={() => setExpandedId(expandedId === item.id ? null : item.id)} 
                    style={styles.escrituraBotonAccionHistorial}
                  >
                      <MaterialCommunityIcons 
                        name={expandedId === item.id ? "eye-off-outline" : "eye-outline"} 
                        size={24} 
                        color={expandedId === item.id ? "#6366F1" : "#64748B"} 
                      />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => borrarEntrada(item.id)} style={styles.escrituraBotonAccionHistorial}>
                      <MaterialCommunityIcons name="delete-outline" size={24} color="#EF4444" />
                  </TouchableOpacity>
              </View>
            </View>

            {/* Texto desplegado hacia abajo */}
            {expandedId === item.id && (
              <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                <Text style={[styles.escrituraTextoHistorial, { color: '#334155', lineHeight: 22 }]}>
                  {item.texto}
                </Text>
              </View>
            )}
          </View>
        )) : (
          <Text style={{ textAlign: 'center', color: '#94A3B8', marginTop: 20 }}>Aún no hay nada escrito en el diario.</Text>
        )}
      </View>
    </View>
  );

  const renderRefranes = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.settingsCard}>
        <Text style={[styles.musicCardTitle, { fontSize: 22, marginBottom: 15, textAlign: 'center' }]}>
          &quot;{refranes[indiceRefran].inicio}&quot;
        </Text>
        <TextInput
          style={[styles.escrituraInput, completado && { borderColor: '#10B981', backgroundColor: '#F0FDF4' }]}
          placeholder="Escribe..."
          value={entrada}
          onChangeText={setEntrada}
          editable={!completado}
          autoFocus
        />
      </View>
      <TouchableOpacity 
        onPress={completado ? () => { setIndiceRefran((indiceRefran + 1) % refranes.length); setEntrada(''); setCompletado(false); } : () => {
          if (entrada.toLowerCase().trim() === refranes[indiceRefran].respuesta.toLowerCase()) setCompletado(true);
          else Alert.alert("Casi", "Inténtalo de nuevo.");
        }}
        style={[styles.escrituraBotonMain, { backgroundColor: completado ? '#10B981' : '#6366F1' }]}
      >
        <Text style={styles.escrituraTextoBotonMain}>{completado ? "¡Siguiente!" : "Comprobar"}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDiario = () => (
    <View>
      <TextInput
        style={[styles.escrituraInput, { height: 250, textAlignVertical: 'top' }]}
        multiline
        placeholder="Hoy me siento..."
        value={entrada}
        onChangeText={setEntrada}
        autoFocus
      />
      <TouchableOpacity onPress={guardarDiario} style={[styles.escrituraBotonMain, { backgroundColor: '#10B981' }]}>
        <Text style={styles.escrituraTextoBotonMain}>Guardar en mi diario</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { flex: 1 }]}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => vista === 'menu' ? onBack() : setVista('menu')}>
              <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
            </TouchableOpacity>
            <Text style={styles.brandName}>{vista === 'menu' ? 'Escritura' : (vista === 'refranes' ? 'Refranes' : 'Diario')}</Text>
          </View>
          {vista === 'menu' ? (
            <TouchableOpacity style={styles.headerIconButton} onPress={leerResumen}>
              <MaterialCommunityIcons name={isSpeakingSummary ? 'stop' : 'volume-high'} size={24} color="#334155" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {vista === 'menu' && renderMenuPrincipal()}
        {vista === 'refranes' && renderRefranes()}
        {vista === 'diario' && renderDiario()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
