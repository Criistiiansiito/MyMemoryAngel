import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function Calculadora({ onBack }) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [respuesta, setRespuesta] = useState('');
  const [mensaje, setMensaje] = useState('');

  const nuevaPregunta = () => {
    setNum1(Math.floor(Math.random() * 20) + 1);
    setNum2(Math.floor(Math.random() * 20) + 1);
    setRespuesta('');
    setMensaje('');
  };

  useEffect(nuevaPregunta, []);

  const comprobar = () => {
    if (parseInt(respuesta) === num1 + num2) setMensaje('✅ ¡Correcto!');
    else setMensaje(`❌ Era ${num1 + num2}`);
    nuevaPregunta();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cálculo Mental</Text>
      <Text style={styles.question}>{`${num1} + ${num2} = ?`}</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={respuesta} onChangeText={setRespuesta}/>
      <TouchableOpacity style={styles.button} onPress={comprobar}>
        <Text style={styles.buttonText}>Responder</Text>
      </TouchableOpacity>
      {mensaje && <Text style={styles.feedback}>{mensaje}</Text>}
      <TouchableOpacity onPress={onBack}><Text style={styles.back}>Volver</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:'center',alignItems:'center'},
  title:{fontSize:24,fontWeight:'bold',marginBottom:20},
  question:{fontSize:28,marginBottom:10},
  input:{borderWidth:1,borderColor:'#ccc',borderRadius:8,width:'50%',textAlign:'center',marginBottom:10},
  button:{backgroundColor:'#007bff',padding:10,borderRadius:8},
  buttonText:{color:'#fff',fontWeight:'bold'},
  feedback:{fontSize:18,marginTop:10},
  back:{color:'#007bff',marginTop:20}
});
