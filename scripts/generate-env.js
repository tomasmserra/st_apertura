#!/usr/bin/env node

/**
 * Script para generar el archivo env.js
 * Uso: node scripts/generate-env.js
 * 
 * Este script lee el archivo .env activo y genera public/env.js
 * con las variables de entorno necesarias para la aplicación.
 * 
 * Lee las variables de entorno desde:
 * 1. process.env (variables de entorno del sistema)
 * 2. .env (archivo de entorno activo)
 */

const fs = require('fs');
const path = require('path');

// Función para leer variables de entorno desde archivo .env
function parseEnvFile(filePath) {
  const env = {};
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Ignorar comentarios y líneas vacías
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const equalIndex = trimmedLine.indexOf('=');
        if (equalIndex > 0) {
          const key = trimmedLine.substring(0, equalIndex).trim();
          const value = trimmedLine.substring(equalIndex + 1).trim();
          // Remover comillas si existen
          env[key] = value.replace(/^["']|["']$/g, '');
        }
      }
    }
  }
  return env;
}

// Leer variables de entorno desde .env si existe
const envFilePath = path.join(__dirname, '..', '.env');
const envFromFile = parseEnvFile(envFilePath);

// Variables de entorno (prioridad: process.env > .env > defaults)
// Manejar valores vacíos correctamente (permitir cadena vacía para usar proxy)
let apiUrl = process.env.REACT_APP_API_URL;
if (apiUrl === undefined) {
  apiUrl = envFromFile.REACT_APP_API_URL;
}
if (apiUrl === undefined) {
  apiUrl = 'http://localhost:8080'; // Solo usar default si no está definido
}

const envConfig = {
  REACT_APP_API_URL: apiUrl
};

// Generar el contenido del archivo env.js
const envContent = `window.env = ${JSON.stringify(envConfig, null, 2)};
`;

// Escribir el archivo
const envPath = path.join(__dirname, '..', 'public', 'env.js');
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ Archivo env.js generado exitosamente en public/env.js');
console.log('📝 Configuración:');
console.log(JSON.stringify(envConfig, null, 2));

