import { formatMadridDate, toMadridDateOnly } from '../../src/utils/dateMadrid';

describe('dateMadrid utils', () => {
  // Verifica que una fecha se normaliza al formato solo-fecha de Madrid.
  test('toMadridDateOnly devuelve YYYY-MM-DD', () => {
    expect(toMadridDateOnly('2026-05-18T10:00:00Z')).toBe('2026-05-18');
  });

  // Verifica que una fecha se formatea con las opciones recibidas.
  test('formatMadridDate aplica las opciones de formato', () => {
    expect(
      formatMadridDate('2026-05-18T10:00:00Z', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    ).toBe('18/05/2026');
  });
});
