/**
 * Script para verificar los datos de miembros y actualizar eventos activos
 * Este script es útil para diagnosticar problemas con la detección de cumpleaños
 */
const supabase = require('../utils/supabaseClient');

// Función para verificar si hay datos en la tabla de miembros
const checkMembers = async () => {
  console.log('Verificando datos en la tabla de miembros...');
  
  try {
    const { data: members, error } = await supabase
      .from('miembros')
      .select('*');
    
    if (error) {
      console.error('Error al obtener miembros:', error);
      return false;
    }
    
    if (!members || members.length === 0) {
      console.log('⚠️ No se encontraron miembros en la base de datos');
      return false;
    }
    
    console.log(`✅ Se encontraron ${members.length} miembros en la base de datos`);
    
    // Mostrar información de los miembros
    members.forEach((member, index) => {
      console.log(`\nMiembro #${index + 1}:`);
      console.log(`- Nombre: ${member.nombre_padre}`);
      console.log(`- Hijo: ${member.nombre_hijo}`);
      console.log(`- Cumpleaños: ${member.cumple_hijo}`);
      console.log(`- Comunidad: ${member.id_comunidad}`);
    });
    
    return members;
  } catch (error) {
    console.error('Error inesperado al verificar miembros:', error);
    return false;
  }
};

// Función para verificar cumpleaños próximos
const checkUpcomingBirthdays = (members) => {
  console.log('\nVerificando cumpleaños próximos...');
  
  // Obtener la fecha actual
  const currentDate = new Date();
  
  // Calcular la fecha límite (15 días en el futuro)
  const futureDate = new Date();
  futureDate.setDate(currentDate.getDate() + 15);
  
  console.log(`Fecha actual: ${currentDate.toISOString().split('T')[0]}`);
  console.log(`Fecha límite (15 días después): ${futureDate.toISOString().split('T')[0]}`);
  
  const upcomingBirthdays = [];
  
  // Verificar cada miembro
  members.forEach(member => {
    // Convertir la fecha de cumpleaños a objeto Date
    let birthdateObj;
    try {
      // Si viene en formato YYYY-MM-DD
      birthdateObj = new Date(member.cumple_hijo);
      if (isNaN(birthdateObj.getTime())) {
        // Si es inválida, intentar otro formato
        const parts = member.cumple_hijo.split('/');
        birthdateObj = new Date(parts[2], parts[1] - 1, parts[0]);
      }
    } catch (e) {
      console.error(`Error al procesar la fecha de cumpleaños de ${member.nombre_hijo}:`, e);
      return;
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
      console.log(`✅ Cumpleaños próximo encontrado: ${member.nombre_hijo} - ${birthdayThisYear.toISOString().split('T')[0]}`);
      upcomingBirthdays.push({
        member,
        birthdayDate: birthdayThisYear
      });
    }
  });
  
  if (upcomingBirthdays.length === 0) {
    console.log('⚠️ No se encontraron cumpleaños próximos en los próximos 15 días');
  } else {
    console.log(`✅ Se encontraron ${upcomingBirthdays.length} cumpleaños próximos`);
  }
  
  return upcomingBirthdays;
};

