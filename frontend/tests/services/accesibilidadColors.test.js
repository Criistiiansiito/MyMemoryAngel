import {
  getAccesibilidadColors,
  getRecordatorioVisualConfig,
  getTiposRecordatorio,
} from '../../src/services/accesibilidadColors';

describe('accesibilidadColors service', () => {
  //Verifica que se devuelve la paleta clara por defecto.
  test('getAccesibilidadColors devuelve la paleta clara', () => {
    const colors = getAccesibilidadColors();

    expect(colors.background).toBe('#F0F5FA');
    expect(colors.text).toBe('#334155');
  });

  //Verifica que se devuelve la paleta oscura cuando se activa dark mode.
  test('getAccesibilidadColors devuelve la paleta oscura', () => {
    const colors = getAccesibilidadColors(true);

    expect(colors.background).toBe('#0F172A');
    expect(colors.text).toBe('#E5E7EB');
  });

  //Verifica que cada tipo de recordatorio usa la configuracion visual esperada.
  test('getRecordatorioVisualConfig resuelve el tipo medicacion', () => {
    expect(getRecordatorioVisualConfig('medicacion')).toEqual({
      icon: 'pill',
      color: '#DBEAFE',
      iconColor: '#3B82F6',
    });
  });

  //Verifica que los tipos desconocidos usan la configuracion visual por defecto.
  test('getRecordatorioVisualConfig usa fallback para tipos desconocidos', () => {
    expect(getRecordatorioVisualConfig('desconocido')).toEqual({
      icon: 'bell-outline',
      color: '#F1F5F9',
      iconColor: '#64748B',
    });
  });

  //Verifica que el listado de tipos de recordatorio mantiene todas las opciones visibles.
  test('getTiposRecordatorio devuelve seis tipos', () => {
    const tipos = getTiposRecordatorio(true);

    expect(tipos).toHaveLength(6);
    expect(tipos[0].id).toBe('Medicaci\u00f3n');
  });
});
