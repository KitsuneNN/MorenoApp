import { describe, expect, it } from 'vitest';

import { formatSaleDateTime } from '@/utils/datetime';

describe('formatSaleDateTime', () => {
  it('formatea fecha y hora en hora local (entrada sin offset: se interpreta como local)', () => {
    // Sin sufijo Z u offset, la spec de ECMAScript interpreta la cadena como
    // hora local del dispositivo: el resultado es igual en cualquier zona.
    expect(formatSaleDateTime('2026-08-26T14:05:00')).toBe('26/08/2026 · 14:05');
  });

  it('completa con ceros día, mes, hora y minutos', () => {
    expect(formatSaleDateTime('2026-01-05T09:03:00')).toBe('05/01/2026 · 09:03');
  });

  it('acepta timestamps con offset Z y devuelve el formato esperado', () => {
    // La hora exacta depende de la zona horaria del runner; acá validamos que
    // la conversión a hora local produzca siempre el mismo formato de salida.
    expect(formatSaleDateTime('2026-08-26T14:05:00Z')).toMatch(/^\d{2}\/\d{2}\/\d{4} · \d{2}:\d{2}$/);
  });

  it('devuelve un guión para entradas inválidas', () => {
    expect(formatSaleDateTime('no-es-una-fecha')).toBe('—');
    expect(formatSaleDateTime('')).toBe('—');
  });
});
