import { getRandomBytes } from 'expo-crypto';

// UUID v4 (RFC 4122) construido sobre expo-crypto/getRandomBytes.
//
// Motivo: expo-crypto.randomUUID() delega en WebCrypto cuando corre en web, y
// crypto.randomUUID SOLO existe en contextos seguros (https o localhost). En el
// navegador del teléfono cargando la app por http://IP:8080 el objeto crypto
// existe pero sin randomUUID, lo que rompía la confirmación de ventas con
// "getCrypto(...) randomUUID is not a function". getRandomValues/getRandomBytes
// sí está disponible siempre: en nativo usa el módulo nativo de expo-crypto y
// en web (segura o no) usa crypto.getRandomValues. El formato de salida es
// idéntico al que producía randomUUID().
export function generateUuidV4(): string {
  const bytes = getRandomBytes(16);
  // RFC 4122: versión 4 en los bits 12-15 del octeto 6 y variante 10xx en los
  // bits 6-7 del octeto 8.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
