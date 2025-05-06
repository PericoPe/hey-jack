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
    console.log('Obteniendo eventos activos para comunidad:', communityId);
    const { data, error } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('id_comunidad', communityId)
      .eq('estado', 'activo');
    
    if (error) throw error;
    
    // Procesar las fechas para asegurarnos de que se muestren correctamente
    const processedEvents = (data || []).map(event => {
      console.log('Evento activo encontrado:', event.id_evento, 'Fecha cumple:', event.fecha_cumple);
      return {
        ...event,
        // Asegurarnos de que las fechas sean objetos Date válidos
        fecha_cumple: event.fecha_cumple ? new Date(event.fecha_cumple) : null,
        fecha_evento: event.fecha_evento ? new Date(event.fecha_evento) : null,
        fecha_creacion: event.fecha_creacion ? new Date(event.fecha_creacion) : null
      };
    });
    
    return processedEvents;
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
    console.log('Fecha actual:', today.toISOString());
    
    // Crear un mapa para evitar duplicados, usando el nombre del hijo como clave
    const birthdayMap = new Map();
    
    // Primero procesamos los miembros (tienen prioridad para las fechas de cumpleaños)
    members.forEach(member => {
      if (!member.cumple_hijo || !member.nombre_hijo) return;
      
      try {
        // Normalizar la fecha (solo día y mes, sin hora)
        const birthDate = new Date(member.cumple_hijo);
        console.log(`Fecha original de ${member.nombre_hijo} desde miembro:`, member.cumple_hijo);
        
        // Verificar si la fecha es válida
        if (isNaN(birthDate.getTime())) {
          console.error(`Fecha inválida para ${member.nombre_hijo}:`, member.cumple_hijo);
          return;
        }
        
        // Crear fecha sin hora para comparaciones precisas
        const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        // Calcular días restantes
        let daysRemaining;
        if (birthdayThisYear < todayNoTime) {
          // Si ya pasó este año, calcular para el próximo año
          const birthdayNextYear = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
          daysRemaining = Math.floor((birthdayNextYear - todayNoTime) / (1000 * 60 * 60 * 24));
        } else {
          daysRemaining = Math.floor((birthdayThisYear - todayNoTime) / (1000 * 60 * 60 * 24));
        }
        
        console.log(`Días restantes para ${member.nombre_hijo} (desde miembro):`, daysRemaining);
        
        // Guardar en el mapa con fecha corregida para mostrar
        const currentYear = birthdayThisYear < todayNoTime ? today.getFullYear() + 1 : today.getFullYear();
        const correctedBirthDate = new Date(birthDate);
        
        // Mantener el año original para mostrar la edad correcta
        const birthYear = birthDate.getFullYear();
        
        birthdayMap.set(member.nombre_hijo.toLowerCase(), {
          ...member,
          cumple_hijo: member.cumple_hijo,  // Mantener fecha original
          cumple_hijo_original: birthDate.toISOString(),  // Guardar fecha original
          cumple_hijo_mostrar: birthDate.toISOString(),  // Fecha para mostrar con año original
          proximo_cumple: new Date(currentYear, birthDate.getMonth(), birthDate.getDate()).toISOString(),  // Próximo cumpleaños
          birth_year: birthYear,  // Año de nacimiento
          dias_restantes: daysRemaining
        });
      } catch (error) {
        console.error(`Error procesando fecha para ${member.nombre_hijo}:`, error);
      }
    });
    
    // Luego procesamos los eventos activos (solo para los que no tienen fecha en miembros)
    const { data: activeEvents, error: eventsError } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('id_comunidad', communityId)
      .eq('estado', 'activo');
      
    console.log('Eventos activos para cumpleaños:', activeEvents);
    
    // Añadir eventos activos que tienen fecha_cumple
    if (activeEvents && activeEvents.length > 0) {
      activeEvents.forEach(event => {
        if (!event.fecha_cumple || !event.nombre_hijo) return;
        
        // Si ya existe este miembro en el mapa (desde la tabla miembros), no lo sobrescribimos
        if (birthdayMap.has(event.nombre_hijo.toLowerCase())) {
          console.log(`${event.nombre_hijo} ya existe en el mapa desde miembros, no se sobrescribe con datos de eventos_activos`);
          return;
        }
        
        try {
          // Normalizar la fecha (solo día y mes, sin hora)
          const birthDate = new Date(event.fecha_cumple);
          console.log(`Fecha original de ${event.nombre_hijo} desde evento:`, event.fecha_cumple);
          
          // Verificar si la fecha es válida
          if (isNaN(birthDate.getTime())) {
            console.error(`Fecha inválida para ${event.nombre_hijo} desde evento:`, event.fecha_cumple);
            return;
          }
          
          // Crear fecha sin hora para comparaciones precisas
          const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
          
          // Calcular días restantes
          let daysRemaining;
          if (birthdayThisYear < todayNoTime) {
            // Si ya pasó este año, calcular para el próximo año
            const birthdayNextYear = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
            daysRemaining = Math.floor((birthdayNextYear - todayNoTime) / (1000 * 60 * 60 * 24));
          } else {
            daysRemaining = Math.floor((birthdayThisYear - todayNoTime) / (1000 * 60 * 60 * 24));
          }
          
          console.log(`Días restantes para ${event.nombre_hijo} (desde evento):`, daysRemaining);
          
          // Guardar en el mapa con fecha corregida para mostrar
          const currentYear = birthdayThisYear < todayNoTime ? today.getFullYear() + 1 : today.getFullYear();
          
          // Determinar el año de nacimiento (usar el año de la fecha o un año predeterminado)
          const birthYear = birthDate.getFullYear();
          
          birthdayMap.set(event.nombre_hijo.toLowerCase(), {
            id_miembro: event.id_evento,
            nombre_hijo: event.nombre_hijo,
            nombre_padre: event.nombre_padre,
            fecha_cumple: event.fecha_cumple,
            cumple_hijo: event.fecha_cumple,
            cumple_hijo_original: birthDate.toISOString(),
            cumple_hijo_mostrar: birthDate.toISOString(),
            proximo_cumple: new Date(currentYear, birthDate.getMonth(), birthDate.getDate()).toISOString(),
            birth_year: birthYear,
            dias_restantes: daysRemaining,
            from_event: true
          });
        } catch (error) {
          console.error(`Error procesando fecha para ${event.nombre_hijo} desde evento:`, error);
        }
      });
    }
    
    // Este bloque ya no es necesario porque procesamos los miembros primero
    
    // Convertir el mapa a array y ordenar
    const upcomingBirthdays = Array.from(birthdayMap.values())
      .sort((a, b) => a.dias_restantes - b.dias_restantes)
      .slice(0, 5); // Tomar solo los 5 más próximos
    
    console.log('Próximos cumpleaños (sin duplicados):', upcomingBirthdays);
    return upcomingBirthdays;
  } catch (error) {
    console.error('Error al obtener próximos cumpleaños:', error);
    return [];
  }
};

