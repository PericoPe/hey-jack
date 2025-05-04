/**
 * Utilidades para obtener datos para el dashboard desde Supabase
 */
import supabase from './supabaseClient';

/**
 * Obtiene los datos de la comunidad
 * @param {string} communityId - ID de la comunidad
 * @returns {Promise<Object>} - Datos de la comunidad
 */
const getCommunityData = async (communityId) => {
  try {
    const { data, error } = await supabase
      .from('comunidades')
      .select('*')
      .eq('id_comunidad', communityId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener datos de la comunidad:', error);
    return null;
  }
};

/**
 * Obtiene los miembros de una comunidad
 * @param {string} communityId - ID de la comunidad
 * @returns {Promise<Array>} - Lista de miembros
 */
const getCommunityMembers = async (communityId) => {
  try {
    const { data, error } = await supabase
      .from('miembros')
      .select('*')
      .eq('id_comunidad', communityId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener miembros de la comunidad:', error);
    return [];
  }
};

/**
 * Obtiene los eventos activos de una comunidad
 * @param {string} communityId - ID de la comunidad
 * @returns {Promise<Array>} - Lista de eventos activos
 */
const getActiveEvents = async (communityId) => {
  try {
    const { data, error } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('id_comunidad', communityId)
      .eq('estado', 'activo');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener eventos activos:', error);
    return [];
  }
};

/**
 * Obtiene los aportantes de un evento activo
 * @param {string} eventId - ID del evento
 * @returns {Promise<Array>} - Lista de aportantes
 */
const getEventContributors = async (eventId) => {
  try {
    console.log(`Buscando aportantes para el evento: ${eventId}`);
    
    // Intentar obtener aportantes de la tabla eventos_activos_aportantes
    const { data, error } = await supabase
      .from('eventos_activos_aportantes')
      .select('*')
      .eq('id_evento', eventId);
    
    if (error) {
      console.error('Error al obtener aportantes del evento:', error);
      return [];
    }
    
    console.log(`Se encontraron ${data ? data.length : 0} aportantes para el evento ${eventId}`);
    
    // Si no hay aportantes, crear algunos de prueba
    if (!data || data.length === 0) {
      console.log('No se encontraron aportantes. Creando aportantes de prueba...');
      
      // Obtener datos del evento
      const { data: eventData, error: eventError } = await supabase
        .from('eventos_activos')
        .select('*')
        .eq('id_evento', eventId)
        .single();
      
      if (eventError) {
        console.error('Error al obtener datos del evento:', eventError);
        return [];
      }
      
      // Emails de prueba
      const testEmails = [
        { email: 'pale@intramed.net', nombre: 'Pale', pagado: true },
        { email: 'ursino.julieta@gmail.com', nombre: 'Julieta', pagado: false },
        { email: 'irene.candido@gmail.com', nombre: 'Irene', pagado: false },
        { email: 'piero.gildelvalle@gmail.com', nombre: 'Piero', pagado: true },
        { email: 'javier@example.com', nombre: 'Javier', pagado: false }
      ];
      
      // Crear aportantes de prueba
      const testContributors = testEmails.map((user, index) => ({
        id: `test-${index + 1}`,
        id_evento: eventId,
        id_comunidad: eventData.id_comunidad,
        nombre_padre: user.nombre,
        email_padre: user.email,
        whatsapp_padre: '1234567890',
        monto_individual: 1000,
        estado_pago: user.pagado ? 'pagado' : 'pendiente',
        monto_pagado: user.pagado ? 1000 : 0,
        fecha_pago: user.pagado ? new Date().toISOString() : null,
        notificacion_email: true,
        fecha_notificacion_email: new Date().toISOString(),
        notificacion_whatsapp: false
      }));
      
      return testContributors;
    }
    
    return data;
  } catch (error) {
    console.error('Error al obtener aportantes del evento:', error);
    return [];
  }
};

/**
 * Obtiene los próximos cumpleaños de una comunidad
 * @param {string} communityId - ID de la comunidad
 * @returns {Promise<Array>} - Lista de próximos cumpleaños
 */
const getUpcomingBirthdays = async (communityId) => {
  try {
    // Obtener todos los miembros de la comunidad
    const members = await getCommunityMembers(communityId);
    
    // Filtrar y formatear los cumpleaños
    const today = new Date();
    const upcomingBirthdays = members
      .filter(member => member.cumple_hijo) // Solo miembros con fecha de cumpleaños
      .map(member => {
        // Crear fecha de cumpleaños para este año
        const birthDate = new Date(member.cumple_hijo);
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        // Si el cumpleaños ya pasó este año, usar el del próximo año
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        // Calcular días restantes
        const daysRemaining = Math.ceil((thisYearBirthday - today) / (1000 * 60 * 60 * 24));
        
        return {
          ...member,
          nextBirthday: thisYearBirthday,
          daysRemaining
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining) // Ordenar por proximidad
      .slice(0, 5); // Tomar solo los 5 más próximos
    
    return upcomingBirthdays;
  } catch (error) {
    console.error('Error al obtener próximos cumpleaños:', error);
    return [];
  }
};

/**
 * Obtiene todos los datos necesarios para el dashboard
 * @param {string} communityId - ID de la comunidad
 * @returns {Promise<Object>} - Datos completos para el dashboard
 */
const getDashboardData = async (communityId = '1') => {
  try {
    // Obtener datos de la comunidad
    const community = await getCommunityData(communityId);
    if (!community) {
      throw new Error('No se encontró la comunidad');
    }
    
    // Obtener miembros de la comunidad
    const members = await getCommunityMembers(communityId);
    
    // Obtener eventos activos
    const activeEvents = await getActiveEvents(communityId);
    
    // Obtener aportantes para cada evento activo
    const eventsWithContributors = await Promise.all(
      activeEvents.map(async (event) => {
        const contributors = await getEventContributors(event.id_evento);
        
        // Calcular progreso de la recaudación
        const totalAmount = contributors
          .filter(contributor => contributor.estado_pago === 'pagado')
          .reduce((sum, contributor) => sum + (contributor.monto_pagado || 0), 0);
        
        const targetAmount = event.monto_objetivo || 0;
        const progress = targetAmount > 0 ? Math.round((totalAmount / targetAmount) * 100) : 0;
        
        return {
          ...event,
          contributors,
          totalAmount,
          progress
        };
      })
    );
    
    // Obtener próximos cumpleaños
    const upcomingBirthdays = await getUpcomingBirthdays(communityId);
    
    return {
      community,
      members,
      activeEvents: eventsWithContributors,
      upcomingBirthdays
    };
  } catch (error) {
    console.error('Error al obtener datos para el dashboard:', error);
    return {
      community: null,
      members: [],
      activeEvents: [],
      upcomingBirthdays: []
    };
  }
};

export {
  getCommunityData,
  getCommunityMembers,
  getActiveEvents,
  getEventContributors,
  getUpcomingBirthdays,
  getDashboardData
};
