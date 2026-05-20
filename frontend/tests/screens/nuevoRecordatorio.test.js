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
  crearRecordatorio: jest.fn(),
}));

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import {
  crearRecordatorio,
  formatToMySQL,
} from '../../src/services/recordatoriosService';
import NuevoRecordatorio from '../../src/screens/common/nuevoRecordatorio';

const getTextContent = (node) => {
  if (typeof node === 'string') return node;
  if (!node || !node.children) return '';
  return node.children.map(getTextContent).join('');
};

const findTouchableByText = (tree, text) =>
  tree.root.findAllByType('TouchableOpacity').find((node) => getTextContent(node).includes(text));

describe('NuevoRecordatorio screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = async (route = undefined) => {
    const navigation = { goBack: jest.fn() };
    let tree;
    await act(async () => {
      tree = renderer.create(<NuevoRecordatorio navigation={navigation} route={route} />);
    });
    return { tree, navigation };
  };

  // Verifica que no se puede guardar un recordatorio sin titulo.
  test('muestra alerta si falta el titulo', async () => {
    const { tree } = await renderScreen();

    const saveButton = findTouchableByText(tree, 'Guardar Recordatorio');

    await act(async () => {
      saveButton.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Campos incompletos',
      'Por favor, escribe un t\u00edtulo para el recordatorio.'
    );
    expect(crearRecordatorio).not.toHaveBeenCalled();
  });

  // Verifica que guardar un recordatorio llama al servicio y vuelve atras.
  test('guarda el recordatorio y vuelve atras', async () => {
    const { tree, navigation } = await renderScreen();
    crearRecordatorio.mockResolvedValueOnce({ ok: true });

    const inputs = tree.root.findAllByType('TextInput');
    const saveButton = findTouchableByText(tree, 'Guardar Recordatorio');

    await act(async () => {
      inputs[0].props.onChangeText('Tomar agua');
      inputs[1].props.onChangeText('Despues de comer');
    });

    await act(async () => {
      saveButton.props.onPress();
    });

    expect(formatToMySQL).toHaveBeenCalled();
    expect(crearRecordatorio).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: 'Tomar agua',
        descripcion: 'Despues de comer',
        tipo: 'Medicaci\u00f3n',
        recurrencia: 'puntual',
        fecha_hora: '2026-05-18 10:00:00',
        tipo_alerta: 'sonora',
      })
    );
    expect(Alert.alert).toHaveBeenCalledWith(
      '\u00a1\u00c9xito!',
      'El recordatorio se ha guardado correctamente.'
    );
    expect(navigation.goBack).toHaveBeenCalled();
  });

  // Verifica que si llega un paciente por ruta se usa su uid al guardar.
  test('usa el paciente de la ruta como id_usuario', async () => {
    const { tree } = await renderScreen({ params: { paciente: { uid: 'paciente-1' } } });
    crearRecordatorio.mockResolvedValueOnce({ ok: true });

    const inputs = tree.root.findAllByType('TextInput');
    const saveButton = findTouchableByText(tree, 'Guardar Recordatorio');

    await act(async () => {
      inputs[0].props.onChangeText('Tomar agua');
    });

    await act(async () => {
      saveButton.props.onPress();
    });

    expect(crearRecordatorio).toHaveBeenCalledWith(
      expect.objectContaining({
        id_usuario: 'paciente-1',
      })
    );
  });
});
