import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';

export default function MenuCategoriaEstimulacion({
  items = [],
  onSelectItem,
  containerStyle,
}) {
  const { aplicarEscala, isDarkMode } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDarkMode);

  return (
    <ScrollView
      contentContainerStyle={[{ padding: 20 }, containerStyle]}
      showsVerticalScrollIndicator={false}
    >
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.musicCard, isDarkMode && { backgroundColor: '#54537e' }]}
          onPress={() => onSelectItem(item)}
        >
          <View style={[styles.musicIconContainer, { backgroundColor: item.color }]}>
            <MaterialCommunityIcons name={item.icono} size={32} color="white" />
          </View>
          <View style={styles.musicTextContainer}>
            <Text style={[styles.musicCardTitle, isDarkMode && { color: '#FFFFFF' }]}>{item.titulo}</Text>
            <Text style={[styles.musicCardDescription, isDarkMode && { color: '#FFFFFF' }]} numberOfLines={2}>
              {item.descripcion}
            </Text>
            <View style={styles.musicBadge}>
              <View style={styles.musicBadgePlaySection}>
                <MaterialCommunityIcons name={item.actionIcon} size={16} color={item.color} />
                <Text style={[styles.musicBadgeText, isDarkMode ? { color: '#FFFFFF' } : { color: item.color }]}>
                  {item.actionLabel}
                </Text>
              </View>
              <Text style={styles.musicSeparator}>|</Text>
              <View style={styles.musicBadgeMomentSection}>
                <MaterialCommunityIcons name="clock-outline" size={13} color="#64748B" />
                <Text style={[styles.momentoTextInline, isDarkMode && { color: '#FFFFFF' }]}>{item.meta}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
