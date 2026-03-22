import  { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../style/styles';
import BottomTabBar from '../../components/BottomTabBar';

export default function ChatbotScreen({ navigation }) {
  const [mensaje, setMensaje] = useState('');
  const [chatLog, setChatLog] = useState([
    { id: 1, texto: '¡Hola! Soy tu asistente. ¿En qué puedo ayudarte hoy?', sender: 'bot' },
  ]);

  const enviarMensaje = () => {
    if (mensaje.trim() === '') return;
    
    const nuevoMensaje = { id: Date.now(), texto: mensaje, sender: 'user' };
    setChatLog([...chatLog, nuevoMensaje]);
    setMensaje('');

    // Simulación de respuesta automática
    setTimeout(() => {
      setChatLog(prev => [...prev, {
        id: Date.now() + 1,
        texto: 'Entiendo tu pregunta. Estoy aquí para ayudarte. ¿Necesitas información sobre tus medicamentos o recordatorios?',
        sender: 'bot'
      }]);
    }, 1000);
  };

  return (
<SafeAreaView style={styles.chatContainer}> 
  <View style={styles.topBar}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={styles.avatarContainer}>
        <Image source={require('../../../assets/icons/bot-icon.png')} style={{ width: 30, height: 30 }} />
        <View style={styles.statusDot} />
      </View>
      <View style={{ marginLeft: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>Asistente</Text>
        <Text style={{ fontSize: 12, color: '#22C55E' }}>● Disponible</Text>
      </View>
    </View>
  </View>

  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      {chatLog.map((item) => (
        <View key={item.id} style={{ alignSelf: item.sender === 'bot' ? 'flex-start' : 'flex-end', maxWidth: '85%', marginBottom: 15 }}>
          <View style={item.sender === 'bot' ? styles.bubbleBot : styles.bubbleUser}>
            <Text style={item.sender === 'bot' ? styles.textBot : styles.textUser}>{item.texto}</Text>
          </View>
        </View>
      ))}
    </ScrollView>

    <View style={styles.chatInputContainer}>
      <View style={styles.inputChatWrapper}>
        <TextInput value={mensaje} onChangeText={setMensaje} style={{ flex: 1 }} placeholder="Escribe tu pregunta..." />
      </View>
      <TouchableOpacity onPress={enviarMensaje} style={styles.sendButton}>
        <MaterialCommunityIcons name="send" size={24} color="white" />
      </TouchableOpacity>
    </View>
  </KeyboardAvoidingView>

  <BottomTabBar />
</SafeAreaView>
  );
}