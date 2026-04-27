const defaultPalette = {
  background: '#F0F5FA',
  surface: '#FFFFFF',
  surface2: '#FFFFFF',
  surfaceSoft: '#F8FAFC',
  surfaceAlt: '#EEF2FF',
  border: '#E2E8F0',
  borderSoft: '#F1F5F9',
  primary: '#334155',
  primarySoft: '#F0F5FF',
  secondary: '#8B5CF6',
  secondarySoft: '#F3E8FF',
  accent: '#6366F1',
  success: '#10B981',
  successStrong: '#16A34A',
  successSoft: '#DCFCE7',
  warning: '#F59E0B',
  warningSoft: '#FFF7ED',
  danger: '#EF4444',
  dangerSoft: '#FEE2E2',
  info: '#3B82F6',
  infoSoft: '#DBEAFE',
  violet: '#A855F7',
  violetSoft: '#F3E8FF',
  orange: '#F97316',
  orangeSoft: '#FFEDD5',
  teal: '#0284C7',
  tealSoft: '#E0F2FE',
  memory: '#EC4899',
  memorySoft: '#FCE7F3',
  inactive: '#94A3B8',
  text: '#334155',
  textStrong: '#1A202C',
  textMuted: '#718096',
  textSoft: '#64748B',
  onPrimary: '#FFFFFF',
  cards: '#FFFFFF',
  menuTitle:'#2D3748',
  menuSubtitle:'#718096',
  nombreCuidador: '#1e293b',
  headerIconButton: '#F7FAFC',
  iconosHeaders: '#334155',
  iconosRecordatorios: '#8B5CF6',
  textoColorNormal: '#0000'
};

const darkPalette = {
  background: '#0F172A',
  surface2: '#111827',
  surface: '#54537e',
  surfaceSoft: '#1E293B',
  surfaceAlt: '#172554',
  border: '#334155',
  borderSoft: '#1E293B',
  primary: '#8ca3be',
  primarySoft: '#1E3A8A',
  secondary: '#A78BFA',
  secondarySoft: '#312E81',
  accent: '#818CF8',
  success: '#34D399',
  successStrong: '#6EE7B7',
  successSoft: '#064E3B',
  warning: '#FBBF24',
  warningSoft: '#78350F',
  danger: '#F87171',
  dangerSoft: '#7F1D1D',
  info: '#38BDF8',
  infoSoft: '#0C4A6E',
  violet: '#C084FC',
  violetSoft: '#581C87',
  orange: '#FB923C',
  orangeSoft: '#7C2D12',
  teal: '#22D3EE',
  tealSoft: '#164E63',
  memory: '#F472B6',
  memorySoft: '#831843',
  inactive: '#FFFF',
  text: '#E5E7EB',
  textStrong: '#F8FAFC',
  textMuted: '#CBD5E1',
  textSoft: '#cbcfd4',
  onPrimary: '#FFFF',
  cards: '#54537e',
  menuTitle:'#FFFF',
  menuSubtitle:'#FFFF',
  nombreCuidador: '#FFFF',
  headerIconButton: '#54537e',
  iconosHeaders: '#FFFF',
  iconosRecordatorios: '#FFFF',
  textoColorNormal: '#FFFF'
};

export const getAccesibilidadColors = (isDarkMode = false) =>
  (isDarkMode ? darkPalette : defaultPalette);

export const getRecordatorioVisualConfig = (tipo, isDarkMode = false) => {
  const colors = getAccesibilidadColors(isDarkMode);

  switch (String(tipo || '').trim()) {
    case 'medicacion':
      return { icon: 'pill', color: colors.infoSoft, iconColor: colors.info };
    case 'cita medica':
      return { icon: 'calendar-check', color: colors.successSoft, iconColor: colors.successStrong };
    case 'tarea':
      return { icon: 'checkbox-marked-outline', color: colors.secondarySoft, iconColor: colors.violet };
    case 'evento personal':
      return { icon: 'account-outline', color: colors.orangeSoft, iconColor: colors.orange };
    case 'hidratacion':
      return { icon: 'cup-water', color: colors.tealSoft, iconColor: colors.teal };
    default:
      return { icon: 'bell-outline', color: '#F1F5F9', iconColor: '#64748B' };
  }
};

export const getTiposRecordatorio = (isDarkMode = false) => {
  const colors = getAccesibilidadColors(isDarkMode);

  return [
    { id: 'Medicaci\u00f3n', icon: 'pill', color: colors.infoSoft, iconColor: colors.info },
    { id: 'Cita m\u00e9dica', icon: 'calendar-check', color: colors.successSoft, iconColor: colors.successStrong },
    { id: 'Tarea', icon: 'checkbox-marked-outline', color: colors.secondarySoft, iconColor: colors.violet },
    { id: 'Evento personal', icon: 'account-outline', color: colors.orangeSoft, iconColor: colors.orange },
    { id: 'Hidrataci\u00f3n', icon: 'cup-water', color: colors.tealSoft, iconColor: colors.teal },
    { id: 'Otro', icon: 'plus', color: '#F7FAFC', iconColor: '#718096' },
  ];
};
