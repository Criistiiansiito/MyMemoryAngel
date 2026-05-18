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
    ActivityIndicator: createHost('ActivityIndicator'),
    StatusBar: createHost('StatusBar'),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('react-native-calendars', () => ({
  Calendar: 'Calendar',
  LocaleConfig: { locales: {}, defaultLocale: 'es' },
}), { virtual: true });

jest.mock('../../src/style/styles', () => ({
  getStyles: jest.fn(() => ({
    container: {},
    topBar: {},
    topBarArrow: {},
    brandName: {},
    scrollContent: {},
    calendarCard: {},
    calendarTheme: {},
    dividerContainer: {},
    dividerLine: {},
    dividerText: {},
    centeredLoader: {},
    emptyStateContainer: {},
    emptyStateText: {},
    menuCard: {},
    menuIconContainer: {},
    reminderInfoBody: {},
    menuTitle: {},
    menuSubtitle: {},
  })),
}));

jest.mock('../../src/services/accesibilidadContext', () => ({
  useAccesibilidad: jest.fn(() => ({
    aplicarEscala: (value) => value,
    isDarkMode: false,
  })),
}));

jest.mock('../../src/hooks/useCurrentDate', () => ({
  useCurrentDate: jest.fn(() => new Date('2026-05-18T10:00:00Z')),
}));

jest.mock('../../src/utils/dateMadrid', () => ({
  formatMadridDate: jest.fn((date, options) => {
    if (options?.day) return '18 may';
    return '2026-05-18';
  }),
  toMadridDateOnly: jest.fn(() => '2026-05-18'),
}));

jest.mock('../../src/services/recordatoriosService', () => ({
  fetchRecordatoriosCalendario: jest.fn(),
  getIconConfig: jest.fn(() => ({
    icon: 'pill',
    color: '#DBEAFE',
    iconColor: '#3B82F6',
  })),
  formatearFechaYHora: jest.fn(() => ({
    fecha: '18 may 2026',
    hora: '10:00',
  })),
}));

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useFocusEffect } from '@react-navigation/native';
import { fetchRecordatoriosCalendario } from '../../src/services/recordatoriosService';
import CalendarioView from '../../src/screens/pacientes/calendario';

const getTextContent = (node) => {
  if (typeof node === 'string') return node;
  if (!node || !node.children) return '';
  return node.children.map(getTextContent).join('');
};

describe('Calendario screen', () => {
  let focusCallback;

  beforeEach(() => {
    jest.clearAllMocks();
    focusCallback = null;
    useFocusEffect.mockImplementation((callback) => {
      focusCallback = callback;
    });
  });

  const renderScreen = async () => {
    const navigation = { goBack: jest.fn() };
    let tree;
    await act(async () => {
      tree = renderer.create(<CalendarioView navigation={navigation} />);
    });
    await act(async () => {
      if (focusCallback) {
        await focusCallback();
      }
    });
    return tree;
  };

  // Verifica que se muestra estado vacio cuando no hay eventos en el dia.
  test('muestra estado vacio sin eventos', async () => {
    fetchRecordatoriosCalendario.mockResolvedValueOnce({ ok: true, data: [] });

    const tree = await renderScreen();
    const textNodes = tree.root.findAllByType('Text');

    expect(textNodes.some((node) => getTextContent(node).match(/No hay eventos este d\u00eda/i))).toBe(true);
  });

  // Verifica que se renderizan los eventos del dia seleccionado.
  test('muestra los eventos del dia cargado', async () => {
    fetchRecordatoriosCalendario.mockResolvedValueOnce({
      ok: true,
      data: [
        {
          id_recordatorio: 1,
          titulo: 'Tomar agua',
          tipo: 'Hidratacion',
          fecha_hora: '2026-05-18 10:00:00',
          fecha_ocurrencia: '2026-05-18',
          estado_calendario: 'cumplido',
        },
      ],
    });

    const tree = await renderScreen();
    const textNodes = tree.root.findAllByType('Text');

    expect(textNodes.some((node) => getTextContent(node).includes('Tomar agua'))).toBe(true);
  });
});
