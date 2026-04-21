import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import BottomTabBar from '../../../components/BottomTabBar';
import { getStyles } from '../../../style/styles';
import { useAccesibilidad } from '../../../services/accesibilidadContext';

export default function MenuJuegos({ onBack, onSelectCategory }) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
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
    <TouchableOpacity style={styles.typeCard} onPress={() => onSelectCategory(category.id)}>
      <View style={[styles.typeIconCircle, { backgroundColor: category.color }]}>
        <MaterialCommunityIcons name={category.icon} size={36} color={category.iconColor} />
      </View>
      <View>
        <Text style={[styles.badgeText, { color: category.iconColor }]}>{category.label}</Text>
      </View>
      <Text style={[styles.typeText, { marginTop: 10, fontWeight: '700', textAlign: 'center' }]}>
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
        <View style={[styles.settingsCard, { marginBottom: 20 }]}>
          <Text style={styles.sectionTitle}>Elige un área</Text>
          <Text style={[styles.menuSubtitle, { marginTop: 8 }]}>
            Accede a los juegos agrupados por capacidad cognitiva.
          </Text>
        </View>

        <View style={styles.grid}>
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </View>
      </ScrollView>

      <BottomTabBar />
    </View>
  );
}
