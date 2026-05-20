jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}), { virtual: true });

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
    Platform: { OS: 'web' },
    Alert: { alert: jest.fn() },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}), { virtual: true });
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}), { virtual: true });
jest.mock('react-native-qrcode-svg', () => 'QRCode', { virtual: true });

jest.mock('../../src/style/styles', () => ({
  getStyles: jest.fn(() => ({
    container: {},
    topBar: {},
    topBarArrow: {},
    brandName: {},
    headerIconButton: {},
    iconosHeaders: {},
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
    uidText: {},
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

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import * as Speech from 'expo-speech';
import { configuracionPerfil } from '../../src/services/configuracionPerfil';
import ConfiguracionPaciente from '../../src/screens/pacientes/configuracionPaciente';

const getTextContent = (node) => {
  if (typeof node === 'string') return node;
  if (!node || !node.children) return '';
  return node.children.map(getTextContent).join('');
};

const findTouchableByText = (tree, text) =>
  tree.root.findAllByType('TouchableOpacity').find((node) => getTextContent(node).includes(text));

describe('ConfiguracionPaciente screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    configuracionPerfil.obtenerPerfil.mockResolvedValue({
      ok: true,
      usuario: {
        uid: 'u1',
        nombre: 'Ana',
        correo: 'ana@test.com',
        fecha_nacimiento: '1950-01-01',
      },
    });
  });

  const renderScreen = async () => {
    const navigation = {
      goBack: jest.fn(),
      reset: jest.fn(),
    };
    let tree;
    await act(async () => {
      tree = renderer.create(<ConfiguracionPaciente navigation={navigation} />);
    });
    return { tree, navigation };
  };

  // Verifica que la pantalla carga y muestra los datos del perfil.
  test('renderiza los datos recuperados del perfil', async () => {
    const { tree } = await renderScreen();

    const textNodes = tree.root.findAllByType('Text');
    expect(textNodes.some((node) => getTextContent(node).includes('Configuraci'))).toBe(true);
    expect(configuracionPerfil.obtenerPerfil).toHaveBeenCalled();
    expect(mockAccesibilidad.cargarDesdeServidor).toHaveBeenCalled();
  });

  // Verifica que guardar sin nombre muestra un error de validacion.
  test('muestra alerta si se intenta guardar sin nombre', async () => {
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
  test('guarda el perfil y muestra mensaje de exito', async () => {
    const { tree } = await renderScreen();
    configuracionPerfil.actualizarPerfil.mockResolvedValueOnce({ ok: true });

    const inputs = tree.root.findAllByType('TextInput');
    const saveButton = findTouchableByText(tree, 'Guardar Perfil');

    await act(async () => {
      inputs[0].props.onChangeText('Ana Maria');
    });

    await act(async () => {
      saveButton.props.onPress();
    });

    expect(configuracionPerfil.actualizarPerfil).toHaveBeenCalledWith(
      'Ana Maria',
      null,
      '1950-01-01'
    );
    expect(Alert.alert).toHaveBeenCalledWith(
      '\u00a1Hecho!',
      'Tu perfil se ha actualizado correctamente.'
    );
  });

  // Verifica que el boton de voz inicia la lectura del resumen.
  test('activa la lectura del resumen accesible', async () => {
    const { tree } = await renderScreen();

    const buttons = tree.root.findAllByType('TouchableOpacity');

    await act(async () => {
      buttons[1].props.onPress();
    });

    expect(Speech.speak).toHaveBeenCalled();
  });
});
