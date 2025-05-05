/**
 * Script para crear datos de prueba en Supabase
 * Crea una comunidad, miembros y un evento activo para Milan
 */
const supabase = require('../utils/supabaseClient');

// Función para crear una comunidad de prueba
const createTestCommunity = async () => {
  console.log('Creando comunidad de prueba...');
  
  // ID de comunidad
  const communityId = 'inainstitutonuevosaires+sala3+roja+184642';
  
  // Verificar si ya existe la comunidad
  const { data: existingCommunity, error: checkError } = await supabase
    .from('comunidades')
    .select('*')
    .eq('id_comunidad', communityId)
    .single();
  
  if (!checkError && existingCommunity) {
    console.log('La comunidad ya existe:', existingCommunity);
    return existingCommunity;
  }
  
  // Crear la comunidad
  const { data: community, error } = await supabase
    .from('comunidades')
    .insert([
      {
        id_comunidad: communityId,
        nombre_comunidad: 'INA Instituto Nuevos Aires - Sala 3 - Roja',
        institucion: 'INA Instituto Nuevos Aires',
        grado: 'Sala 3',
        division: 'Roja',
        creador_nombre: 'Javier Ursino',
        creador_email: 'javier@example.com',
        creador_whatsapp: '+5491112345678',
        miembros: 5,
        estado: 'activa',
        monto_individual: 1500
      }
    ])
    .select();
  
  if (error) {
    console.error('Error al crear la comunidad:', error);
    return null;
  }
  
  console.log('✅ Comunidad creada exitosamente:', community);
  return community[0];
};

// Función para crear miembros de prueba
const createTestMembers = async (communityId) => {
  console.log('Creando miembros de prueba...');
  
  // Lista de miembros a crear
  const members = [
    {
      id_comunidad: communityId,
      id_nombre_padre: 'javier_ursino',
      nombre_padre: 'Javier Ursino',
      whatsapp_padre: '+5491112345678',
      email_padre: 'javier@example.com',
      alias_mp: 'javier.ursino',
      nombre_hijo: 'Milan',
      cumple_hijo: '2025-05-18', // Cumpleaños de Milan (15 días en el futuro)
      perfil: 'creador',
      monto_individual: 1500
    },
    {
      id_comunidad: communityId,
      id_nombre_padre: 'ana_martinez',
      nombre_padre: 'Ana Martínez',
      whatsapp_padre: '+5491123456789',
      email_padre: 'ana@example.com',
      alias_mp: 'ana.martinez',
      nombre_hijo: 'Lucía',
      cumple_hijo: '2025-07-10',
      perfil: 'miembro',
      monto_individual: 1500
    },
    {
      id_comunidad: communityId,
      id_nombre_padre: 'carlos_rodriguez',
      nombre_padre: 'Carlos Rodríguez',
      whatsapp_padre: '+5491134567890',
      email_padre: 'carlos@example.com',
      alias_mp: 'carlos.rodriguez',
      nombre_hijo: 'Mateo',
      cumple_hijo: '2025-08-22',
      perfil: 'miembro',
      monto_individual: 1500
    },
    {
      id_comunidad: communityId,
      id_nombre_padre: 'laura_gomez',
      nombre_padre: 'Laura Gómez',
      whatsapp_padre: '+5491145678901',
      email_padre: 'laura@example.com',
      alias_mp: 'laura.gomez',
      nombre_hijo: 'Sofía',
      cumple_hijo: '2025-06-05',
      perfil: 'miembro',
      monto_individual: 1500
    },
    {
      id_comunidad: communityId,
      id_nombre_padre: 'pablo_sanchez',
      nombre_padre: 'Pablo Sánchez',
      whatsapp_padre: '+5491156789012',
      email_padre: 'pablo@example.com',
      alias_mp: 'pablo.sanchez',
      nombre_hijo: 'Benjamín',
      cumple_hijo: '2025-09-15',
      perfil: 'miembro',
      monto_individual: 1500
    }
  ];
  
  // Insertar cada miembro
  const createdMembers = [];
  
  for (const member of members) {
    // Verificar si ya existe el miembro
    const { data: existingMember, error: checkError } = await supabase
      .from('miembros')
      .select('*')
      .eq('id_comunidad', member.id_comunidad)
      .eq('nombre_hijo', member.nombre_hijo)
      .single();
    
    if (!checkError && existingMember) {
      console.log(`El miembro ${member.nombre_hijo} ya existe`);
      createdMembers.push(existingMember);
      continue;
    }
    
    // Crear el miembro
    const { data, error } = await supabase
      .from('miembros')
      .insert([member])
      .select();
    
    if (error) {
      console.error(`Error al crear el miembro ${member.nombre_hijo}:`, error);
    } else {
      console.log(`✅ Miembro ${member.nombre_hijo} creado exitosamente`);
      createdMembers.push(data[0]);
    }
  }
  
  console.log(`✅ Se crearon ${createdMembers.length} miembros`);
  return createdMembers;
};

