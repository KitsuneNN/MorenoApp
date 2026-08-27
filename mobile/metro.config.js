const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
// Web: con `exports` habilitados, zustand resuelve por la condición `import`
// a ./esm/*.mjs, cuyo `import.meta` no es transformado y rompe el bundle web
// clásico de Expo ("Cannot use 'import.meta' outside a module"). Al incluir
// `react-native` y `require` en las condiciones, la entrada `react-native`
// (primera en el exports de zustand, CJS) gana en todas las plataformas.
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];
module.exports = withNativeWind(config, { input: './src/global.css' });
