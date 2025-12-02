# Configuración para Producción - apertura.stsecurities.com.ar

Este documento describe cómo configurar la aplicación para funcionar con el dominio `apertura.stsecurities.com.ar`.

## Variables de Entorno

La aplicación utiliza la siguiente variable de entorno:

- **REACT_APP_API_URL**: URL del backend para todas las operaciones (autenticación, registro, validación, y apertura de cuenta)

## Configuración para Producción

### Opción 1: Generar env.js manualmente (Recomendado)

1. Ejecuta el script de generación:
```bash
node scripts/generate-env.js
```

2. Edita el script `scripts/generate-env.js` para ajustar las URLs del backend si es necesario.

### Opción 2: Crear env.js manualmente

Crea o edita el archivo `public/env.js` con el siguiente contenido:

```javascript
window.env = {
  "REACT_APP_API_URL": "https://api.stsecurities.com.ar"
};
```

**Nota**: Reemplaza las URLs con las correctas según tu configuración del backend.

### Opción 3: Variables de entorno en Azure Static Web Apps

Si estás usando Azure Static Web Apps, puedes configurar las variables de entorno en el portal de Azure:

1. Ve a tu recurso de Azure Static Web App
2. Navega a "Configuration" > "Application settings"
3. Agrega la siguiente variable:
   - `REACT_APP_API_URL` = `https://api.stsecurities.com.ar`

## Build para Producción

1. Genera el archivo `env.js` para producción:
```bash
node scripts/generate-env.js
```

2. Construye la aplicación:
```bash
npm run build
```

El directorio `build/` contendrá los archivos listos para desplegar.

## Verificación

Después del despliegue, verifica que:

1. El archivo `env.js` está accesible en `https://apertura.stsecurities.com.ar/env.js`
2. Las llamadas a la API están apuntando al backend correcto
3. El dominio está correctamente configurado en el servidor

## Dominio y DNS

Para configurar el dominio `apertura.stsecurities.com.ar`:

1. Configura los registros DNS apuntando al servidor de hosting
2. Si usas Azure Static Web Apps, configura el dominio personalizado en:
   - Azure Portal > Static Web App > Custom domains
3. Configura el certificado SSL para HTTPS

## Troubleshooting

### Las llamadas a la API fallan

- Verifica que las URLs en `env.js` sean correctas
- Verifica que el backend esté accesible desde el dominio de producción
- Verifica los CORS del backend para permitir el dominio `apertura.stsecurities.com.ar`

### El archivo env.js no se carga

- Verifica que el archivo esté en `public/env.js` antes del build
- Verifica que el archivo esté incluido en el build output
- Verifica la consola del navegador para errores de carga

