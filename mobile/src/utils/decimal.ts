import { Decimal } from 'decimal.js';

// Toda aritmética comercial de la app pasa por este módulo. Nunca usar Number
// ni operadores nativos para importes, stock o cantidades del carrito.
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export type DecimalInput = Decimal.Value;

export function decimal(value: DecimalInput): Decimal {
  return new Decimal(value);
}

export function addDecimal(...values: DecimalInput[]): Decimal {
  return values.reduce<Decimal>((total, value) => total.plus(value), new Decimal(0));
}

export function subtractDecimal(left: DecimalInput, right: DecimalInput): Decimal {
  return decimal(left).minus(right);
}

export function multiplyDecimal(left: DecimalInput, right: DecimalInput): Decimal {
  return decimal(left).times(right);
}

export function compareDecimal(left: DecimalInput, right: DecimalInput): number {
  return decimal(left).cmp(right);
}

export function isIntegerDecimal(value: DecimalInput): boolean {
  return decimal(value).isInteger();
}

export function toMoney(value: DecimalInput): string {
  return decimal(value).toFixed(2);
}

export function toQuantity(value: DecimalInput): string {
  return decimal(value).toFixed(3);
}