// Función para crear un evento activo para Milan
const createMilanEvent = async (communityId) => {
  console.log('Creando evento activo para Milan...');
  
  // Verificar si ya existe un evento activo para Milan
  const { data: existingEvent, error: checkError } = await supabase
    .from('eventos_activos')
    .select('*')
    .eq('id_comunidad', communityId)
    .eq('nombre_hijo', 'Milan')
    .single();
  
  if (!checkError && existingEvent) {
    console.log('Ya existe un evento activo para Milan:', existingEvent);
    return existingEvent;
  }
  
  // Obtener los miembros de la comunidad (excepto Milan)
  const { data: members, error: membersError } = await supabase
    .from('miembros')
    .select('*')
    .eq('id_comunidad', communityId)
    .neq('nombre_hijo', 'Milan');
  
  if (membersError) {
    console.error('Error al obtener miembros de la comunidad:', membersError);
    return null;
  }
  
  // Obtener la comunidad
  const { data: community, error: communityError } = await supabase
    .from('comunidades')
    .select('*')
    .eq('id_comunidad', communityId)
    .single();
  
  if (communityError) {
    console.error('Error al obtener la comunidad:', communityError);
    return null;
  }
  
  // Calcular el objetivo de recaudación
  const montoIndividual = parseFloat(community.monto_individual || 1500);
  const objetivo = montoIndividual * members.length;
  
  // Crear lista de miembros pendientes
  const miembrosPendientes = members.map(m => ({
    nombre_padre: m.nombre_padre,
    whatsapp_padre: m.whatsapp_padre,
    monto_individual: montoIndividual,
    estado_pago: 'pendiente'
  }));
  
  // Crear el evento activo
  const eventId = `active_${communityId}_Milan_${Date.now()}`;
  const birthdayDate = new Date('2025-05-18'); // Cumpleaños de Milan
  
  const { data: event, error } = await supabase
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
  
  if (error) {
    console.error('Error al crear evento activo para Milan:', error);
    return null;
  }
  
  console.log('✅ Evento activo para Milan creado exitosamente:', event);
  return event[0];
};

// Función principal
const main = async () => {
  console.log('Iniciando creación de datos de prueba...');
  
  try {
    // Crear comunidad
    const community = await createTestCommunity();
    
    if (!community) {
      console.error('No se pudo crear la comunidad de prueba');
      return;
    }
    
    // Crear miembros
    const members = await createTestMembers(community.id_comunidad);
    
    if (!members || members.length === 0) {
      console.error('No se pudieron crear los miembros de prueba');
      return;
    }
    
    // Crear evento activo para Milan
    const event = await createMilanEvent(community.id_comunidad);
    
    if (!event) {
      console.error('No se pudo crear el evento activo para Milan');
      return;
    }
    
    console.log('\n✅ Datos de prueba creados exitosamente');
    console.log('\nResumen:');
    console.log(`- Comunidad: ${community.nombre_comunidad}`);
    console.log(`- Miembros: ${members.length}`);
    console.log(`- Evento activo para Milan: ${event.id_evento}`);
    console.log(`  - Fecha de cumpleaños: ${new Date(event.fecha_cumple).toLocaleDateString()}`);
    console.log(`  - Objetivo de recaudación: $${event.objetivo_recaudacion}`);
    console.log(`  - Miembros pendientes: ${event.miembros_pendientes.length}`);
    
    // Mostrar los miembros que deben aportar
    console.log('\nMiembros que deben aportar:');
    event.miembros_pendientes.forEach((miembro, index) => {
      console.log(`${index + 1}. ${miembro.nombre_padre} - $${miembro.monto_individual} - Estado: ${miembro.estado_pago}`);
    });
  } catch (error) {
    console.error('Error inesperado:', error);
  }
};

// Ejecutar la función principal
main()
  .then(() => {
    console.log('\nScript finalizado');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error en el script:', error);
    process.exit(1);
  });
