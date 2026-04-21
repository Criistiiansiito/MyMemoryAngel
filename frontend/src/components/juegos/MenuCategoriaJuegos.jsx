import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import BottomTabBar from '../BottomTabBar';
import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext';

export default function MenuCategoriaJuegos({
  onBack,
  title,
  description,
  emptyMessage,
  games = [],
  onSelectGame,
}) {
  const { aplicarEscala, isDaltonic } = useAccesibilidad();
  const styles = getStyles(aplicarEscala, isDaltonic);
  const insets = useSafeAreaInsets();

  const GameCard = ({ game }) => (
    <TouchableOpacity style={styles.menuCard} onPress={() => onSelectGame(game.id)}>
      <View style={[styles.menuIconContainer, { backgroundColor: game.color }]}>
        <MaterialCommunityIcons name={game.icon} size={30} color={game.iconColor} />
      </View>
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={styles.menuTitle}>{game.title}</Text>
        <Text style={styles.menuSubtitle}>{game.description}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
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
          <Text style={styles.brandName}>{title}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.settingsCard, { marginBottom: 20 }]}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={[styles.menuSubtitle, { marginTop: 8 }]}>{description}</Text>
        </View>

        {games.length > 0 ? (
          games.map((game) => <GameCard key={game.id} game={game} />)
        ) : (
          <View style={[styles.settingsCard, { alignItems: 'center', paddingVertical: 30 }]}>
            <MaterialCommunityIcons name="timer-sand" size={54} color="#CBD5E1" />
            <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Próximamente</Text>
            <Text style={[styles.menuSubtitle, { marginTop: 8, textAlign: 'center' }]}>
              {emptyMessage}
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomTabBar />
    </View>
  );
}
