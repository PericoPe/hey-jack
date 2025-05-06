// Importar funciones de Supabase
import {
  createCommunity as supabaseCreateCommunity,
  joinCommunity as supabaseJoinCommunity,
  getCommunityDetails as supabaseGetCommunityDetails,
  getCommunityMembers as supabaseGetCommunityMembers,
  updateCommunityStatus as supabaseUpdateCommunityStatus,
  updateIndividualAmount as supabaseUpdateIndividualAmount,
  getUpcomingEvents as supabaseGetUpcomingEvents
} from './api-supabase';

// Configuración para modo simulado o Supabase
const USE_MOCK_DATA = false; // Usando Supabase como backend

/**
 * Crear una nueva comunidad
 * @param {Object} communityData - Datos de la comunidad
 * @returns {Promise} - Promesa con la respuesta
 */
export const createCommunity = async (communityData) => {
  try {
    // Si estamos usando datos simulados, devolver una respuesta exitosa
    if (USE_MOCK_DATA) {
      console.log('Simulando creación de comunidad con datos:', communityData);
      return {
        success: true,
        message: '¡Comunidad creada exitosamente!',
        communityId: communityData.communityId,
        communityName: `${communityData.institution} ${communityData.gradeLevel} ${communityData.division}`
      };
    }
    
    // Usar Supabase para crear la comunidad
    return await supabaseCreateCommunity(communityData);
  } catch (error) {
    console.error('Error al crear comunidad:', error);
    return {
      success: false,
      message: 'Error al crear comunidad: ' + error.toString()
    };
  }
};

/**
 * Unirse a una comunidad existente
 * @param {Object} memberData - Datos del miembro que se une
 * @returns {Promise} - Promesa con la respuesta
 */
export const joinCommunity = async (memberData) => {
  try {
    // Si estamos usando datos simulados, devolver una respuesta exitosa
    if (USE_MOCK_DATA) {
      console.log('Simulando unirse a comunidad con datos:', memberData);
      return {
        success: true,
        message: '¡Te has unido exitosamente a la comunidad!',
        communityName: 'Comunidad Simulada'
      };
    }
    
    // Usar Supabase para unirse a la comunidad
    return await supabaseJoinCommunity(memberData);
  } catch (error) {
    console.error('Error al unirse a la comunidad:', error);
    return {
      success: false,
      message: 'Error al unirse a la comunidad: ' + error.toString()
    };
  }
};

/**
 * Obtener detalles de una comunidad por su ID
 * @param {string} communityId - ID de la comunidad
 * @returns {Promise} - Promesa con la respuesta
 */
export const getCommunityDetails = async (communityId) => {
  try {
    console.log('Obteniendo detalles para comunidad con ID:', communityId);
    
    // Verificar si el ID está en formato antiguo o nuevo
    let institution, gradeLevel, division;
    
    // Formato con + (INSTITUCION+SALAoGRADO+DIVISION+TIMESTAMP)
    if (communityId.includes('+')) {
      const parts = communityId.split('+');
      if (parts.length >= 3) {
        institution = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        gradeLevel = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
        division = parts[2].charAt(0).toUpperCase() + parts[2].slice(1);
      }
    } 
    // Formato con _ (INSTITUCION+SALA+DIVISION_TIMESTAMP)
    else if (communityId.includes('_')) {
      const [namePart, timestamp] = communityId.split('_');
      
      // Intentar extraer las partes del nombre
      if (namePart.includes('sala')) {
        // Formato: institucionSalaXcolor
        const match = namePart.match(/([a-zA-Z]+)(sala\d+)([a-zA-Z]+)/);
        if (match) {
          institution = match[1].charAt(0).toUpperCase() + match[1].slice(1);
          gradeLevel = match[2].charAt(0).toUpperCase() + match[2].slice(1);
          division = match[3].charAt(0).toUpperCase() + match[3].slice(1);
        }
      } else {
        // Otro formato: intentar dividir por camelCase
        const parts = namePart.replace(/([A-Z])/g, ' $1').trim().split(' ');
        if (parts.length >= 2) {
          institution = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
          gradeLevel = parts.length > 1 ? parts[1] : '';
          division = parts.length > 2 ? parts[2] : '';
        }
      }
    }
    
    // Si estamos usando datos simulados, devolver datos simulados
    if (USE_MOCK_DATA) {
      console.log('Simulando obtención de detalles para comunidad:', communityId);
      
      if (institution && gradeLevel) {
        return {
          success: true,
          communityName: `${institution} - ${gradeLevel}${division ? ` - ${division}` : ''}`,
          institution: institution,
          gradeLevel: gradeLevel,
          division: division || '',
          contributionAmount: "1.500",
          status: 'activa',
          memberCount: Math.floor(Math.random() * 20) + 5 // Entre 5 y 25 miembros
        };
      }
      
      // Fallback para cualquier formato de ID
      return {
        success: true,
        communityName: `Comunidad ${communityId.substring(0, 10)}`,
        institution: 'Institución',
        gradeLevel: 'Grado',
        division: 'División',
        contributionAmount: "1.500",
        status: 'activa',
        memberCount: Math.floor(Math.random() * 20) + 5 // Entre 5 y 25 miembros
      };
    }
    
    // Usar Supabase para obtener detalles de la comunidad
    return await supabaseGetCommunityDetails(communityId);
  } catch (error) {
    console.error('Error al obtener detalles de comunidad:', error);
    return {
      success: false,
      message: 'Error al obtener detalles de comunidad: ' + error.toString()
    };
  }
};

