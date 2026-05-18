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
    TextInput: createHost('TextInput'),
    TouchableOpacity: createHost('TouchableOpacity'),
    ScrollView: createHost('ScrollView'),
    Switch: createHost('Switch'),
    ActivityIndicator: createHost('ActivityIndicator'),
    StatusBar: createHost('StatusBar'),
    Platform: { OS: 'web' },
    Alert: { alert: jest.fn() },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

jest.mock('../../src/style/styles', () => ({
  getStyles: jest.fn(() => ({
    container: {},
    topBar: {},
    topBarArrow: {},
    brandName: {},
    scrollContent: {},
    label: {},
    inputContainer: {},
    input: {},
    gridRecordatorios: {},
    cardTipoRecordatorio: {},
    iconoTipoCirculo: {},
    textoTipo: {},
    optionButton: {},
    optionButtonActive: {},
    optionText: {},
    optionTextActive: {},
    settingsCard: {},
    mainButton: {},
    mainButtonText: {},
    btnDangerOutline: {},
  })),
}));

jest.mock('../../src/services/accesibilidadContext', () => ({
  useAccesibilidad: jest.fn(() => ({
    aplicarEscala: (value) => value,
    isDarkMode: false,
  })),
}));

jest.mock('../../src/services/accesibilidadColors', () => ({
  getAccesibilidadColors: jest.fn(() => ({
    primary: '#334155',
    primarySoft: '#F0F5FF',
  })),
}));

jest.mock('../../src/services/recordatoriosService', () => ({
  getTiposRecordatorioConfig: jest.fn(() => ([
    { id: 'Medicaci\u00f3n', icon: 'pill', iconColor: '#3B82F6' },
    { id: 'Tarea', icon: 'checkbox-marked-outline', iconColor: '#A855F7' },
  ])),
  formatToMySQL: jest.fn(() => '2026-05-18 10:00:00'),
  parseMySQLDateTime: jest.fn(() => new Date('2026-05-18T08:00:00Z')),
  actualizarRecordatorio: jest.fn(),
  eliminarRecordatorio: jest.fn(),
}));

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import {
  actualizarRecordatorio,
  eliminarRecordatorio,
} from '../../src/services/recordatoriosService';
import ModificarRecordatorio from '../../src/screens/common/modificarRecordatorio';

const getNodeText = (node) => {
  if (typeof node === 'string') return node;
  if (!node || !node.children) return '';
  return node.children.map(getNodeText).join('');
};

const findTouchableByText = (tree, text) =>
  tree.root.findAllByType('TouchableOpacity').find((node) => getNodeText(node).includes(text));

describe('ModificarRecordatorio screen', () => {
  const recordatorio = {
    id_recordatorio: 10,
    titulo: 'Tomar agua',
    descripcion: 'Despues de comer',
    tipo: 'Medicaci\u00f3n',
    recurrencia: 'puntual',
    tipo_alerta: 'sonora',
    fecha_hora: '2026-05-18 10:00:00',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = async () => {
    const navigation = { goBack: jest.fn() };
    let tree;
    await act(async () => {
      tree = renderer.create(
        <ModificarRecordatorio navigation={navigation} route={{ params: { recordatorio } }} />
      );
    });
    return { tree, navigation };
  };

  // Verifica que no se puede guardar si el titulo queda vacio.
  test('muestra error si el titulo es vacio', async () => {
    const { tree } = await renderScreen();
    const inputs = tree.root.findAllByType('TextInput');
    const saveButton = findTouchableByText(tree, 'Guardar cambios');

    await act(async () => {
      inputs[0].props.onChangeText('   ');
    });

    await act(async () => {
      saveButton.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'El t\u00edtulo es obligatorio');
  });

  // Verifica que guardar cambios actualiza el recordatorio y vuelve atras.
  test('actualiza el recordatorio y navega atras', async () => {
    const { tree, navigation } = await renderScreen();
    const saveButton = findTouchableByText(tree, 'Guardar cambios');
    actualizarRecordatorio.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      saveButton.props.onPress();
    });

    expect(actualizarRecordatorio).toHaveBeenCalledWith(
      10,
      expect.objectContaining({
        titulo: 'Tomar agua',
        descripcion: 'Despues de comer',
        tipo: 'Medicaci\u00f3n',
        recurrencia: 'puntual',
        tipo_alerta: 'sonora',
      })
    );
    expect(navigation.goBack).toHaveBeenCalled();
  });

  // Verifica que eliminar el recordatorio confirma y borra correctamente.
  test('elimina el recordatorio tras confirmar', async () => {
    const { tree, navigation } = await renderScreen();
    const deleteButton = findTouchableByText(tree, 'Eliminar recordatorio');
    eliminarRecordatorio.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      deleteButton.props.onPress();
    });

    const alertArgs = Alert.alert.mock.calls[0];
    const confirmAction = alertArgs[2][1];

    await act(async () => {
      await confirmAction.onPress();
    });

    expect(eliminarRecordatorio).toHaveBeenCalledWith(10);
    expect(navigation.goBack).toHaveBeenCalled();
  });
});
