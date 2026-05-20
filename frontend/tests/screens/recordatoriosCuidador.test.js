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
    ScrollView: createHost('ScrollView'),
    TouchableOpacity: createHost('TouchableOpacity'),
    ActivityIndicator: createHost('ActivityIndicator'),
    StatusBar: createHost('StatusBar'),
    Alert: { alert: jest.fn() },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('../../src/style/styles', () => ({
  getStyles: jest.fn(() => ({
    container: {},
    topBar: {},
    headerActions: {},
    brandName: {},
    headerButtonsGroup: {},
    headerIconButton: {},
    iconosRecordatorios: {},
    scrollContent: {},
    dateHeaderContainer: {},
    dateText: {},
    centeredLoader: {},
    emptyStateContainer: {},
    emptyStateText: {},
    menuCard: {},
    menuCardCompleted: {},
    reminderCardContent: {},
    menuIconContainer: {},
    reminderInfoBody: {},
    reminderTopRow: {},
    timeBadge: {},
    timeBadgeText: {},
    completedBadge: {},
    completedCheck: {},
    menuTitle: {},
    menuSubtitle: {},
    reminderFooterRow: {},
    typeTabText: {},
    reminderActionButton: {},
  })),
}));

jest.mock('../../src/services/accesibilidadContext', () => ({
  useAccesibilidad: jest.fn(() => ({
    aplicarEscala: (value) => value,
    isDarkMode: false,
  })),
}));

jest.mock('../../src/components/BottomTabBarCuidador', () => 'BottomTabBarCuidador');

jest.mock('../../src/hooks/useCurrentDate', () => ({
  useCurrentDate: jest.fn(() => new Date('2026-05-18T10:00:00Z')),
}));

jest.mock('../../src/utils/dateMadrid', () => ({
  formatMadridDate: jest.fn(() => 'lunes, 18 de mayo de 2026'),
  toMadridDateOnly: jest.fn(() => '2026-05-18'),
}));

jest.mock('../../src/services/recordatoriosService', () => ({
  fetchRecordatorios: jest.fn(),
  fetchRecordatoriosHoyPorUsuario: jest.fn(),
  getStoredUser: jest.fn(),
  getIconConfig: jest.fn(() => ({
    icon: 'pill',
    color: '#DBEAFE',
    iconColor: '#3B82F6',
  })),
  formatearFechaYHora: jest.fn(() => ({
    fecha: '18 may 2026',
    hora: '10:00',
  })),
  marcarRecordatorioCumplido: jest.fn(),
  parseMySQLDateTime: jest.fn((value) => new Date(value.replace(' ', 'T'))),
}));

jest.mock('../../src/services/gestionPacientesService', () => ({
  gestionPacientesService: {
    listarMisPacientes: jest.fn(),
  },
}));

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchRecordatorios,
  fetchRecordatoriosHoyPorUsuario,
  getStoredUser,
  marcarRecordatorioCumplido,
} from '../../src/services/recordatoriosService';
import { gestionPacientesService } from '../../src/services/gestionPacientesService';
import RecordatoriosCuidador from '../../src/screens/cuidadores/recordatoriosCuidador';

const getTextContent = (node) => {
  if (typeof node === 'string') return node;
  if (!node || !node.children) return '';
  return node.children.map(getTextContent).join('');
};

describe('RecordatoriosCuidador screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFocusEffect.mockImplementation(() => {});
  });

  const renderScreen = async () => {
    const navigation = { navigate: jest.fn() };
    let tree;
    await act(async () => {
      tree = renderer.create(<RecordatoriosCuidador navigation={navigation} />);
    });
    return tree;
  };

  // Verifica que se combinan recordatorios propios y de pacientes mostrando el origen.
  test('muestra recordatorios propios y de pacientes', async () => {
    getStoredUser.mockResolvedValueOnce({ uid: 'cuidador-1' });
    fetchRecordatorios.mockResolvedValueOnce({
      ok: true,
      data: [{ id_recordatorio: 1, titulo: 'Propio', fecha_hora: '2026-05-18 09:00:00', fecha_ocurrencia: '2026-05-18', cumplido: 0 }],
    });
    gestionPacientesService.listarMisPacientes.mockResolvedValueOnce({
      ok: true,
      pacientes: [{ uid: 'p1', nombre: 'Ana' }],
    });
    fetchRecordatoriosHoyPorUsuario.mockResolvedValueOnce({
      ok: true,
      data: [{ id_recordatorio: 2, titulo: 'Paciente', fecha_hora: '2026-05-18 10:00:00', fecha_ocurrencia: '2026-05-18', cumplido: 0 }],
    });

    const tree = await renderScreen();
    const textNodes = tree.root.findAllByType('Text');

    expect(textNodes.some((node) => getTextContent(node).includes('Propio'))).toBe(true);
    expect(textNodes.some((node) => getTextContent(node).includes('Paciente'))).toBe(true);
    expect(textNodes.some((node) => getTextContent(node).includes('Ana'))).toBe(true);
  });

  // Verifica que pulsar un recordatorio actualiza su estado de cumplido.
  test('marca un recordatorio como cumplido', async () => {
    getStoredUser.mockResolvedValueOnce({ uid: 'cuidador-1' });
    fetchRecordatorios.mockResolvedValueOnce({
      ok: true,
      data: [{ id_recordatorio: 1, titulo: 'Propio', fecha_hora: '2026-05-18 09:00:00', fecha_ocurrencia: '2026-05-18', cumplido: 0 }],
    });
    gestionPacientesService.listarMisPacientes.mockResolvedValueOnce({
      ok: true,
      pacientes: [],
    });
    marcarRecordatorioCumplido.mockResolvedValueOnce({ ok: true });

    const tree = await renderScreen();
    const touchables = tree.root.findAllByType('TouchableOpacity');

    await act(async () => {
      touchables[3].props.onPress();
    });

    expect(marcarRecordatorioCumplido).toHaveBeenCalledWith(1, true, '2026-05-18');
  });
});
