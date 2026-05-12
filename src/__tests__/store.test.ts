import { getStore, subjectFromAuth } from '@/lib/store';

describe('subjectFromAuth', () => {
  it('debería retornar null cuando el header es null', () => {
    expect(subjectFromAuth(null)).toBe(null);
  });

  it('debería retornar null cuando el token tiene solo 2 partes', () => {
    expect(subjectFromAuth('Bearer abc.def')).toBe(null);
  });

  it('debería retornar el subject correcto desde un JWT válido', () => {
    const payload = Buffer.from(JSON.stringify({ sub: 'usuario@test.com' })).toString('base64');
    const token = `eyJhbGciOiJIUzI1NiJ9.${payload}.firma_falsa`;
    expect(subjectFromAuth(`Bearer ${token}`)).toBe('usuario@test.com');
  });

  it('debería retornar null cuando falta el prefijo Bearer', () => {
    const payload = Buffer.from(JSON.stringify({ sub: 'x@test.com' })).toString('base64');
    const token = `Token eyJhbGciOiJIUzI1NiJ9.${payload}.sig`;
    expect(subjectFromAuth(token)).toBe(null);
  });
});

describe('getStore', () => {
  it('debería inicializar exactamente 7 categorías por defecto', () => {
    const store = getStore('nuevo@usuario.com');
    expect(store.categories).toHaveLength(7);
  });

  it('debería iniciar nextTxId en 1', () => {
    const store = getStore('otro@usuario.com');
    expect(store.nextTxId).toBe(1);
  });

  it('debería devolver la misma instancia para el mismo subject', () => {
    const store1 = getStore('compartido@test.com');
    const store2 = getStore('compartido@test.com');
    expect(store1).toBe(store2);
  });

  it('debería inicializar las transacciones como array vacío', () => {
    const store = getStore('vacio@test.com');
    expect(store.transactions).toHaveLength(0);
  });

  it('debería asignar la primera categoría con icono 💼', () => {
    const store = getStore('iconos@test.com');
    expect(store.categories[0].icono).toBe('💼');
  });
});