/**
 * Obtiene todas las comunidades a las que pertenece un usuario
 * @param {string} userEmail - Email del usuario
 * @returns {Promise<Array>} - Lista de comunidades
 */
const getUserCommunities = async (userEmail) => {
  try {
    console.log('Buscando comunidades para el usuario:', userEmail);
    
    // Verificar si el usuario es javierhrusino@gmail.com (administrador)
    const isAdmin = userEmail === 'javierhrusino@gmail.com';
    
    // Si es administrador, traer todas las comunidades
    if (isAdmin) {
      console.log('Usuario administrador detectado, trayendo todas las comunidades');
      const { data: allCommunities, error: allCommError } = await supabase
        .from('comunidades')
        .select('*');
      
      if (allCommError) {
        console.error('Error al obtener todas las comunidades:', allCommError);
        throw allCommError;
      }
      
      console.log('Comunidades encontradas para administrador:', allCommunities?.length || 0);
      return allCommunities || [];
    }
    
    // Para usuarios normales, primero verificamos si es creador de alguna comunidad
    const { data: createdCommunities, error: creatorError } = await supabase
      .from('comunidades')
      .select('*')
      .eq('creador_email', userEmail);
    
    if (creatorError) {
      console.error('Error al buscar comunidades creadas:', creatorError);
    }
    
    // Intentar obtener comunidades donde el usuario es miembro usando una consulta más simple
    try {
      // Buscar todos los id_comunidad donde el usuario es miembro
      const { data: memberRows, error: memberError } = await supabase
        .from('miembros')
        .select('id_comunidad')
        .eq('email_padre', userEmail);
      
      if (memberError) {
        console.error('Error al buscar membresías:', memberError);
        // Si hay error pero tenemos comunidades creadas, devolvemos esas
        if (createdCommunities && createdCommunities.length > 0) {
          return createdCommunities;
        }
        throw memberError;
      }
      
      console.log('Membresías encontradas:', memberRows);
      
      if (!memberRows || memberRows.length === 0) {
        // Si no es miembro pero es creador, devolver las comunidades creadas
        if (createdCommunities && createdCommunities.length > 0) {
          console.log('Usuario es creador de comunidades:', createdCommunities);
          return createdCommunities;
        }
        return [];
      }
      
      const communityIds = memberRows.map(m => m.id_comunidad);
      console.log('IDs de comunidades encontradas:', communityIds);
      
      // Traer datos de todas las comunidades donde es miembro
      const { data: memberCommunities, error: commError } = await supabase
        .from('comunidades')
        .select('*')
        .in('id_comunidad', communityIds);
      
      if (commError) {
        console.error('Error al obtener datos de comunidades:', commError);
        // Si hay error pero tenemos comunidades creadas, devolvemos esas
        if (createdCommunities && createdCommunities.length > 0) {
          return createdCommunities;
        }
        throw commError;
      }
      
      // Combinar comunidades creadas y donde es miembro, eliminando duplicados
      let allCommunities = memberCommunities || [];
      
      if (createdCommunities && createdCommunities.length > 0) {
        // Añadir comunidades creadas que no estén ya en la lista de miembro
        const memberIds = allCommunities.map(c => c.id_comunidad);
        
        createdCommunities.forEach(community => {
          if (!memberIds.includes(community.id_comunidad)) {
            allCommunities.push(community);
          }
        });
      }
      
      console.log('Total de comunidades encontradas:', allCommunities.length);
      return allCommunities;
    } catch (memberQueryError) {
      console.error('Error en consulta de miembros, intentando método alternativo:', memberQueryError);
      
      // Si falla la consulta anterior, intentamos con una consulta directa a la tabla comunidades
      // donde el usuario es creador (esto debería funcionar para la mayoría de los casos)
      if (createdCommunities && createdCommunities.length > 0) {
        console.log('Usando comunidades creadas como fallback:', createdCommunities);
        return createdCommunities;
      }
      
      // Si todo falla, devolvemos un array vacío
      return [];
    }
  } catch (error) {
    console.error('Error al obtener comunidades del usuario:', error);
    return [];
  }
};

