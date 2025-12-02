/**
 * Configuración de variables de entorno
 * Mapea window.env a process.env para uso en tiempo de ejecución
 */

const getEnvVar = (key, defaultValue = null) => {
  // En tiempo de ejecución (producción), usar window.env si está disponible
  if (typeof window !== 'undefined' && window.env && window.env[key]) {
    return window.env[key];
  }
  // En tiempo de build (desarrollo), usar process.env
  return process.env[key] || defaultValue;
};

export const env = {
  REACT_APP_API_URL: getEnvVar('REACT_APP_API_URL', 'http://localhost:8080')
};

export default env;

