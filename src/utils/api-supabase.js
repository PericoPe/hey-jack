import supabase from './supabaseClient';

/**
 * Crear una nueva comunidad
 * @param {Object} communityData - Datos de la comunidad
 * @returns {Promise} - Promesa con la respuesta
 */
export const createCommunity = async (communityData) => {
  try {
    // Generar ID único para la comunidad si no existe
    let id_comunidad = communityData.communityId;
    if (!id_comunidad) {
      const nombreComunidad = `${communityData.institution}+${communityData.gradeLevel}+${communityData.division}`;
      const randomNum = Math.floor(100000 + Math.random() * 900000); // Número de 6 dígitos
      id_comunidad = (nombreComunidad + '+' + randomNum).toLowerCase().replace(/\s+/g, '');
    }
    
    // Preparar datos para la comunidad
    const nombreComunidad = `${communityData.institution} ${communityData.gradeLevel} ${communityData.division}`;
    
    // Insertar la comunidad en Supabase
    console.log('Intentando crear comunidad con datos:', {
      id_comunidad,
      nombre_comunidad: nombreComunidad,
      institucion: communityData.institution,
      grado: communityData.gradeLevel,
      division: communityData.division,
      creador_nombre: communityData.parentName,
      creador_email: communityData.email,
      creador_whatsapp: communityData.whatsapp,
      monto_individual: communityData.contributionAmount
    });
    
    const { data: community, error: communityError } = await supabase
      .from('comunidades')
      .insert([
        {
          id_comunidad: id_comunidad,
          nombre_comunidad: nombreComunidad,
          institucion: communityData.institution,
          grado: communityData.gradeLevel,
          division: communityData.division,
          creador_nombre: communityData.parentName,
          creador_email: communityData.email,
          creador_whatsapp: communityData.whatsapp,
          miembros: 1,
          estado: 'activa',
          monto_individual: communityData.contributionAmount
        }
      ])
      .select();
      
    if (community) {
      console.log('Comunidad creada exitosamente:', community);
    }
    
    if (communityError) throw communityError;
    
    // Insertar al creador como primer miembro
    console.log('Intentando registrar miembro creador con datos:', {
      id_comunidad,
      id_nombre_padre: communityData.parentName,
      nombre_padre: communityData.parentName,
      whatsapp_padre: communityData.whatsapp,
      email_padre: communityData.email,
      alias_mp: communityData.mercadoPagoAlias,
      nombre_hijo: communityData.childName,
      cumple_hijo: communityData.childBirthdate,
      perfil: 'creador',
      monto_individual: communityData.contributionAmount
    });
    
    const { data: member, error: memberError } = await supabase
      .from('miembros')
      .insert([
        {
          id_comunidad: id_comunidad,
          id_nombre_padre: communityData.parentName,
          nombre_padre: communityData.parentName,
          whatsapp_padre: communityData.whatsapp,
          email_padre: communityData.email,
          alias_mp: communityData.mercadoPagoAlias,
          nombre_hijo: communityData.childName,
          cumple_hijo: communityData.childBirthdate,
          perfil: 'creador',
          monto_individual: communityData.contributionAmount
        }
      ])
      .select();
      
    if (member) {
      console.log('Miembro creador registrado exitosamente:', member);
    }
    
    if (memberError) throw memberError;
    
    // Crear evento para el cumpleaños
    await createBirthdayEvent(communityData.childName, communityData.childBirthdate, id_comunidad);
    
    return {
      success: true,
      message: '¡Comunidad creada exitosamente!',
      communityId: id_comunidad,
      communityName: nombreComunidad
    };
  } catch (error) {
    console.error('Error al crear comunidad:', error);
    return {
      success: false,
      message: 'Error al crear comunidad: ' + error.message
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
    // Verificar si existe la comunidad
    const { data: community, error: communityError } = await supabase
      .from('comunidades')
      .select('*')
      .eq('id_comunidad', memberData.communityId)
      .single();
    
    if (communityError) throw communityError;
    if (!community) {
      return {
        success: false,
        message: 'La comunidad especificada no existe'
      };
    }
    
    // Insertar al nuevo miembro
    console.log('Intentando unir miembro a comunidad:', {
      id_comunidad: memberData.communityId,
      id_nombre_padre: memberData.parentName,
      nombre_padre: memberData.parentName,
      whatsapp_padre: memberData.whatsapp,
      email_padre: memberData.email,
      alias_mp: memberData.mercadoPagoAlias,
      nombre_hijo: memberData.childName,
      cumple_hijo: memberData.childBirthdate,
      perfil: 'miembro',
      monto_individual: community.monto_individual
    });
    
    const { data: member, error: memberError } = await supabase
      .from('miembros')
      .insert([
        {
          id_comunidad: memberData.communityId,
          id_nombre_padre: memberData.parentName,
          nombre_padre: memberData.parentName,
          whatsapp_padre: memberData.whatsapp,
          email_padre: memberData.email,
          alias_mp: memberData.mercadoPagoAlias,
          nombre_hijo: memberData.childName,
          cumple_hijo: memberData.childBirthdate,
          perfil: 'miembro',
          monto_individual: community.monto_individual
        }
      ])
      .select();
      
    if (member) {
      console.log('Miembro unido exitosamente:', member);
    }
    
    if (memberError) throw memberError;
    
    // Actualizar el contador de miembros
    const { error: updateError } = await supabase
      .from('comunidades')
      .update({ miembros: community.miembros + 1 })
      .eq('id_comunidad', memberData.communityId);
    
    if (updateError) throw updateError;
    
    // Crear evento para el cumpleaños
    await createBirthdayEvent(memberData.childName, memberData.childBirthdate, memberData.communityId);
    
    return {
      success: true,
      message: '¡Te has unido a la comunidad exitosamente!',
      communityId: memberData.communityId,
      communityName: community.nombre_comunidad
    };
  } catch (error) {
    console.error('Error al unirse a la comunidad:', error);
    return {
      success: false,
      message: 'Error al unirse a la comunidad: ' + error.message
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
    console.log('getCommunityDetails - Buscando comunidad con ID:', communityId);
    
    // Obtener detalles de la comunidad
    const { data: community, error } = await supabase
      .from('comunidades')
      .select('*')
      .eq('id_comunidad', communityId)
      .single();
    
    console.log('getCommunityDetails - Respuesta de Supabase:', { community, error });
    
    if (error) {
      console.error('getCommunityDetails - Error al obtener comunidad:', error);
      throw error;
    }
    
    if (!community) {
      console.error('getCommunityDetails - No se encontró la comunidad:', communityId);
      return {
        success: false,
        message: 'La comunidad especificada no existe'
      };
    }
    
    return {
      success: true,
      communityId: community.id_comunidad,
      communityName: community.nombre_comunidad,
      institution: community.institucion,
      gradeLevel: community.grado,
      division: community.division,
      creatorName: community.creador_nombre,
      creatorEmail: community.creador_email,
      creatorWhatsapp: community.creador_whatsapp,
      memberCount: community.miembros,
      status: community.estado,
      contributionAmount: community.monto_individual
    };
  } catch (error) {
    console.error('Error al obtener detalles de la comunidad:', error);
    return {
      success: false,
      message: 'Error al obtener detalles de la comunidad: ' + error.message
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
    // Obtener miembros de la comunidad
    const { data: members, error } = await supabase
      .from('miembros')
      .select('*')
      .eq('id_comunidad', communityId);
    
    if (error) throw error;
    
    return {
      success: true,
      members: members
    };
  } catch (error) {
    console.error('Error al obtener miembros de la comunidad:', error);
    return {
      success: false,
      message: 'Error al obtener miembros de la comunidad: ' + error.message
    };
  }
};

/**
 * Actualizar el estado de una comunidad
 * @param {string} communityId - ID de la comunidad
 * @param {string} status - Nuevo estado (activa/inactiva)
 * @returns {Promise} - Promesa con la respuesta
 */
export const updateCommunityStatus = async (communityId, status) => {
  try {
    // Actualizar el estado de la comunidad
    const { error } = await supabase
      .from('comunidades')
      .update({ estado: status })
      .eq('id_comunidad', communityId);
    
    if (error) throw error;
    
    return {
      success: true,
      message: 'Estado de la comunidad actualizado exitosamente'
    };
  } catch (error) {
    console.error('Error al actualizar estado de la comunidad:', error);
    return {
      success: false,
      message: 'Error al actualizar estado de la comunidad: ' + error.message
    };
  }
};

/**
 * Actualizar el monto individual de una comunidad
 * @param {string} communityId - ID de la comunidad
 * @param {number} amount - Nuevo monto individual
 * @returns {Promise} - Promesa con la respuesta
 */
export const updateIndividualAmount = async (communityId, amount) => {
  try {
    // Actualizar el monto individual de la comunidad
    const { error } = await supabase
      .from('comunidades')
      .update({ monto_individual: amount })
      .eq('id_comunidad', communityId);
    
    if (error) throw error;
    
    return {
      success: true,
      message: 'Monto individual actualizado exitosamente'
    };
  } catch (error) {
    console.error('Error al actualizar monto individual:', error);
    return {
      success: false,
      message: 'Error al actualizar monto individual: ' + error.message
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
    // Obtener eventos de la comunidad
    const { data: events, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('id_comunidad', communityId);
    
    if (error) throw error;
    
    return {
      success: true,
      events: events
    };
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return {
      success: false,
      message: 'Error al obtener eventos: ' + error.message
    };
  }
};

/**
 * Crear un evento de cumpleaños
 * @param {string} childName - Nombre del niño
 * @param {string} birthdate - Fecha de nacimiento
 * @param {string} communityId - ID de la comunidad
 * @returns {Promise} - Promesa con la respuesta
 */
const createBirthdayEvent = async (childName, birthdate, communityId) => {
  try {
    // Convertir la fecha de nacimiento a objeto Date
    let birthdateObj;
    try {
      // Si viene en formato YYYY-MM-DD
      birthdateObj = new Date(birthdate);
    } catch (e) {
      // Si hay error, intentar otro formato
      const parts = birthdate.split('/');
      birthdateObj = new Date(parts[2], parts[1] - 1, parts[0]);
    }
    
    // Crear el evento para este año
    const currentYear = new Date().getFullYear();
    const eventDate = new Date(currentYear, birthdateObj.getMonth(), birthdateObj.getDate());
    
    // Si la fecha ya pasó este año, programar para el próximo año
    if (eventDate < new Date()) {
      eventDate.setFullYear(currentYear + 1);
    }
    
    // Generar un ID único para el evento
    const eventId = `event_${communityId}_${childName.replace(/\s+/g, '')}_${Date.now()}`;
    
    console.log('Intentando crear evento con datos:', {
      id_comunidad: communityId,
      id_evento: eventId,
      nombre_evento: `Cumpleaños de ${childName}`,
      fecha_evento: eventDate.toISOString(),
      descripcion: `Celebración del cumpleaños de ${childName}`
    });
    
    // Insertar el evento
    const { data: eventData, error } = await supabase
      .from('eventos')
      .insert([
        {
          id_comunidad: communityId,
          id_evento: eventId,
          nombre_evento: `Cumpleaños de ${childName}`,
          fecha_evento: eventDate.toISOString(),
          descripcion: `Celebración del cumpleaños de ${childName}`,
          estado: 'pendiente'
        }
      ])
      .select();
      
    if (eventData) {
      console.log('Evento creado exitosamente:', eventData);
    }
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error al crear evento de cumpleaños:', error);
    return false;
  }
};

/**
 * Actualiza la tabla de eventos_activos basada en los próximos cumpleaños
 * Busca cumpleaños que ocurrirán en los próximos 15 días y crea eventos activos para recaudar dinero
 * @returns {Promise} - Promesa con la respuesta
 */
export const updateActiveEvents = async () => {
  try {
    // Obtener la fecha actual
    const currentDate = new Date();
    
    // Calcular la fecha límite (15 días en el futuro)
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + 15);
    
    // Obtener todos los miembros
    const { data: members, error: membersError } = await supabase
      .from('miembros')
      .select('*');
    
    if (membersError) throw membersError;
    
    // Procesar cada miembro para verificar si su cumpleaños está próximo
    const activeEvents = [];
    
    for (const member of members) {
      // Convertir la fecha de cumpleaños a objeto Date
      let birthdateObj;
      try {
        // Si viene en formato YYYY-MM-DD
        birthdateObj = new Date(member.cumple_hijo);
      } catch (e) {
        // Si hay error, intentar otro formato
        const parts = member.cumple_hijo.split('/');
        birthdateObj = new Date(parts[2], parts[1] - 1, parts[0]);
      }
      
      // Crear la fecha del cumpleaños para este año
      const currentYear = currentDate.getFullYear();
      const birthdayThisYear = new Date(currentYear, birthdateObj.getMonth(), birthdateObj.getDate());
      
      // Si el cumpleaños ya pasó este año, verificar para el próximo año
      if (birthdayThisYear < currentDate) {
        birthdayThisYear.setFullYear(currentYear + 1);
      }
      
      // Verificar si el cumpleaños está dentro del rango de 15 días
      if (birthdayThisYear <= futureDate && birthdayThisYear >= currentDate) {
        console.log(`Cumpleaños próximo encontrado: ${member.nombre_hijo} - ${birthdayThisYear.toISOString()}`);
        
        // Obtener los detalles de la comunidad
        const { data: community, error: communityError } = await supabase
          .from('comunidades')
          .select('*')
          .eq('id_comunidad', member.id_comunidad)
          .single();
        
        if (communityError) throw communityError;
        
        // Obtener todos los miembros de la comunidad (excepto el cumpleañero)
        const { data: communityMembers, error: communityMembersError } = await supabase
          .from('miembros')
          .select('*')
          .eq('id_comunidad', member.id_comunidad)
          .neq('nombre_hijo', member.nombre_hijo); // Excluir al cumpleañero
        
        if (communityMembersError) throw communityMembersError;
        
        // Calcular el objetivo de recaudación
        const montoIndividual = parseFloat(community.monto_individual || 1500);
        const objetivo = montoIndividual * communityMembers.length;
        
        // Verificar si ya existe un evento activo para este cumpleaños
        const { data: existingEvent, error: existingEventError } = await supabase
          .from('eventos_activos')
          .select('*')
          .eq('id_comunidad', member.id_comunidad)
          .eq('nombre_hijo', member.nombre_hijo);
        
        if (existingEventError) throw existingEventError;
        
        // Si no existe un evento activo, crearlo
        if (!existingEvent || existingEvent.length === 0) {
          const eventId = `active_${member.id_comunidad}_${member.nombre_hijo.replace(/\s+/g, '')}_${Date.now()}`;
          
          // Crear el evento activo
          const { data: eventData, error: eventError } = await supabase
            .from('eventos_activos')
            .insert([
              {
                id_evento: eventId,
                id_comunidad: member.id_comunidad,
                nombre_comunidad: community.nombre_comunidad,
                nombre_hijo: member.nombre_hijo,
                fecha_cumple: birthdayThisYear.toISOString(),
                nombre_padre: member.nombre_padre, // Padre del cumpleañero (no aporta)
                objetivo_recaudacion: objetivo,
                recaudado: 0,
                estado: 'activo',
                fecha_creacion: new Date().toISOString(),
                miembros_pendientes: communityMembers.map(m => ({
                  nombre_padre: m.nombre_padre,
                  whatsapp_padre: m.whatsapp_padre,
                  monto_individual: montoIndividual,
                  estado_pago: 'pendiente'
                }))
              }
            ])
            .select();
          
          if (eventError) throw eventError;
          
          if (eventData) {
            console.log('Evento activo creado exitosamente:', eventData);
            activeEvents.push(eventData[0]);
          }
        } else {
          console.log('Ya existe un evento activo para este cumpleaños:', existingEvent);
          activeEvents.push(existingEvent[0]);
        }
      }
    }
    
    return {
      success: true,
      message: `Se encontraron ${activeEvents.length} eventos activos para los próximos 15 días`,
      events: activeEvents
    };
  } catch (error) {
    console.error('Error al actualizar eventos activos:', error);
    return {
      success: false,
      message: 'Error al actualizar eventos activos: ' + error.message
    };
  }
};

/**
 * Obtiene todos los eventos activos
 * @returns {Promise} - Promesa con la respuesta
 */
export const getActiveEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('estado', 'activo');
    
    if (error) throw error;
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error al obtener eventos activos:', error);
    return {
      success: false,
      message: 'Error al obtener eventos activos: ' + error.message
    };
  }
};

// Exportar la función createBirthdayEvent que antes era privada
export { createBirthdayEvent };

// Todas las demás funciones ya están exportadas con export const
