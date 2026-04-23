import { StyleSheet, Platform, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window');
const CANVAS_SIZE = width - 20;

export const getJuegosStyles = (aplicarEscala) => StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    scrollContent: {
      padding: 20,
      alignItems: 'center',
    },
    progressWrapper: {
      width: '100%',
      marginBottom: 20,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    roundText: {
      color: '#64748B',
      fontWeight: '600',
    },
    scoreText: {
      color: '#EC4899',
      fontWeight: 'bold',
    },
    progressTrack: {
      height: 8,
      backgroundColor: '#E2E8F0',
      borderRadius: 4,
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#EC4899',
      borderRadius: 4,
    },
    gameCard: {
      width: '100%',
      alignItems: 'center',
      paddingVertical: 30,
      borderWidth: 2,
    },
    gameCardIdleShadow: {
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    gameCardActiveShadow: {
      shadowOpacity: 0.2,
      shadowRadius: 10,
    },
    phaseText: {
      marginTop: 10,
      marginBottom: 0,
      textAlign: 'center',
    },
    difficultyText: {
      marginTop: 8,
      marginBottom: 0,
      textTransform: 'none',
      letterSpacing: 0,
      color: '#94A3B8',
    },
    sequenceWrapper: {
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 20,
    },
    sequenceText: {
      fontSize: aplicarEscala(40),
      fontWeight: '800',
      color: '#EC4899',
      letterSpacing: 10,
    },
    sequenceDotsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    sequenceDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
    },
    feedbackText: {
      fontSize: aplicarEscala(22),
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 4,
    },
    finishedContent: {
      alignItems: 'center',
    },
    finishedTitle: {
      fontSize: aplicarEscala(24),
      fontWeight: 'bold',
      color: '#1E293B',
      marginTop: 15,
    },
    finishedSubtitle: {
      fontSize: aplicarEscala(18),
      color: '#64748B',
      marginTop: 5,
    },
    grid: {
      alignItems: 'center',
      width: '100%',
      marginTop: 20,
      gap: 15,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 15,
    },
    numButton: {
      width: 100,
      height: 100,
      backgroundColor: 'white',
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: '#F1F5F9',
    },
    numButtonEnabled: {
      opacity: 1,
    },
    numButtonDisabled: {
      opacity: 0.5,
    },
    numText: {
      fontSize: 32,
      fontWeight: '700',
      color: '#334155',
    },
    backButton: {
      marginTop: 20,
      width: '100%',
      backgroundColor: '#10B981',
    },
  });