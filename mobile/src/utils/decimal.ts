import { Decimal as DecimalGlobal } from 'decimal.js';

// Instancia aislada: ninguna llamada a DecimalGlobal.set() desde otra parte de
// la aplicación o una dependencia puede modificar estas reglas comerciales.
const Decimal = DecimalGlobal.clone({
  precision: 28,
  rounding: DecimalGlobal.ROUND_HALF_UP,
});

export type DecimalInput = DecimalGlobal.Value;
export type AppDecimal = DecimalGlobal;

// Toda aritmética comercial de la app pasa por este módulo. Nunca usar Number
// ni operadores nativos para importes, stock o cantidades del carrito.
export function decimal(value: DecimalInput): AppDecimal {
  return new Decimal(value);
}

export function addDecimal(...values: DecimalInput[]): AppDecimal {
  return values.reduce<AppDecimal>((total, value) => total.plus(value), new Decimal(0));
}

export function subtractDecimal(left: DecimalInput, right: DecimalInput): AppDecimal {
  return decimal(left).minus(right);
}

export function multiplyDecimal(left: DecimalInput, right: DecimalInput): AppDecimal {
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
