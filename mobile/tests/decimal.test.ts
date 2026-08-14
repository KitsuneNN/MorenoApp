import { Decimal as DecimalGlobal } from 'decimal.js';
import { afterEach, describe, expect, it } from 'vitest';

import { toMoney } from '@/utils/decimal';

const originalConfig = { precision: DecimalGlobal.precision, rounding: DecimalGlobal.rounding };

afterEach(() => {
  DecimalGlobal.set(originalConfig);
});

describe('commercial Decimal instance', () => {
  it('keeps its configured rounding when the package global is changed elsewhere', () => {
    DecimalGlobal.set({ rounding: DecimalGlobal.ROUND_DOWN });
    expect(toMoney('1.005')).toBe('1.01');
  });
});
