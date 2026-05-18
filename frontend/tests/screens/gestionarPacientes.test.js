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
    StatusBar: createHost('StatusBar'),
    ActivityIndicator: createHost('ActivityIndicator'),
    Image: createHost('Image'),
    Alert: { alert: jest.fn() },
    Platform: { OS: 'web' },
    StyleSheet: { absoluteFillObject: {} },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  useCameraPermissions: jest.fn(() => [{ granted: true }, jest.fn().mockResolvedValue({ granted: true })]),
}), { virtual: true });

jest.mock('../../src/style/styles', () => ({
  getStyles: jest.fn(() => ({
    container: {},
    topBar: {},
    headerActions: {},
    brandName: {},
    headerIconButton: {},
    scrollContent: {},
    dateHeaderContainer: {},
    dateText: {},
    menuCard: {},
    menuIconContainer: {},
    avatarImage: {},
    menuTitle: {},
    menuSubtitle: {},
    infoBox: {},
    infoIconCircle: {},
    infoTitle: {},
    infoText: {},
    scanCameraContainer: {},
    scanMarker: {},
    scanMarkerText: {},
    scanCloseModal: {},
  })),
}));

jest.mock('../../src/services/accesibilidadContext', () => ({
  useAccesibilidad: jest.fn(() => ({
    aplicarEscala: (value) => value,
    isDarkMode: false,
  })),
}));

jest.mock('../../src/components/BottomTabBarCuidador', () => 'BottomTabBarCuidador');
jest.mock('../../src/screens/cuidadores/informacion/informacionPaciente', () => 'InformacionPaciente');
jest.mock('../../src/hooks/useCurrentDate', () => ({
  useCurrentDate: jest.fn(() => new Date('2026-05-18T10:00:00Z')),
}));
jest.mock('../../src/utils/dateMadrid', () => ({
  formatMadridDate: jest.fn(() => 'lunes, 18 de mayo de 2026'),
}));

jest.mock('../../src/services/vinculacionesService', () => ({
  vinculacionesService: {
    obtenerPacientePorId: jest.fn(),
    vincularPaciente: jest.fn(),
  },
}));

jest.mock('../../src/services/gestionPacientesService', () => ({
  gestionPacientesService: {
    listarMisPacientes: jest.fn(),
  },
}));

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { gestionPacientesService } from '../../src/services/gestionPacientesService';
import GestionPacientes from '../../src/screens/cuidadores/gestionarPacientes';

const getTextContent = (node) => {
  if (typeof node === 'string') return node;
  if (!node || !node.children) return '';
  return node.children.map(getTextContent).join('');
};

describe('GestionarPacientes screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = async () => {
    let tree;
    await act(async () => {
      tree = renderer.create(<GestionPacientes />);
    });
    return tree;
  };

  // Verifica que la pantalla muestra la lista de pacientes vinculados.
  test('renderiza pacientes vinculados', async () => {
    gestionPacientesService.listarMisPacientes.mockResolvedValueOnce({
      ok: true,
      pacientes: [{ uid: 'p1', nombre: 'Ana', correo: 'ana@test.com' }],
    });

    const tree = await renderScreen();

    const textNodes = tree.root.findAllByType('Text');
    expect(textNodes.some((node) => getTextContent(node).includes('Ana'))).toBe(true);
  });

  // Verifica que la pantalla muestra estado vacio si no hay pacientes.
  test('muestra mensaje vacio cuando no hay pacientes', async () => {
    gestionPacientesService.listarMisPacientes.mockResolvedValueOnce({
      ok: true,
      pacientes: [],
    });

    const tree = await renderScreen();

    const textNodes = tree.root.findAllByType('Text');
    expect(
      textNodes.some((node) => getTextContent(node).match(/No tienes pacientes vinculados/i))
    ).toBe(true);
  });

  // Verifica que pulsar un paciente abre su vista de detalle.
  test('abre el detalle al seleccionar un paciente', async () => {
    gestionPacientesService.listarMisPacientes.mockResolvedValueOnce({
      ok: true,
      pacientes: [{ uid: 'p1', nombre: 'Ana', correo: 'ana@test.com' }],
    });

    const tree = await renderScreen();
    const buttons = tree.root.findAllByType('TouchableOpacity');

    await act(async () => {
      buttons[1].props.onPress();
    });

    expect(tree.root.findAllByType('InformacionPaciente')).toHaveLength(1);
  });
});
