import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';

export default function ArteActividad({ onBack }) {
  const { aplicarEscala } = useAccesibilidad();
  const styles = getStyles(aplicarEscala);

  const [selectedColor, setSelectedColor] = useState('#EF4444');
  
  const colors = [
    '#EF4444', '#F97316', '#F59E0B', '#10B981', 
    '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#000000'
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#334155" />
          </TouchableOpacity>
          <Text style={[styles.brandName, { marginLeft: 10 }]}>Taller de Arte</Text>
        </View>
        <TouchableOpacity onPress={() => alert('¡Obra guardada!')}>
          <MaterialCommunityIcons name="content-save-outline" size={28} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {/* Área del Lienzo */}
      <View style={{ flex: 1, padding: 20 }}>
        <View style={{ 
          flex: 1, 
          backgroundColor: 'white', 
          borderRadius: 20, 
          borderWidth: 2, 
          borderColor: '#E2E8F0', 
          borderStyle: 'dashed',
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <MaterialCommunityIcons name="image-outline" size={100} color="#CBD5E1" />
          <Text style={{ color: '#94A3B8', marginTop: 10, fontSize: 16, fontFamily: 'System' }}>
            Toca para empezar a dibujar
          </Text>
        </View>
      </View>

      {/* Panel Inferior */}
      <View style={[styles.settingsCard, { margin: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, paddingTop: 20 }]}>
        <Text style={[styles.sectionTitle, { marginBottom: 15 }]}>Selecciona un color</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={{ 
                width: 45, 
                height: 45, 
                borderRadius: 25, 
                backgroundColor: color, 
                marginRight: 12,
                borderWidth: selectedColor === color ? 3 : 0,
                borderColor: '#334155'
              }}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </ScrollView>

        {/* Herramientas*/}
        <View style={[styles.rowSpace, { justifyContent: 'center', gap: 20, marginBottom: 10 }]}>
          <TouchableOpacity style={[styles.typeIconCircle, { backgroundColor: '#6366F1' }]}>
            <MaterialCommunityIcons name="brush" size={28} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.typeIconCircle, { backgroundColor: '#94A3B8' }]}>
            <MaterialCommunityIcons name="eraser" size={28} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.typeIconCircle, { backgroundColor: '#F43F5E' }]}>
            <MaterialCommunityIcons name="delete-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}