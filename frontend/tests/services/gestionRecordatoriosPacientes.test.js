jest.mock('axios', () => ({
  get: jest.fn(),
}));

import axios from 'axios';
import { gestionRecordatoriosPacientesService } from '../../src/services/gestionRecordatoriosPacientes';

describe('gestionRecordatoriosPacientesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //Verifica que listar recordatorios devuelve vacio si no se indica paciente.
  test('listarRecordatoriosPaciente falla de forma controlada sin pacienteId', async () => {
    const data = await gestionRecordatoriosPacientesService.listarRecordatoriosPaciente();

    expect(data).toEqual({ ok: false, recordatorios: [] });
    expect(axios.get).not.toHaveBeenCalled();
  });

  //Verifica que listar recordatorios devuelve los datos del backend.
  test('listarRecordatoriosPaciente devuelve los recordatorios del paciente', async () => {
    axios.get.mockResolvedValueOnce({
      data: { recordatorios: [{ id_recordatorio: 1, titulo: 'Tomar agua' }] },
    });

    const data = await gestionRecordatoriosPacientesService.listarRecordatoriosPaciente('p1');

    expect(data).toEqual({
      ok: true,
      recordatorios: [{ id_recordatorio: 1, titulo: 'Tomar agua' }],
    });
  });

  //Verifica que el historial del ultimo mes ordena por fecha descendente y hora ascendente.
  test('obtenerHistorialUltimoMesPaciente ordena el historial correctamente', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        recordatorios: [
          { titulo: 'B', fecha_ocurrencia: '2026-05-17', fecha_hora: '2026-05-17 10:00:00' },
          { titulo: 'A', fecha_ocurrencia: '2026-05-18', fecha_hora: '2026-05-18 12:00:00' },
          { titulo: 'C', fecha_ocurrencia: '2026-05-18', fecha_hora: '2026-05-18 09:00:00' },
        ],
      },
    });

    const data = await gestionRecordatoriosPacientesService.obtenerHistorialUltimoMesPaciente('p1');

    expect(data.ok).toBe(true);
    expect(data.historial.map((item) => item.titulo)).toEqual(['C', 'A', 'B']);
  });
});
