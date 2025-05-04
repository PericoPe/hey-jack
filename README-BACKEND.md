# Backend Temporal con Google Sheets para Hey Jack

Este documento explica cómo está implementado el backend temporal con Google Sheets para la aplicación Hey Jack.

## Configuración del Backend

### Google Sheets

La aplicación utiliza una hoja de cálculo de Google como base de datos temporal con la siguiente estructura:

1. **Hoja "Comunidades"** (estática):
   - Fecha y Hora: Timestamp de creación
   - id_comunidad: ID único de la comunidad (INSTITUCION+SALAoGRADO+DIVISION+TIMESTAMP)
   - nombreComunidad: Nombre legible de la comunidad
   - id_creadorComunidad: ID del creador
   - creadorComunidadPadre: Nombre del padre/madre creador
   - creadorComunidadEmail: Email del creador
   - creadorComunidadWhatsapp: WhatsApp del creador
   - miembros: Contador de miembros
   - estado: Estado de la comunidad (activa/inactiva)

2. **Hojas Dinámicas** (una por comunidad):
   - Nombre de la hoja: ID de la comunidad (con caracteres especiales reemplazados)
   - Contiene información de todos los miembros de esa comunidad

3. **Hoja "Eventos"** (estática):
   - Registra los cumpleaños y eventos de cada comunidad
   - Se activan 15 días antes de la fecha del cumpleaños

### Google Apps Script

El código de Google Apps Script implementa las siguientes funcionalidades:

- **doGet**: Maneja solicitudes GET para obtener información
- **doPost**: Maneja solicitudes POST para crear/actualizar información
- **Funciones específicas**:
  - createCommunity: Crea una nueva comunidad
  - joinCommunity: Permite a un usuario unirse a una comunidad
  - getCommunityDetails: Obtiene detalles de una comunidad
  - getCommunityMembers: Obtiene la lista de miembros
  - updateCommunityStatus: Actualiza el estado de una comunidad
  - updateIndividualAmount: Actualiza el monto de contribución
  - createBirthdayEvents: Crea eventos para los cumpleaños
  - getUpcomingEvents: Obtiene eventos próximos

## Integración con el Frontend

El frontend se comunica con el backend a través de la API definida en `src/utils/api.js`, que contiene funciones para:

- Crear comunidades
- Unirse a comunidades
- Obtener detalles de comunidades
- Obtener miembros
- Actualizar estados y montos

## Configuración

Para configurar el backend:

1. Asegúrate de que la URL del script de Google Apps Script es correcta en `src/utils/api.js`
2. Verifica que el ID de la hoja de cálculo es correcto en el script de Google Apps Script
3. Asegúrate de que el script de Google Apps Script está desplegado como aplicación web con acceso para "Cualquier persona, incluso anónimo"

## Datos de Acceso

- **URL de la Hoja de Cálculo**: [https://docs.google.com/spreadsheets/d/1xDess3Sqv6RnkpHVJjrha10ue0ZjLWI9c-VD6hen0l8/edit?gid=0](https://docs.google.com/spreadsheets/d/1xDess3Sqv6RnkpHVJjrha10ue0ZjLWI9c-VD6hen0l8/edit?gid=0)
- **ID de Implementación**: AKfycbxMUlpSA-eP5vQCZd8Nq6nXN9yMO7e6kf9dNT_sNzBOgfvafb1dZ4HVPXt2_VN0WCE9xg
- **URL del Script**: [https://script.google.com/macros/s/AKfycbxMUlpSA-eP5vQCZd8Nq6nXN9yMO7e6kf9dNT_sNzBOgfvafb1dZ4HVPXt2_VN0WCE9xg/exec](https://script.google.com/macros/s/AKfycbxMUlpSA-eP5vQCZd8Nq6nXN9yMO7e6kf9dNT_sNzBOgfvafb1dZ4HVPXt2_VN0WCE9xg/exec)

## Instrucciones para el Script de Google Apps Script

El código completo para el script de Google Apps Script se encuentra en el archivo `src/utils/googleAppsScript.js`. Para implementarlo:

1. Abre la hoja de cálculo en Google Sheets
2. Ve a Extensiones > Apps Script
3. Copia y pega el contenido del archivo `googleAppsScript.js`
4. Guarda el script y despliégalo como aplicación web
5. Asegúrate de que la configuración de acceso es "Cualquier persona, incluso anónimo"

## Migración a Backend Definitivo

Cuando estés listo para migrar al backend definitivo con FastAPI y PostgreSQL:

1. Mantén la misma estructura de API en el backend definitivo
2. Actualiza solo la URL de la API en `src/utils/api.js`
3. El frontend seguirá funcionando sin cambios adicionales

## Notas Importantes

- Este backend temporal es adecuado para pruebas y desarrollo, pero para producción se recomienda migrar a FastAPI y PostgreSQL
- Los datos en Google Sheets tienen limitaciones en cuanto a concurrencia y volumen
- La autenticación es básica y debe mejorarse en el backend definitivo