// Función para crear manualmente un evento activo para Milan
const createMilanEvent = async () => {
  console.log('\nCreando manualmente evento activo para Milan...');
  
  try {
    // Buscar a Milan en la base de datos
    const { data: milanMember, error: milanError } = await supabase
      .from('miembros')
      .select('*')
      .eq('nombre_hijo', 'Milan')
      .single();
    
    if (milanError || !milanMember) {
      console.error('Error al buscar a Milan:', milanError || 'No se encontró');
      
      // Crear datos de prueba para Milan
      console.log('Creando datos de prueba para Milan...');
      
      // Fecha de cumpleaños (18/5/2025)
      const birthdate = '2025-05-18';
      const birthdayDate = new Date(birthdate);
      
      // ID de comunidad de prueba
      const communityId = 'inainstitutonuevosaires+sala3+roja+184642';
      
      // Obtener la comunidad
      const { data: community, error: communityError } = await supabase
        .from('comunidades')
        .select('*')
        .eq('id_comunidad', communityId)
        .single();
      
      if (communityError || !community) {
        console.error('Error al obtener la comunidad:', communityError || 'No se encontró');
        return false;
      }
      
      // Obtener miembros de la comunidad
      const { data: communityMembers, error: membersError } = await supabase
        .from('miembros')
        .select('*')
        .eq('id_comunidad', communityId);
      
      if (membersError || !communityMembers || communityMembers.length === 0) {
        console.error('Error al obtener miembros de la comunidad:', membersError || 'No se encontraron miembros');
        return false;
      }
      
      // Crear el evento activo para Milan
      const eventId = `active_${communityId}_Milan_${Date.now()}`;
      
      // Calcular el objetivo de recaudación (excluyendo al padre)
      const montoIndividual = parseFloat(community.monto_individual || 1500);
      const objetivo = montoIndividual * (communityMembers.length - 1); // Excluir al padre
      
      // Crear lista de miembros pendientes (excluyendo al padre de Milan)
      const miembrosPendientes = communityMembers
        .filter(m => m.nombre_padre !== 'Javier Ursino') // Excluir al padre de Milan
        .map(m => ({
          nombre_padre: m.nombre_padre,
          whatsapp_padre: m.whatsapp_padre,
          monto_individual: montoIndividual,
          estado_pago: 'pendiente'
        }));
      
      // Insertar el evento activo
      const { data: eventData, error: eventError } = await supabase
        .from('eventos_activos')
        .insert([
          {
            id_evento: eventId,
            id_comunidad: communityId,
            nombre_comunidad: community.nombre_comunidad,
            nombre_hijo: 'Milan',
            fecha_cumple: birthdayDate.toISOString(),
            nombre_padre: 'Javier Ursino', // Padre de Milan (no aporta)
            objetivo_recaudacion: objetivo,
            recaudado: 0,
            estado: 'activo',
            fecha_creacion: new Date().toISOString(),
            miembros_pendientes: miembrosPendientes
          }
        ])
        .select();
      
      if (eventError) {
        console.error('Error al crear evento activo para Milan:', eventError);
        return false;
      }
      
      console.log('✅ Evento activo para Milan creado manualmente con éxito:', eventData);
      return eventData;
    }
    
    // Si Milan existe, crear el evento activo
    console.log('Milan encontrado en la base de datos:', milanMember);
    
    // Obtener la comunidad
    const { data: community, error: communityError } = await supabase
      .from('comunidades')
      .select('*')
      .eq('id_comunidad', milanMember.id_comunidad)
      .single();
    
    if (communityError || !community) {
      console.error('Error al obtener la comunidad:', communityError || 'No se encontró');
      return false;
    }
    
    // Obtener miembros de la comunidad (excepto Milan)
    const { data: communityMembers, error: membersError } = await supabase
      .from('miembros')
      .select('*')
      .eq('id_comunidad', milanMember.id_comunidad)
      .neq('nombre_hijo', milanMember.nombre_hijo);
    
    if (membersError) {
      console.error('Error al obtener miembros de la comunidad:', membersError);
      return false;
    }
    
    // Calcular el objetivo de recaudación
    const montoIndividual = parseFloat(community.monto_individual || 1500);
    const objetivo = montoIndividual * communityMembers.length;
    
    // Crear el evento activo
    const eventId = `active_${milanMember.id_comunidad}_${milanMember.nombre_hijo.replace(/\s+/g, '')}_${Date.now()}`;
    
    // Crear lista de miembros pendientes
    const miembrosPendientes = communityMembers.map(m => ({
      nombre_padre: m.nombre_padre,
      whatsapp_padre: m.whatsapp_padre,
      monto_individual: montoIndividual,
      estado_pago: 'pendiente'
    }));
    
    // Insertar el evento activo
    const { data: eventData, error: eventError } = await supabase
      .from('eventos_activos')
      .insert([
        {
          id_evento: eventId,
          id_comunidad: milanMember.id_comunidad,
          nombre_comunidad: community.nombre_comunidad,
          nombre_hijo: milanMember.nombre_hijo,
          fecha_cumple: new Date('2025-05-18').toISOString(), // Fecha del cumpleaños de Milan
          nombre_padre: milanMember.nombre_padre, // Padre de Milan (no aporta)
          objetivo_recaudacion: objetivo,
          recaudado: 0,
          estado: 'activo',
          fecha_creacion: new Date().toISOString(),
          miembros_pendientes: miembrosPendientes
        }
      ])
      .select();
    
    if (eventError) {
      console.error('Error al crear evento activo para Milan:', eventError);
      return false;
    }
    
    console.log('✅ Evento activo para Milan creado con éxito:', eventData);
    return eventData;
  } catch (error) {
    console.error('Error inesperado al crear evento para Milan:', error);
    return false;
  }
};

