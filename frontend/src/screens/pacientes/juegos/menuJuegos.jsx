import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import BottomTabBar from '../../../components/BottomTabBar';
import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';

export default function MenuJuegos({ onBack, onSelectCategory }) {
  const { aplicarEscala, isDarkMode } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDarkMode);
  const insets = useSafeAreaInsets();

  const categories = [
    { id: 'Memoria', title: 'Memoria', icon: 'brain', label: 'Recuerdo', color: '#FDF2F8', iconColor: '#EC4899' },
    { id: 'Atencion', title: 'Atención', icon: 'target', label: 'Foco', color: '#ECFDF5', iconColor: '#10B981' },
    { id: 'Lenguaje', title: 'Lenguaje', icon: 'chat-processing-outline', label: 'Palabras', color: '#FFF7ED', iconColor: '#F97316' },
    { id: 'Orientacion', title: 'Orientación', icon: 'compass-outline', label: 'Contexto', color: '#EEF2FF', iconColor: '#6366F1' },
    { id: 'FuncionesEjecutivas', title: 'Funciones Ejecutivas', icon: 'calculator-variant-outline', label: 'Lógica', color: '#EFF6FF', iconColor: '#3B82F6' },
    { id: 'Visual', title: 'Visual', icon: 'eye-outline', label: 'Percepción', color: '#F0FDF4', iconColor: '#16A34A' },
  ];

  const CategoryCard = ({ category }) => (
    <TouchableOpacity style={[styles.typeCard, isDarkMode && { backgroundColor: '#54537e' }]} onPress={() => onSelectCategory(category.id)}>
      <View style={[styles.typeIconCircle, { backgroundColor: category.color }]}>
        <MaterialCommunityIcons name={category.icon} size={36} color={category.iconColor} />
      </View>
      <View>
        <Text style={[styles.badgeText, isDarkMode ? { color: '#FFFFFF' } : { color: category.iconColor }]}>{category.label}</Text>
      </View>
      <Text style={[styles.typeText, { marginTop: 10, fontWeight: '700', textAlign: 'center' }, isDarkMode && { color: '#FFFFFF' }]}>
        {category.title}
      </Text>
    </TouchableOpacity>
  );

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
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Juegos Cognitivos</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </View>

        <View style={[styles.infoBox, isDarkMode && { borderColor: '#FFFFFF' }]}>
          <View style={styles.infoIconCircle}>
            <MaterialCommunityIcons name="lightbulb-on" size={24} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Sugerencia del día</Text>
            <Text style={styles.infoText}>
             "Los juegos mentales estimulan la memoria y la concentración, ayudando a mantener la mente activa de forma sencilla y agradable."
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomTabBar />
    </View>
  );
}
