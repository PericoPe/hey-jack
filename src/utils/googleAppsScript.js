/**
 * Hey Jack - Backend con Google Sheets
 * 
 * Este script maneja la lógica de backend para la aplicación Hey Jack
 * utilizando Google Sheets como base de datos temporal.
 */

// Configuración global
const SHEET_ID = '1xDess3Sqv6RnkpHVJjrha10ue0ZjLWI9c-VD6hen0l8';
const COMUNIDADES_SHEET_NAME = 'Comunidades';
const EVENTOS_SHEET_NAME = 'Eventos';

/**
 * Función doGet para manejar solicitudes GET
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    let result;

    switch (action) {
      case 'getCommunityDetails':
        result = getCommunityDetails(e.parameter.communityId);
        break;
      case 'getCommunityMembers':
        result = getCommunityMembers(e.parameter.communityId);
        break;
      case 'getUpcomingEvents':
        result = getUpcomingEvents(e.parameter.communityId);
        break;
      default:
        result = { success: false, error: 'Acción no válida' };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Función doPost para manejar solicitudes POST
 */
function doPost(e) {
  try {
    const action = e.parameter.action;
    const data = JSON.parse(e.postData.contents);
    let result;

    switch (action) {
      case 'createCommunity':
        result = createCommunity(data);
        break;
      case 'joinCommunity':
        result = joinCommunity(data);
        break;
      case 'updateCommunityStatus':
        result = updateCommunityStatus(data.communityId, data.estado);
        break;
      case 'updateIndividualAmount':
        result = updateIndividualAmount(data.communityId, data.montoIndividual);
        break;
      default:
        result = { success: false, error: 'Acción no válida' };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Crear una nueva comunidad
 */
function createCommunity(data) {
  try {
    // 1. Obtener la hoja de Comunidades
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const comunidadesSheet = ss.getSheetByName(COMUNIDADES_SHEET_NAME);
    
    // 2. Generar ID único para la comunidad
    const timestamp = new Date().getTime();
    const id_comunidad = data.communityId || `${data.institution}+${data.gradeLevel}+${data.division}+${timestamp}`;
    
    // 3. Formatear el nombre de la comunidad
    const nombreComunidad = `${data.institution} ${data.gradeLevel} ${data.division}`;
    
    // 4. Generar ID del creador
    const id_creadorComunidad = `${data.parentName.replace(/\\s+/g, '')}-${data.email}`;
    
    // 5. Preparar los datos para la hoja Comunidades
    const comunidadRow = [
      new Date(), // Fecha y Hora
      id_comunidad, // id_comunidad
      nombreComunidad, // nombreComunidad
      id_creadorComunidad, // id_creadorComunidad
      data.parentName, // creadorComunidadPadre
      data.email, // creadorComunidadEmail
      data.whatsapp, // creadorComunidadWhatsapp
      1, // miembros (comienza con 1, el creador)
      'activa' // estado
    ];
    
    // 6. Añadir la fila a la hoja Comunidades
    comunidadesSheet.appendRow(comunidadRow);
    
    // 7. Crear una nueva hoja para esta comunidad
    const nombreHojaComunidad = id_comunidad.replace(/[^a-zA-Z0-9]/g, '_');
    let comunidadSheet = ss.getSheetByName(nombreHojaComunidad);
    
    if (!comunidadSheet) {
      comunidadSheet = ss.insertSheet(nombreHojaComunidad);
      
      // Añadir encabezados
      const headers = [
        'Fecha y Hora',
        'id_NombrePadre',
        'NombrePadre',
        'WhatsappPadre',
        'EmailPadre',
        'AliasPadre',
        'HijoPadre',
        'CumpleHijoPadre',
        'perfil',
        'montoindividual$'
      ];
      
      comunidadSheet.appendRow(headers);
    }
    
    // 8. Añadir al creador como primer miembro
    const miembroRow = [
      new Date(), // Fecha y Hora
      id_creadorComunidad, // id_NombrePadre
      data.parentName, // NombrePadre
      data.whatsapp, // WhatsappPadre
      data.email, // EmailPadre
      data.mpAlias, // AliasPadre
      data.childName, // HijoPadre
      data.childBirthdate, // CumpleHijoPadre
      'creador', // perfil
      data.contributionAmount // montoindividual$
    ];
    
    comunidadSheet.appendRow(miembroRow);
    
    // 9. Crear eventos para los cumpleaños
    createBirthdayEvents(data.childName, data.childBirthdate, id_comunidad);
    
    return {
      success: true,
      message: '¡Comunidad creada exitosamente!',
      communityId: id_comunidad,
      communityName: nombreComunidad
    };
  } catch (error) {
    Logger.log('Error al crear comunidad: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Unirse a una comunidad existente
 */
function joinCommunity(data) {
  try {
    // 1. Obtener la hoja de Comunidades
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const comunidadesSheet = ss.getSheetByName(COMUNIDADES_SHEET_NAME);
    
    // 2. Buscar la comunidad por su ID
    const comunidadesData = comunidadesSheet.getDataRange().getValues();
    let comunidadRow = -1;
    let comunidadData = null;
    
    for (let i = 1; i < comunidadesData.length; i++) {
      if (comunidadesData[i][1] === data.communityId) {
        comunidadRow = i + 1; // +1 porque las filas en Sheets empiezan en 1
        comunidadData = comunidadesData[i];
        break;
      }
    }
    
    if (comunidadRow === -1) {
      return {
        success: false,
        error: 'Comunidad no encontrada'
      };
    }
    
    // 3. Verificar si la comunidad está activa
    if (comunidadData[8] !== 'activa') {
      return {
        success: false,
        error: 'Esta comunidad no está activa'
      };
    }
    
    // 4. Generar ID del miembro
    const id_miembro = `${data.parentName.replace(/\\s+/g, '')}-${data.email}`;
    
    // 5. Obtener la hoja específica de la comunidad
    const nombreHojaComunidad = data.communityId.replace(/[^a-zA-Z0-9]/g, '_');
    const comunidadSheet = ss.getSheetByName(nombreHojaComunidad);
    
    if (!comunidadSheet) {
      return {
        success: false,
        error: 'Hoja de comunidad no encontrada'
      };
    }
    
    // 6. Verificar si el miembro ya existe
    const miembrosData = comunidadSheet.getDataRange().getValues();
    for (let i = 1; i < miembrosData.length; i++) {
      if (miembrosData[i][1] === id_miembro) {
        return {
          success: false,
          error: 'Ya eres miembro de esta comunidad'
        };
      }
    }
    
    // 7. Añadir al nuevo miembro
    const miembroRow = [
      new Date(), // Fecha y Hora
      id_miembro, // id_NombrePadre
      data.parentName, // NombrePadre
      data.whatsapp, // WhatsappPadre
      data.email, // EmailPadre
      data.mpAlias, // AliasPadre
      data.childName, // HijoPadre
      data.childBirthdate, // CumpleHijoPadre
      'miembro', // perfil
      comunidadData[7] // montoindividual$ (se toma el valor actual de la comunidad)
    ];
    
    comunidadSheet.appendRow(miembroRow);
    
    // 8. Actualizar el contador de miembros en la hoja Comunidades
    const nuevoNumeroMiembros = miembrosData.length; // Ya incluye el nuevo miembro
    comunidadesSheet.getRange(comunidadRow, 8).setValue(nuevoNumeroMiembros);
    
    // 9. Crear eventos para los cumpleaños
    createBirthdayEvents(data.childName, data.childBirthdate, data.communityId);
    
    return {
      success: true,
      message: '¡Te has unido a la comunidad exitosamente!',
      communityName: comunidadData[2]
    };
  } catch (error) {
    Logger.log('Error al unirse a la comunidad: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Obtener detalles de una comunidad
 */
function getCommunityDetails(communityId) {
  try {
    // 1. Obtener la hoja de Comunidades
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const comunidadesSheet = ss.getSheetByName(COMUNIDADES_SHEET_NAME);
    
    // 2. Buscar la comunidad por su ID
    const comunidadesData = comunidadesSheet.getDataRange().getValues();
    let comunidadData = null;
    
    for (let i = 1; i < comunidadesData.length; i++) {
      if (comunidadesData[i][1] === communityId) {
        comunidadData = comunidadesData[i];
        break;
      }
    }
    
    if (!comunidadData) {
      return {
        success: false,
        error: 'Comunidad no encontrada'
      };
    }
    
    // 3. Formatear y devolver los datos
    return {
      success: true,
      data: {
        id: comunidadData[1],
        name: comunidadData[2],
        creatorId: comunidadData[3],
        creatorName: comunidadData[4],
        creatorEmail: comunidadData[5],
        creatorWhatsapp: comunidadData[6],
        members: comunidadData[7],
        status: comunidadData[8],
        createdAt: comunidadData[0]
      }
    };
  } catch (error) {
    Logger.log('Error al obtener detalles de la comunidad: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Obtener miembros de una comunidad
 */
function getCommunityMembers(communityId) {
  try {
    // 1. Obtener la hoja específica de la comunidad
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const nombreHojaComunidad = communityId.replace(/[^a-zA-Z0-9]/g, '_');
    const comunidadSheet = ss.getSheetByName(nombreHojaComunidad);
    
    if (!comunidadSheet) {
      return {
        success: false,
        error: 'Hoja de comunidad no encontrada'
      };
    }
    
    // 2. Obtener los datos de los miembros
    const miembrosData = comunidadSheet.getDataRange().getValues();
    const headers = miembrosData[0];
    const members = [];
    
    for (let i = 1; i < miembrosData.length; i++) {
      const member = {};
      for (let j = 0; j < headers.length; j++) {
        member[headers[j]] = miembrosData[i][j];
      }
      members.push(member);
    }
    
    return {
      success: true,
      data: members
    };
  } catch (error) {
    Logger.log('Error al obtener miembros de la comunidad: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Actualizar el estado de una comunidad
 */
function updateCommunityStatus(communityId, estado) {
  try {
    // 1. Obtener la hoja de Comunidades
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const comunidadesSheet = ss.getSheetByName(COMUNIDADES_SHEET_NAME);
    
    // 2. Buscar la comunidad por su ID
    const comunidadesData = comunidadesSheet.getDataRange().getValues();
    let comunidadRow = -1;
    
    for (let i = 1; i < comunidadesData.length; i++) {
      if (comunidadesData[i][1] === communityId) {
        comunidadRow = i + 1; // +1 porque las filas en Sheets empiezan en 1
        break;
      }
    }
    
    if (comunidadRow === -1) {
      return {
        success: false,
        error: 'Comunidad no encontrada'
      };
    }
    
    // 3. Actualizar el estado
    comunidadesSheet.getRange(comunidadRow, 9).setValue(estado);
    
    return {
      success: true,
      message: `Estado de la comunidad actualizado a: ${estado}`
    };
  } catch (error) {
    Logger.log('Error al actualizar estado de la comunidad: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Actualizar el monto individual de una comunidad
 */
function updateIndividualAmount(communityId, montoIndividual) {
  try {
    // 1. Obtener la hoja específica de la comunidad
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const nombreHojaComunidad = communityId.replace(/[^a-zA-Z0-9]/g, '_');
    const comunidadSheet = ss.getSheetByName(nombreHojaComunidad);
    
    if (!comunidadSheet) {
      return {
        success: false,
        error: 'Hoja de comunidad no encontrada'
      };
    }
    
    // 2. Actualizar el monto individual para todos los miembros
    const miembrosData = comunidadSheet.getDataRange().getValues();
    const montoColumn = miembrosData[0].indexOf('montoindividual$') + 1;
    
    if (montoColumn === 0) {
      return {
        success: false,
        error: 'Columna de monto individual no encontrada'
      };
    }
    
    // 3. Actualizar el monto para todos los miembros
    for (let i = 2; i <= miembrosData.length; i++) {
      comunidadSheet.getRange(i, montoColumn).setValue(montoIndividual);
    }
    
    return {
      success: true,
      message: `Monto individual actualizado a: ${montoIndividual}`
    };
  } catch (error) {
    Logger.log('Error al actualizar monto individual: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Crear eventos para los cumpleaños
 */
function createBirthdayEvents(childName, birthdate, communityId) {
  try {
    // 1. Obtener la hoja de Eventos
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const eventosSheet = ss.getSheetByName(EVENTOS_SHEET_NAME);
    
    // 2. Convertir la fecha de cumpleaños a objeto Date
    let birthdateObj;
    if (typeof birthdate === 'string') {
      // Convertir string a Date
      const parts = birthdate.split('/');
      birthdateObj = new Date(parts[2], parts[1] - 1, parts[0]);
    } else if (birthdate instanceof Date) {
      birthdateObj = birthdate;
    } else {
      throw new Error('Formato de fecha inválido');
    }
    
    // 3. Calcular la fecha del próximo cumpleaños
    const today = new Date();
    const nextBirthday = new Date(today.getFullYear(), birthdateObj.getMonth(), birthdateObj.getDate());
    
    // Si el cumpleaños ya pasó este año, calcular para el próximo año
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    // 4. Calcular la fecha de notificación (15 días antes)
    const notificationDate = new Date(nextBirthday);
    notificationDate.setDate(notificationDate.getDate() - 15);
    
    // 5. Generar ID único para el evento
    const eventId = `${communityId}-${childName}-${nextBirthday.getFullYear()}`;
    
    // 6. Verificar si el evento ya existe
    const eventosData = eventosSheet.getDataRange().getValues();
    for (let i = 1; i < eventosData.length; i++) {
      if (eventosData[i][1] === eventId) {
        // El evento ya existe, no es necesario crearlo de nuevo
        return;
      }
    }
    
    // 7. Añadir el evento
    const eventoRow = [
      new Date(), // Fecha y Hora de creación
      eventId, // id_evento
      communityId, // id_comunidad
      childName, // nombre del niño
      nextBirthday, // fecha del cumpleaños
      notificationDate, // fecha de notificación
      'pendiente' // estado
    ];
    
    eventosSheet.appendRow(eventoRow);
    
  } catch (error) {
    Logger.log('Error al crear evento de cumpleaños: ' + error);
    // No lanzamos error aquí para que no afecte al flujo principal
  }
}

/**
 * Obtener eventos próximos de una comunidad
 */
function getUpcomingEvents(communityId) {
  try {
    // 1. Obtener la hoja de Eventos
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const eventosSheet = ss.getSheetByName(EVENTOS_SHEET_NAME);
    
    // 2. Buscar eventos para esta comunidad
    const eventosData = eventosSheet.getDataRange().getValues();
    const headers = eventosData[0];
    const events = [];
    const today = new Date();
    
    for (let i = 1; i < eventosData.length; i++) {
      if (eventosData[i][2] === communityId) {
        const notificationDate = eventosData[i][5];
        
        // Solo incluir eventos cuya fecha de notificación ya haya llegado o esté próxima (en los próximos 30 días)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        
        if (notificationDate <= thirtyDaysFromNow) {
          const event = {};
          for (let j = 0; j < headers.length; j++) {
            event[headers[j]] = eventosData[i][j];
          }
          events.push(event);
        }
      }
    }
    
    return {
      success: true,
      data: events
    };
  } catch (error) {
    Logger.log('Error al obtener eventos próximos: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}
