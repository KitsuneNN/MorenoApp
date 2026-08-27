import { describe, expect, it, vi } from 'vitest';

import { generateUuidV4 } from '@/utils/uuid';

// expo-crypto no se puede importar en Node (módulo nativo): se mockea con la
// única API que usa nuestro generador.
const getRandomBytes = vi.hoisted(() => vi.fn((length: number) => new Uint8Array(length)));

vi.mock('expo-crypto', () => ({ getRandomBytes }));

function withBytes(bytes: number[]) {
  getRandomBytes.mockImplementation(() => Uint8Array.from(bytes));
}

describe('generateUuidV4', () => {
  it('pide exactamente 16 bytes aleatorios', () => {
    withBytes(Array.from({ length: 16 }, (_, index) => index));
    generateUuidV4();
    expect(getRandomBytes).toHaveBeenCalledWith(16);
  });

  it('formatea 8-4-4-4-12 en hexadecimal minúscula', () => {
    withBytes(Array.from({ length: 16 }, (_, index) => index));
    expect(generateUuidV4()).toBe('00010203-0405-4607-8809-0a0b0c0d0e0f');
  });

  it('establece versión 4 incluso si el byte crudo ya tiene otros bits', () => {
    withBytes(Array.from({ length: 16 }, () => 0xff));
    // 0xff & 0x0f | 0x40 = 0x4f y 0xff & 0x3f | 0x80 = 0xbf
    expect(generateUuidV4()).toBe('ffffffff-ffff-4fff-bfff-ffffffffffff');
  });

  it('con bytes en cero produce el v4 canónico', () => {
    withBytes(Array.from({ length: 16 }, () => 0x00));
    expect(generateUuidV4()).toBe('00000000-0000-4000-8000-000000000000');
  });

  it('cumple el patrón RFC 4122 versión 4 y refleja los bytes recibidos', () => {
    withBytes(Array.from({ length: 16 }, (_, index) => (index * 17 + 3) % 256));
    const uuid = generateUuidV4();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('bytes distintos generan UUIDs distintos', () => {
    withBytes(Array.from({ length: 16 }, (_, index) => index));
    const first = generateUuidV4();
    withBytes(Array.from({ length: 16 }, (_, index) => 255 - index));
    const second = generateUuidV4();
    expect(first).not.toBe(second);
  });
});