/**
 * Obtener miembros de una comunidad
 * @param {string} communityId - ID de la comunidad
 * @returns {Promise} - Promesa con la respuesta
 */
export const getCommunityMembers = async (communityId) => {
  try {
    // Si estamos usando datos simulados, devolver una respuesta simulada
    if (USE_MOCK_DATA) {
      return {
        success: true,
        members: [
          {
            id: 1,
            nombre_padre: 'Creador Simulado',
            whatsapp_padre: '1122334455',
            email_padre: 'creador@ejemplo.com',
            perfil: 'creador',
            nombre_hijo: 'Hijo Simulado',
            cumple_hijo: '2020-01-01'
          }
        ]
      };
    }
    
    // Usar Supabase para obtener miembros de la comunidad
    return await supabaseGetCommunityMembers(communityId);
  } catch (error) {
    console.error('Error al obtener miembros de la comunidad:', error);
    return {
      success: false,
      message: 'Error al obtener miembros de la comunidad: ' + error.toString()
    };
  }
};

/**
 * Actualizar el estado de una comunidad
 * @param {string} communityId - ID de la comunidad
 * @param {string} estado - Nuevo estado (activa/inactiva)
 * @returns {Promise} - Promesa con la respuesta
 */
export const updateCommunityStatus = async (communityId, estado) => {
  try {
    // Si estamos usando datos simulados, devolver una respuesta simulada
    if (USE_MOCK_DATA) {
      return {
        success: true,
        message: 'Estado de la comunidad actualizado exitosamente'
      };
    }
    
    // Usar Supabase para actualizar el estado de la comunidad
    return await supabaseUpdateCommunityStatus(communityId, estado);
  } catch (error) {
    console.error('Error al actualizar estado de la comunidad:', error);
    return {
      success: false,
      message: 'Error al actualizar estado de la comunidad: ' + error.toString()
    };
  }
};

/**
 * Actualizar el monto individual de una comunidad
 * @param {string} communityId - ID de la comunidad
 * @param {number} montoIndividual - Nuevo monto individual
 * @returns {Promise} - Promesa con la respuesta
 */
export const updateIndividualAmount = async (communityId, montoIndividual) => {
  try {
    // Si estamos usando datos simulados, devolver una respuesta simulada
    if (USE_MOCK_DATA) {
      return {
        success: true,
        message: 'Monto individual actualizado exitosamente'
      };
    }
    
    // Usar Supabase para actualizar el monto individual
    return await supabaseUpdateIndividualAmount(communityId, montoIndividual);
  } catch (error) {
    console.error('Error al actualizar monto individual:', error);
    return {
      success: false,
      message: 'Error al actualizar monto individual: ' + error.toString()
    };
  }
};

/**
 * Obtener eventos próximos de una comunidad
 * @param {string} communityId - ID de la comunidad
 * @returns {Promise} - Promesa con la respuesta
 */
export const getUpcomingEvents = async (communityId) => {
  try {
    // Si estamos usando datos simulados, devolver una respuesta simulada
    if (USE_MOCK_DATA) {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      
      return {
        success: true,
        events: [
          {
            id: 1,
            id_comunidad: communityId,
            nombre_evento: 'Cumpleaños Simulado',
            fecha_evento: nextMonth.toISOString(),
            descripcion: 'Celebración de cumpleaños simulado',
            estado: 'pendiente'
          }
        ]
      };
    }
    
    // Usar Supabase para obtener eventos próximos
    return await supabaseGetUpcomingEvents(communityId);
  } catch (error) {
    console.error('Error al obtener eventos próximos:', error);
    return {
      success: false,
      message: 'Error al obtener eventos próximos: ' + error.toString()
    };
  }
};

export default {
  createCommunity,
  joinCommunity,
  getCommunityDetails,
  getCommunityMembers,
  updateCommunityStatus,
  updateIndividualAmount,
  getUpcomingEvents
};
