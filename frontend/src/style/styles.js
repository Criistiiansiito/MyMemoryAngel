import { StyleSheet, Platform, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // --- ESTILOS GENERALES Y CONTENEDORES ---
  container: { 
    flex: 1, 
    backgroundColor: '#F0F5FA',
  },
  contentCenter: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  contentPadding: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
  },

  // --- TOP BAR / HEADER (De tu primer código) ---
  topBar: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 30 : 20, 
    paddingBottom: 15,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  topBarArrow:{
    fontSize:26,
    color:"#334155"
  },
  logoRow: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // <--- ESTO empuja los iconos a la derecha
    width: '100%', // <--- Obligatorio para que ocupe todo el ancho
  },
  logoHeader: { 
    width: 60, 
    height: 60, 
    marginRight: 55, // Ajustado de 50 a 15 para que el texto esté cerca del logo
  },
  textContainer: {
    justifyContent: 'center',
  },
  brandName: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#1A202C',
    marginLeft: 15
  },
  subtitle: { 
    fontSize: 13, 
    color: '#718096', 
    fontWeight: '400'
  },

  // --- BOTONES TIPO CARD (Bienvenida) ---
  buttonWrapper: { 
    width: '100%', 
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardButtonText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#2D3748' 
  },

  // --- FORMULARIOS (Registro/Login) ---
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
    marginTop: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
    fontSize: 22,      
    color: '#94A3B8'
  },
  input: {
    flex: 1,
    color: '#2D3748',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  dateDisplay: {
    flex: 1,
    fontSize: 16,
    textAlignVertical: 'center',
  },

  // --- BOTONES DE ACCIÓN (Bottom) ---
  footer: {
    paddingHorizontal: 25,
    paddingBottom: 30, 
    backgroundColor: '#F0F5FA',
  },
  mainButton: {
    backgroundColor: '#334155',
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginLink: { 
    marginTop: 10,
    alignItems: 'center'
  },
  loginText: { 
    color: '#334155', 
    fontSize: 15, 
    fontWeight: '500',
    textDecorationLine: 'underline'
  },

  // --- ELEMENTOS FLOTANTES (Bot de ayuda) ---
  botPosition: {
    position: 'absolute',
    bottom: 35,
    alignSelf: 'center',
  },
  botCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF9C4', 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  botImage: {
    width: 45,
    height: 45,
  },

  // --- MENSAJES ---
  message: {
    color: '#E53E3E',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
  // --- NUEVOS: DASHBOARD ESPECÍFICOS ---
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    // La sombra ahora la tiene este contenedor para que el bloque superior "flote"
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  dateText: {
    color: '#718096',
    fontSize: 16,
    left: 60,
    fontWeight: '500',
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
    marginLeft: 10,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15, // Mucho más redondo como en la imagen
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 4, // Pequeño margen para que respire la sombra
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  menuIconContainer: {
    width: 65, // Un poco más grande
    height: 65,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: Platform.OS === 'ios' ? 95 : 75, // Altura fija para que no se vea aplastado
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 4,
  },
  tabTextActive: {
    color: '#334155',
  },
  // --- AJUSTE DE CONTENEDOR PARA QUE NO TOQUE BORDES ---
  scrollContent: {
    paddingHorizontal: 20, // Esto evita que las cards lleguen al borde de la pantalla
    paddingTop: 20,
    paddingBottom: 40,
  },

  // --- SECCIÓN DE PERFIL (Sin borde de card, más limpio) ---
  profileSection: {
    paddingVertical: 10,
    marginBottom: 20,
  },

  // --- LÍNEA DIVISORA CON TEXTO ---
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // --- TARJETAS DE CONFIGURACIÓN (Mantienen el estilo card) ---
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  // --- ELEMENTOS DE INTERACCIÓN EN AJUSTES ---
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginLeft: 10,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  optionButtonActive: {
    borderColor: '#4D6BFE',
    backgroundColor: '#F0F5FF',
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#4D6BFE',
    fontWeight: '700',
  },
  rowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  // --- ESTILOS PARA LA FOTO DE PERFIL ---
  profilePhotoContainer: {
    alignSelf: 'center',
    marginBottom: 25,
    position: 'relative', // Para posicionar el botón de editar encima
  },
  photoCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#E8F0FE', // Azul clarito de fondo
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra para darle profundidad
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#334155', // Gris oscuro como tus botones
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
    grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  typeCard: {
    width: '48%', // Dos columnas
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    // Sombra suave
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  typeCardActive: {
    borderColor: '#4D6BFE',
    backgroundColor: '#F0F5FF',
    borderWidth: 2,
  },
  typeIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
    textAlign: 'center',
  },
  typeTextActive: {
    color: '#4D6BFE',
    fontWeight: '700',
  },
  gridRecordatorios: {
    flexDirection: 'row',
    flexWrap: 'wrap', // ESTO ES VITAL para que no se salgan de la pantalla
    justifyContent: 'space-between',
    width: '100%',
  },
  cardTipoRecordatorio: {
    width: '48%', // Esto hace que quepan 2 por fila
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  // Reutiliza tus estilos de optionButton para la frecuencia
  optionButton: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  // --- ESTILOS DEL CHATBOT ---
  chatContainer: {
    flex: 1,
    backgroundColor: '#FFFCF5', // Ese tono crema suave de fondo
  },
  bubbleBot: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderTopLeftRadius: 2, // Pico de la burbuja
    padding: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bubbleUser: {
    backgroundColor: '#3B82F6', // Azul brillante del usuario
    borderRadius: 18,
    borderTopRightRadius: 2, // Pico de la burbuja
    padding: 15,
    elevation: 1,
  },
  textBot: {
    color: '#4A5568',
    fontSize: 16,
    lineHeight: 22,
  },
  textUser: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  inputChatWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3B82F6', // Borde azul como en tu foto
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  // --- ESTILOS DEL FOOTER (TAB BAR) ---
  tabBar: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, // Ajuste para iPhone
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#4D6BFE',
    fontWeight: '700',
  },

  // --- EXTRAS PARA EL HEADER DEL CHAT ---
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  activityCanvas: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  canvasHint: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  actionPanel: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  colorPicker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },

  colorPickerSelected: {
    borderColor: '#334155',
    transform: [{ scale: 1.1 }], 
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  // ==========================================
  // SECCIÓN: RECORDATORIOS (LISTADO)
  // ==========================================
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButtonsGroup: {
    flexDirection: 'row',
  },
  dateHeaderContainer: {
    alignItems: 'center', 
    marginVertical: 20,
  },
  emptyStateContainer: {
    alignItems: 'center', 
    marginTop: 50,
  },
  emptyStateText: {
    color: '#718096', 
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  menuCardCompleted: {
    borderColor: '#4ADE80', 
    borderWidth: 1.5, 
    opacity: 0.8,
  },
  reminderInfoBody: {
    flex: 1,
  },
  reminderTopRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 6,
  },
  timeBadge: {
    backgroundColor: '#F1F5F9', 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 6, 
    marginRight: 8, 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  timeBadgeText: {
    color: '#4D6BFE', 
    fontWeight: 'bold', 
    fontSize: 11, 
    marginLeft: 4,
  },
  completedBadge: {
    backgroundColor: '#DCFCE7', 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 4,
  },
  completedCheck: {
    color: '#16A34A', 
    fontSize: 10, 
    fontWeight: 'bold',
  },
  reminderFooterRow: {
    flexDirection: 'row', 
    marginTop: 8, 
    alignItems: 'center',
  },
  typeDot: {
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    marginRight: 6,
  },
  typeTabText: {
    fontSize: 11, 
    color: '#94A3B8', 
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  centeredLoader: {
    marginTop: 50,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  calendarTheme: {
    calendarBackground: '#FFFFFF',
    selectedDayBackgroundColor: '#4D6BFE',
    todayTextColor: '#4D6BFE',
    arrowColor: '#4D6BFE',
    textMonthFontWeight: '800',
    textDayHeaderFontWeight: '600',
    dotStyle: { width: 6, height: 6, borderRadius: 3 }
  },
  inputLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#F1F5F9',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  dateTimeButton: {
    backgroundColor: '#EEF2FF',
    padding: 15,
    borderRadius: 12,
    flex: 0.48,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dateTimeText: {
    color: '#4D6BFE',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  btnPrimary: {
    backgroundColor: '#4D6BFE',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  btnDangerOutline: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: 10,
  },
});