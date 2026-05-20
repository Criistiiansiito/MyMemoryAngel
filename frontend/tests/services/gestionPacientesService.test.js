const mockAuthCurrentUser = {
  getIdToken: jest.fn(),
};

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: mockAuthCurrentUser,
  })),
}));

import { gestionPacientesService } from '../../src/services/gestionPacientesService';

describe('gestionPacientesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    mockAuthCurrentUser.getIdToken.mockResolvedValue('firebase-token');
  });

  //Verifica que se listan los pacientes vinculados con autenticacion.
  test('listarMisPacientes hace fetch con token y devuelve el JSON', async () => {
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ ok: true, pacientes: [{ uid: 'p1' }] }),
    });

    const data = await gestionPacientesService.listarMisPacientes();

    expect(data).toEqual({ ok: true, pacientes: [{ uid: 'p1' }] });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/vinculaciones/mis-pacientes',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer firebase-token',
        },
      }
    );
  });

  //Verifica que el servicio devuelve un error controlado cuando no hay token.
  test('listarMisPacientes devuelve error controlado sin token', async () => {
    mockAuthCurrentUser.getIdToken.mockResolvedValueOnce(null);

    const data = await gestionPacientesService.listarMisPacientes();

    expect(data.ok).toBe(false);
    expect(data.error).toMatch(/token/i);
  });
});