/**
 * Obtiene todos los datos necesarios para el dashboard de un usuario (varias comunidades)
 * @param {string} userEmail - Email del usuario
 * @returns {Promise<Array>} - Lista de dashboards por comunidad
 */
const getDashboardData = async (userEmail) => {
  try {
    // Obtener todas las comunidades del usuario
    const communities = await getUserCommunities(userEmail);
    if (!communities || communities.length === 0) {
      return [];
    }
    // Para cada comunidad, obtener los datos completos
    const dashboards = await Promise.all(communities.map(async (community) => {
      const communityId = community.id_comunidad;
      const members = await getCommunityMembers(communityId);
      const activeEvents = await getActiveEvents(communityId);
      const eventsWithContributors = await Promise.all(
        activeEvents.map(async (event) => {
          const contributors = await getEventContributors(event.id_evento);
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
      const upcomingBirthdays = await getUpcomingBirthdays(communityId);
      return {
        community,
        members,
        activeEvents: eventsWithContributors,
        upcomingBirthdays
      };
    }));
    return dashboards;
  } catch (error) {
    console.error('Error al obtener datos para el dashboard:', error);
    return [];
  }
};

export {
  getCommunityData,
  getCommunityMembers,
  getActiveEvents,
  getEventContributors,
  getUpcomingBirthdays,
  getDashboardData,
  getUserCommunities
};
