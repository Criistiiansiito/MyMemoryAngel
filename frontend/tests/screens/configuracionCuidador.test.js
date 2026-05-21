jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}), { virtual: true });

jest.mock('@react-native-async-storage/async-storage', () => ({
  removeItem: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  signOut: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../src/services/firebase', () => ({
  auth: {},
}));

jest.mock('react-native', () => {
  const React = require('react');
  const createHost = (name) =>
    React.forwardRef(({ children, ...props }, ref) =>
      React.createElement(name, { ...props, ref }, children)
    );

  return {
    View: createHost('View'),
    Text: createHost('Text'),
    TouchableOpacity: createHost('TouchableOpacity'),
    ScrollView: createHost('ScrollView'),
    Switch: createHost('Switch'),
    TextInput: createHost('TextInput'),
    Image: createHost('Image'),
    ActivityIndicator: createHost('ActivityIndicator'),
    StatusBar: createHost('StatusBar'),
    Modal: createHost('Modal'),
    Platform: { OS: 'web' },
    Alert: { alert: jest.fn() },
    StyleSheet: { absoluteFillObject: {} },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}), { virtual: true });
jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  useCameraPermissions: jest.fn(() => [{ granted: true }, jest.fn().mockResolvedValue({ granted: true })]),
}), { virtual: true });

jest.mock('../../src/style/styles', () => ({
  getStyles: jest.fn(() => ({
    container: {},
    topBar: {},
    topBarArrow: {},
    brandName: {},
    scrollContent: {},
    profileSection: {},
    profilePhotoContainer: {},
    photoCircle: {},
    editPhotoButton: {},
    label: {},
    inputContainer: {},
    inputIcon: {},
    input: {},
    mainButton: {},
    mainButtonText: {},
    dividerContainer: {},
    dividerLine: {},
    dividerText: {},
    settingsCard: {},
    sectionHeader: {},
    sectionTitle: {},
    optionButton: {},
    optionButtonActive: {},
    optionText: {},
    optionTextActive: {},
    qrCard: {},
    qrDescription: {},
    scanBtn: {},
    scanBtnText: {},
    scanCameraContainer: {},
    scanMarker: {},
    scanMarkerText: {},
    scanCloseModal: {},
  })),
}));

const mockAccesibilidad = {
  aplicarEscala: (value) => value,
  textSizeLabel: 'Mediano',
  setTextSizeLabel: jest.fn(),
  isDarkMode: false,
  setIsDarkMode: jest.fn(),
  cargarDesdeServidor: jest.fn(),
};

jest.mock('../../src/services/accesibilidadContext', () => ({
  useAccesibilidad: jest.fn(() => mockAccesibilidad),
}));

jest.mock('../../src/services/configuracionPerfil', () => ({
  configuracionPerfil: {
    obtenerPerfil: jest.fn(),
    actualizarPerfil: jest.fn(),
    actualizarAccesibilidad: jest.fn(),
  },
}));

jest.mock('../../src/services/vinculacionesService', () => ({
  vinculacionesService: {
    obtenerPacientePorId: jest.fn(),
    vincularPaciente: jest.fn(),
  },
}));

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import { configuracionPerfil } from '../../src/services/configuracionPerfil';
import ConfiguracionCuidador from '../../src/screens/cuidadores/configuracionCuidador';

const getNodeText = (node) => {
  if (typeof node === 'string') return node;
  if (!node || !node.children) return '';
  return node.children.map(getNodeText).join('');
};

const findTouchableByText = (tree, text) =>
  tree.root.findAllByType('TouchableOpacity').find((node) => getNodeText(node).includes(text));

describe('ConfiguracionCuidador screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    configuracionPerfil.obtenerPerfil.mockResolvedValue({
      ok: true,
      usuario: {
        uid: 'u1',
        nombre: 'Cuidador',
        correo: 'cuidador@test.com',
        fecha_nacimiento: '1980-01-01',
      },
    });
  });

  const renderScreen = async () => {
    const navigation = { goBack: jest.fn(), reset: jest.fn() };
    let tree;
    await act(async () => {
      tree = renderer.create(<ConfiguracionCuidador navigation={navigation} />);
    });
    return { tree, navigation };
  };

  // Verifica que la pantalla carga el perfil del cuidador.
  test('carga y muestra el perfil del cuidador', async () => {
    await renderScreen();

    expect(configuracionPerfil.obtenerPerfil).toHaveBeenCalled();
    expect(mockAccesibilidad.cargarDesdeServidor).toHaveBeenCalled();
  });

  // Verifica que guardar sin nombre muestra error.
  test('muestra error si se intenta guardar sin nombre', async () => {
    const { tree } = await renderScreen();
    const inputs = tree.root.findAllByType('TextInput');
    const saveButton = findTouchableByText(tree, 'Guardar Perfil');

    await act(async () => {
      inputs[0].props.onChangeText('   ');
    });

    await act(async () => {
      saveButton.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'El nombre es obligatorio');
  });

  // Verifica que guardar el perfil llama al servicio y muestra confirmacion.
  test('guarda el perfil del cuidador', async () => {
    const { tree } = await renderScreen();
    const inputs = tree.root.findAllByType('TextInput');
    const saveButton = findTouchableByText(tree, 'Guardar Perfil');
    configuracionPerfil.actualizarPerfil.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      inputs[0].props.onChangeText('Cuidador Nuevo');
    });

    await act(async () => {
      saveButton.props.onPress();
    });

    expect(configuracionPerfil.actualizarPerfil).toHaveBeenCalledWith(
      'Cuidador Nuevo',
      null,
      '1980-01-01'
    );
    expect(Alert.alert).toHaveBeenCalledWith(
      '\u00a1Hecho!',
      'Tu perfil se ha actualizado correctamente.'
    );
  });
});
