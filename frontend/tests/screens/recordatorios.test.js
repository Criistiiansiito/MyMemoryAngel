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
    typeDot: {},
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

jest.mock('../../src/components/BottomTabBar', () => 'BottomTabBar');

jest.mock('../../src/hooks/useCurrentDate', () => ({
  useCurrentDate: jest.fn(() => new Date('2026-05-18T10:00:00Z')),
}));

jest.mock('../../src/utils/dateMadrid', () => ({
  formatMadridDate: jest.fn(() => 'lunes, 18 de mayo de 2026'),
  toMadridDateOnly: jest.fn(() => '2026-05-18'),
}));

jest.mock('../../src/services/recordatoriosService', () => ({
  fetchRecordatorios: jest.fn(),
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
}));

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchRecordatorios,
  marcarRecordatorioCumplido,
} from '../../src/services/recordatoriosService';
import Recordatorios from '../../src/screens/pacientes/recordatorios';

const getTextContent = (node) => {
  if (typeof node === 'string') return node;
  if (!node || !node.children) return '';
  return node.children.map(getTextContent).join('');
};

describe('Recordatorios screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFocusEffect.mockImplementation(() => {});
  });

  const renderScreen = async () => {
    let tree;
    await act(async () => {
      tree = renderer.create(<Recordatorios navigation={{ navigate: jest.fn() }} />);
    });
    return tree;
  };

  // Verifica que la pantalla muestra estado vacio si no hay recordatorios.
  test('muestra estado vacio cuando no hay recordatorios', async () => {
    fetchRecordatorios.mockResolvedValueOnce({ ok: true, data: [] });

    const tree = await renderScreen();

    const textNodes = tree.root.findAllByType('Text');
    expect(textNodes.some((node) => getTextContent(node).match(/No hay recordatorios para hoy/i))).toBe(true);
  });

  // Verifica que la pantalla renderiza los recordatorios recibidos.
  test('renderiza un recordatorio cargado', async () => {
    fetchRecordatorios.mockResolvedValueOnce({
      ok: true,
      data: [
        {
          id_recordatorio: 1,
          titulo: 'Tomar agua',
          descripcion: 'Beber un vaso',
          tipo: 'Hidratacion',
          fecha_hora: '2026-05-18 10:00:00',
          fecha_ocurrencia: '2026-05-18',
          cumplido: 0,
        },
      ],
    });

    const tree = await renderScreen();

    const textNodes = tree.root.findAllByType('Text');
    expect(textNodes.some((node) => getTextContent(node).includes('Tomar agua'))).toBe(true);
    expect(textNodes.some((node) => getTextContent(node).includes('Beber un vaso'))).toBe(true);
  });

  // Verifica que pulsar un recordatorio actualiza su estado de cumplido.
  test('marca un recordatorio como cumplido al pulsarlo', async () => {
    fetchRecordatorios.mockResolvedValueOnce({
      ok: true,
      data: [
        {
          id_recordatorio: 1,
          titulo: 'Tomar agua',
          descripcion: '',
          tipo: 'Hidratacion',
          fecha_hora: '2026-05-18 10:00:00',
          fecha_ocurrencia: '2026-05-18',
          cumplido: 0,
        },
      ],
    });
    marcarRecordatorioCumplido.mockResolvedValueOnce({ ok: true });

    const tree = await renderScreen();

    const buttons = tree.root.findAllByType('TouchableOpacity');

    await act(async () => {
      buttons[3].props.onPress();
    });

    expect(marcarRecordatorioCumplido).toHaveBeenCalledWith(1, true, '2026-05-18');
  });

  // Verifica que se muestra una alerta si la carga falla con un error distinto de 404.
  test('muestra alerta si falla la carga de recordatorios', async () => {
    fetchRecordatorios.mockResolvedValueOnce({ ok: false, data: [], status: 500 });

    await renderScreen();

    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'No se pudieron obtener los recordatorios.'
    );
  });
});
