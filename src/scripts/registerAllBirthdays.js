/**
 * Script para registrar todos los cumpleaños en la tabla eventos
 * Este script recorre todos los miembros y crea eventos para sus cumpleaños
 */
const supabase = require('../utils/supabaseClient');

// Función para crear un evento de cumpleaños
const createBirthdayEvent = async (childName, birthdate, communityId) => {
  try {
    // Convertir la fecha de nacimiento a objeto Date
    let birthdateObj;
    try {
      // Si viene en formato YYYY-MM-DD
      birthdateObj = new Date(birthdate);
      if (isNaN(birthdateObj.getTime())) {
        // Si es inválida, intentar otro formato
        const parts = birthdate.split('/');
        birthdateObj = new Date(parts[2], parts[1] - 1, parts[0]);
      }
    } catch (e) {
      console.error(`Error al procesar la fecha de cumpleaños de ${childName}:`, e);
      return false;
    }
    
    // Crear el evento para este año
    const currentYear = new Date().getFullYear();
    const eventDate = new Date(currentYear, birthdateObj.getMonth(), birthdateObj.getDate());
    
    // Si la fecha ya pasó este año, programar para el próximo año
    if (eventDate < new Date()) {
      eventDate.setFullYear(currentYear + 1);
    }
    
    // Verificar si ya existe un evento para este cumpleaños
    const { data: existingEvents, error: checkError } = await supabase
      .from('eventos')
      .select('*')
      .eq('id_comunidad', communityId)
      .ilike('nombre_evento', `Cumpleaños de ${childName}`);
    
    if (!checkError && existingEvents && existingEvents.length > 0) {
      console.log(`Ya existe un evento para el cumpleaños de ${childName}`);
      return true;
    }
    
    // Generar un ID único para el evento
    const eventId = `event_${communityId}_${childName.replace(/\\s+/g, '')}_${Date.now()}`;
    
    console.log('Creando evento con datos:', {
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
    
    if (error) {
      console.error(`Error al crear evento para ${childName}:`, error);
      return false;
    }
    
    console.log(`✅ Evento para el cumpleaños de ${childName} creado exitosamente:`, eventData);
    return true;
  } catch (error) {
    console.error(`Error inesperado al crear evento para ${childName}:`, error);
    return false;
  }
};

// Función principal
const main = async () => {
  console.log('Iniciando registro de todos los cumpleaños...');
  
  try {
    // Obtener todos los miembros
    const { data: members, error: membersError } = await supabase
      .from('miembros')
      .select('*');
    
    if (membersError) {
      console.error('Error al obtener miembros:', membersError);
      return;
    }
    
    if (!members || members.length === 0) {
      console.log('⚠️ No se encontraron miembros en la base de datos');
      return;
    }
    
    console.log(`Se encontraron ${members.length} miembros`);
    
    // Crear eventos para cada miembro
    let successCount = 0;
    
    for (const member of members) {
      console.log(`\nProcesando miembro: ${member.nombre_hijo} (${member.nombre_padre})`);
      
      const success = await createBirthdayEvent(
        member.nombre_hijo,
        member.cumple_hijo,
        member.id_comunidad
      );
      
      if (success) {
        successCount++;
      }
    }
    
    console.log(`\n✅ Se crearon ${successCount} eventos de cumpleaños de un total de ${members.length} miembros`);
    
    // Verificar eventos creados
    const { data: events, error: eventsError } = await supabase
      .from('eventos')
      .select('*');
    
    if (eventsError) {
      console.error('Error al obtener eventos:', eventsError);
      return;
    }
    
    if (!events || events.length === 0) {
      console.log('⚠️ No se encontraron eventos en la base de datos');
      return;
    }
    
    console.log(`\nSe encontraron ${events.length} eventos en la base de datos:`);
    events.forEach((event, index) => {
      console.log(`\n${index + 1}. ${event.nombre_evento}`);
      console.log(`   Fecha: ${new Date(event.fecha_evento).toLocaleDateString()}`);
      console.log(`   Comunidad: ${event.id_comunidad}`);
      console.log(`   Estado: ${event.estado}`);
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
