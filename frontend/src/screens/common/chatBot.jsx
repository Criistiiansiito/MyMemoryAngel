import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform, Animated, StatusBar } from 'react-native';
// Importamos useSafeAreaInsets y eliminamos el uso del componente SafeAreaView
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';
import BottomTabBar from '../../components/BottomTabBar';

const API = Platform.OS === 'web' ? 'http://localhost:5000/api' : `http://${process.env.EXPO_PUBLIC_IP}:5000/api`;

const CATEGORIAS_COMPLETA = [
  { id: 1, titulo: 'Cuidados', pregunta: 'Cuidados Diarios', subtemas: ['Vestimenta', 'Dentadura', 'Piel y Escaras', 'Incontinencia', 'Corte de Uñas'] },
  { id: 2, titulo: 'Memoria', pregunta: 'Memoria y Mente', subtemas: ['Ejercicios Mentales', 'Musicoterapia', 'Uso de Fotos', 'Orientación', 'Manualidades'] },
  { id: 3, titulo: 'Conducta', pregunta: 'Comportamiento', subtemas: ['Agresividad', 'Deambulación', 'Repeticiones', 'Síndrome Ocaso'] },
  { id: 4, titulo: 'Seguridad', pregunta: 'Seguridad', subtemas: ['Evitar Caídas', 'Prevención de Fugas'] },
  { id: 5, titulo: 'Comida', pregunta: 'Comida', subtemas: ['Agua', 'Nutrición'] },
  { id: 6, titulo: 'Medicina', pregunta: 'Medicina', subtemas: ['Citas', 'Síntomas'] },
];

export default function ChatbotScreen({ navigation }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  
  // Hook para el espacio seguro del Notch e inicio inferior
  const insets = useSafeAreaInsets();

  const [mensaje, setMensaje] = useState('');
  const [chatLog, setChatLog] = useState([
    { id: 1, texto: '¡Hola! Selecciona un tema para empezar.', sender: 'bot' },
  ]);
  const [escribiendo, setEscribiendo] = useState(false);
  const scrollViewRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (escribiendo) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [escribiendo]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [chatLog, escribiendo]);

  const enviarMensaje = async (texto) => {
    const textoFinal = texto || mensaje;
    if (textoFinal.trim() === '' || escribiendo) return;

    setChatLog(prev => [...prev, { id: Date.now(), texto: textoFinal, sender: 'user' }]);
    setMensaje('');
    setEscribiendo(true);

    try {
      const response = await fetch(`${API}/chatbot/preguntar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensajeUsuario: textoFinal })
      });
      const data = await response.json();

      setTimeout(() => {
        const categoriaEncontrada = CATEGORIAS_COMPLETA.find(cat => cat.pregunta === textoFinal);
        
        setChatLog(prev => {
          const nuevoLog = [...prev, { id: Date.now() + 1, texto: data.respuesta, sender: 'bot' }];
          if (categoriaEncontrada) {
            nuevoLog.push({
              id: Date.now() + 2,
              texto: `¿Sobre qué parte de "${categoriaEncontrada.titulo}" quieres preguntar?`,
              sender: 'bot',
              opciones: categoriaEncontrada.subtemas
            });
          }
          return nuevoLog;
        });
        setEscribiendo(false);
      }, 1000);

    } catch (error) {
      setChatLog(prev => [...prev, { id: Date.now() + 1, texto: "Error de conexión.", sender: 'bot' }]);
      setEscribiendo(false);
    }
  };

  return (
    <View style={styles.chatContainer}>
      <StatusBar barStyle="dark-content" />

      {/* CABECERA CON PADDING DINÁMICO */}
      <View style={[
        styles.topBar, 
        { paddingTop: insets.top }
      ]}>
        <View style={styles.headerInfo}>
          <View style={styles.avatarContainer}>
            <Image source={require('../../../assets/icons/bot-icon.png')} style={styles.botIcon} />
            <View style={styles.statusDot} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Asistente</Text>
            <Text style={styles.headerStatus}>● Disponible</Text>
          </View>
        </View>
      </View>

      {/* PANEL SUPERIOR 3x3 */}
      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          {CATEGORIAS_COMPLETA.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.chipTema} 
              onPress={() => enviarMensaje(item.pregunta)}
            >
              <Text style={styles.chipTemaText}>{item.titulo}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* CUERPO DEL CHAT */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          ref={scrollViewRef} 
          contentContainerStyle={styles.scrollContent}
        >
          {chatLog.map((item) => (
            <View key={item.id} style={styles.messageWrapper}>
              <View style={[
                item.sender === 'bot' ? styles.bubbleBot : styles.bubbleUser
              ]}>
                <Text style={item.sender === 'bot' ? styles.textBot : styles.textUser}>
                  {item.texto}
                </Text>
              </View>

              {item.opciones && (
                <View style={styles.subtemasContainer}>
                  {item.opciones.map((opt, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={styles.btnSubtema}
                      onPress={() => enviarMensaje(opt)}
                    >
                      <Text style={styles.btnSubtemaText}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}

          {escribiendo && (
            <Animated.View style={[styles.writingIndicator, { opacity: fadeAnim }]}>
              <MaterialCommunityIcons name="dots-horizontal" size={24} color="#64748B" />
              <Text style={styles.writingText}>Pensando...</Text>
            </Animated.View>
          )}
        </ScrollView>

        {/* INPUT INFERIOR */}
        <View style={styles.chatInputContainer}>
          <TextInput 
            value={mensaje} 
            onChangeText={setMensaje} 
            style={styles.inputChatWrapper} 
            placeholder="Haz una pregunta..." 
          />
          <TouchableOpacity onPress={() => enviarMensaje()} style={styles.sendButton}>
            <MaterialCommunityIcons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <View>
        <BottomTabBar />
      </View>
    </View>
  );
}