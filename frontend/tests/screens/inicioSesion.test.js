jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}), { virtual: true });

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
}));

jest.mock('axios', () => ({
  get: jest.fn(),
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
    TextInput: createHost('TextInput'),
    TouchableOpacity: createHost('TouchableOpacity'),
    ActivityIndicator: createHost('ActivityIndicator'),
    ScrollView: createHost('ScrollView'),
    Platform: { OS: 'web' },
  };
});

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
}));

jest.mock('../../src/services/firebase', () => ({
  auth: {},
}));

jest.mock('../../src/services/notificacionesService', () => ({
  registrarDispositivoParaNotificaciones: jest.fn(),
}));

jest.mock('../../src/style/styles', () => ({
  getStyles: jest.fn(() => ({
    container: {},
    contentPadding: {},
    message: {},
    label: {},
    inputContainer: {},
    inputIcon: {},
    input: {},
    loginLink: {},
    loginText: {},
    mainButton: { backgroundColor: '#1A202C' },
    mainButtonText: {},
  })),
}));

jest.mock('../../src/services/accesibilidadContext', () => ({
  useAccesibilidad: jest.fn(() => ({
    aplicarEscala: (value) => value,
  })),
}));

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { registrarDispositivoParaNotificaciones } from '../../src/services/notificacionesService';
import InicioSesion from '../../src/screens/auth/inicioSesion';

const getTextContent = (node) => {
  if (typeof node === 'string') return node;
  if (!node || !node.children) return '';
  return node.children.map(getTextContent).join('');
};

describe('InicioSesion screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.localStorage.getItem = jest.fn();
    global.localStorage.setItem = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const renderScreen = async () => {
    const navigation = {
      navigate: jest.fn(),
      replace: jest.fn(),
    };

    let tree;
    await act(async () => {
      tree = renderer.create(<InicioSesion navigation={navigation} />);
    });
    return { tree, navigation };
  };

  // Verifica que se muestra un error de validacion si faltan email o contrasena.
  test('muestra mensaje si faltan credenciales', async () => {
    const { tree } = await renderScreen();

    const buttons = tree.root.findAllByType('TouchableOpacity');

    await act(async () => {
      buttons[2].props.onPress();
    });

    const textNodes = tree.root.findAllByType('Text');
    expect(textNodes.some((node) => getTextContent(node).match(/Rellena email/i))).toBe(true);
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  // Verifica que un inicio de sesion correcto guarda datos y navega al dashboard del paciente.
  test('inicia sesion y navega al dashboard del paciente', async () => {
    const { tree, navigation } = await renderScreen();

    signInWithEmailAndPassword.mockResolvedValueOnce({
      user: { getIdToken: jest.fn().mockResolvedValue('firebase-token') },
    });
    registrarDispositivoParaNotificaciones.mockResolvedValueOnce('ExponentPushToken[token]');
    axios.get.mockResolvedValueOnce({
      data: { usuario: { uid: 'u1', tipo_usuario: 'paciente', nombre: 'Ana' } },
    });

    const inputs = tree.root.findAllByType('TextInput');
    const buttons = tree.root.findAllByType('TouchableOpacity');

    await act(async () => {
      inputs[0].props.onChangeText('ana@test.com');
      inputs[1].props.onChangeText('123456');
    });

    await act(async () => {
      buttons[2].props.onPress();
    });

    expect(signInWithEmailAndPassword).toHaveBeenCalled();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify({ uid: 'u1', tipo_usuario: 'paciente', nombre: 'Ana' })
    );
    expect(global.localStorage.setItem).toHaveBeenCalledWith('userToken', 'firebase-token');
    expect(registrarDispositivoParaNotificaciones).toHaveBeenCalledWith('firebase-token');

    act(() => {
      jest.advanceTimersByTime(800);
    });

    expect(navigation.replace).toHaveBeenCalledWith('DashboardPaciente');
  });

  // Verifica que un error de autenticacion muestra el mensaje correspondiente.
  test('muestra error amigable con credenciales invalidas', async () => {
    const { tree } = await renderScreen();

    signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/invalid-credential' });

    const inputs = tree.root.findAllByType('TextInput');
    const buttons = tree.root.findAllByType('TouchableOpacity');

    await act(async () => {
      inputs[0].props.onChangeText('ana@test.com');
      inputs[1].props.onChangeText('mal');
    });

    await act(async () => {
      buttons[2].props.onPress();
    });

    const textNodes = tree.root.findAllByType('Text');
    expect(
      textNodes.some((node) => getTextContent(node).match(/Credenciales incorrectas/i))
    ).toBe(true);
  });
});