// Función principal
const main = async () => {
  console.log('Iniciando verificación y actualización de eventos activos...');
  console.log('Fecha actual:', new Date().toISOString());
  
  try {
    // Verificar si hay datos en la tabla de miembros
    const members = await checkMembers();
    
    if (!members) {
      console.log('⚠️ No se pueden verificar cumpleaños sin datos de miembros');
      
      // Crear manualmente el evento para Milan
      await createMilanEvent();
      return;
    }
    
    // Verificar cumpleaños próximos
    const upcomingBirthdays = checkUpcomingBirthdays(members);
    
    if (upcomingBirthdays.length === 0) {
      console.log('⚠️ No se encontraron cumpleaños próximos, creando manualmente el evento para Milan');
      await createMilanEvent();
    } else {
      console.log('✅ Se encontraron cumpleaños próximos, actualizando eventos activos');
      
      // Aquí se podría llamar a la función updateActiveEvents
      // pero como ya tenemos los datos, vamos a procesarlos directamente
      for (const { member, birthdayDate } of upcomingBirthdays) {
        // Verificar si ya existe un evento activo para este cumpleaños
        const { data: existingEvent, error: existingEventError } = await supabase
          .from('eventos_activos')
          .select('*')
          .eq('id_comunidad', member.id_comunidad)
          .eq('nombre_hijo', member.nombre_hijo);
        
        if (existingEventError) {
          console.error(`Error al verificar evento existente para ${member.nombre_hijo}:`, existingEventError);
          continue;
        }
        
        if (existingEvent && existingEvent.length > 0) {
          console.log(`Ya existe un evento activo para ${member.nombre_hijo}`);
          continue;
        }
        
        // Obtener la comunidad
        const { data: community, error: communityError } = await supabase
          .from('comunidades')
          .select('*')
          .eq('id_comunidad', member.id_comunidad)
          .single();
        
        if (communityError || !community) {
          console.error(`Error al obtener la comunidad para ${member.nombre_hijo}:`, communityError || 'No se encontró');
          continue;
        }
        
        // Obtener miembros de la comunidad (excepto el cumpleañero)
        const { data: communityMembers, error: membersError } = await supabase
          .from('miembros')
          .select('*')
          .eq('id_comunidad', member.id_comunidad)
          .neq('nombre_hijo', member.nombre_hijo);
        
        if (membersError) {
          console.error(`Error al obtener miembros de la comunidad para ${member.nombre_hijo}:`, membersError);
          continue;
        }
        
        // Calcular el objetivo de recaudación
        const montoIndividual = parseFloat(community.monto_individual || 1500);
        const objetivo = montoIndividual * communityMembers.length;
        
        // Crear el evento activo
        const eventId = `active_${member.id_comunidad}_${member.nombre_hijo.replace(/\s+/g, '')}_${Date.now()}`;
        
        // Crear lista de miembros pendientes
        const miembrosPendientes = communityMembers.map(m => ({
          nombre_padre: m.nombre_padre,
          whatsapp_padre: m.whatsapp_padre,
          monto_individual: montoIndividual,
          estado_pago: 'pendiente'
        }));
        
        // Insertar el evento activo
        const { data: eventData, error: eventError } = await supabase
          .from('eventos_activos')
          .insert([
            {
              id_evento: eventId,
              id_comunidad: member.id_comunidad,
              nombre_comunidad: community.nombre_comunidad,
              nombre_hijo: member.nombre_hijo,
              fecha_cumple: birthdayDate.toISOString(),
              nombre_padre: member.nombre_padre, // Padre del cumpleañero (no aporta)
              objetivo_recaudacion: objetivo,
              recaudado: 0,
              estado: 'activo',
              fecha_creacion: new Date().toISOString(),
              miembros_pendientes: miembrosPendientes
            }
          ])
          .select();
        
        if (eventError) {
          console.error(`Error al crear evento activo para ${member.nombre_hijo}:`, eventError);
        } else {
          console.log(`✅ Evento activo para ${member.nombre_hijo} creado con éxito:`, eventData);
        }
      }
    }
    
    // Verificar eventos activos creados
    const { data: activeEvents, error: activeEventsError } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('estado', 'activo');
    
    if (activeEventsError) {
      console.error('Error al obtener eventos activos:', activeEventsError);
    } else if (!activeEvents || activeEvents.length === 0) {
      console.log('⚠️ No se encontraron eventos activos en la base de datos');
    } else {
      console.log(`✅ Se encontraron ${activeEvents.length} eventos activos:`);
      activeEvents.forEach(event => {
        console.log(`\nEvento: ${event.nombre_hijo} (${new Date(event.fecha_cumple).toLocaleDateString()})`);
        console.log(`- Comunidad: ${event.nombre_comunidad}`);
        console.log(`- Objetivo: $${event.objetivo_recaudacion}`);
        console.log(`- Miembros pendientes: ${event.miembros_pendientes.length}`);
      });
    }
  } catch (error) {
    console.error('Error inesperado:', error);
  }
  
  console.log('\nFinalización:', new Date().toISOString());
};

// Ejecutar la función principal
main()
  .then(() => {
    console.log('Script finalizado');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error en el script:', error);
    process.exit(1);
  });
