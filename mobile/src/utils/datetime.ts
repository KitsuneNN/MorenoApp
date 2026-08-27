// Formateo de fechas para la UI de ventas. Se usa Date con getters locales
// para respetar la zona horaria del dispositivo (el backend envía timestamps
// con offset). Sin Intl: salida predecible en cualquier dispositivo.
const pad2 = (value: number) => String(value).padStart(2, '0');

export function formatSaleDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const day = pad2(date.getDate());
  const month = pad2(date.getMonth() + 1);
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  return `${day}/${month}/${date.getFullYear()} · ${hours}:${minutes}`;
}
