/**
 * Script para verificar los emails de los miembros
 * Este script muestra los miembros que tienen emails registrados
 */
const supabase = require('../utils/supabaseClient');

/**
 * Función principal
 */
const main = async () => {
  console.log('Verificando emails de miembros...');
  
  try {
    // Obtener todos los miembros
    const { data: members, error } = await supabase
      .from('miembros')
      .select('*');
    
    if (error) {
      console.error('Error al obtener miembros:', error);
      return;
    }
    
    if (!members || members.length === 0) {
      console.log('No se encontraron miembros');
      return;
    }
    
    console.log(`\nSe encontraron ${members.length} miembros en total\n`);
    
    // Filtrar miembros con email
    const membersWithEmail = members.filter(m => m.email_padre);
    
    console.log(`Miembros con email (${membersWithEmail.length}):`);
    membersWithEmail.forEach((member, index) => {
      console.log(`${index + 1}. ${member.nombre_padre}: ${member.email_padre}`);
    });
    
    // Filtrar miembros sin email
    const membersWithoutEmail = members.filter(m => !m.email_padre);
    
    console.log(`\nMiembros sin email (${membersWithoutEmail.length}):`);
    membersWithoutEmail.forEach((member, index) => {
      console.log(`${index + 1}. ${member.nombre_padre}`);
    });
    
    // Mostrar información por comunidad
    console.log('\nInformación por comunidad:');
    
    // Agrupar miembros por comunidad
    const communitiesMap = {};
    
    members.forEach(member => {
      if (!communitiesMap[member.id_comunidad]) {
        communitiesMap[member.id_comunidad] = {
          id: member.id_comunidad,
          members: [],
          membersWithEmail: 0,
          membersWithoutEmail: 0
        };
      }
      
      communitiesMap[member.id_comunidad].members.push(member);
      
      if (member.email_padre) {
        communitiesMap[member.id_comunidad].membersWithEmail++;
      } else {
        communitiesMap[member.id_comunidad].membersWithoutEmail++;
      }
    });
    
    // Obtener información de las comunidades
    const { data: communities, error: communitiesError } = await supabase
      .from('comunidades')
      .select('*');
    
    if (communitiesError) {
      console.error('Error al obtener comunidades:', communitiesError);
    } else {
      // Mostrar información de cada comunidad
      communities.forEach(community => {
        const communityInfo = communitiesMap[community.id_comunidad] || {
          members: [],
          membersWithEmail: 0,
          membersWithoutEmail: 0
        };
        
        console.log(`\nComunidad: ${community.nombre_comunidad}`);
        console.log(`- Total miembros: ${communityInfo.members.length}`);
        console.log(`- Miembros con email: ${communityInfo.membersWithEmail}`);
        console.log(`- Miembros sin email: ${communityInfo.membersWithoutEmail}`);
        
        if (communityInfo.membersWithEmail > 0) {
          console.log('\nMiembros con email:');
          communityInfo.members
            .filter(m => m.email_padre)
            .forEach((member, index) => {
              console.log(`  ${index + 1}. ${member.nombre_padre}: ${member.email_padre}`);
            });
        }
      });
    }
  } catch (error) {
    console.error('Error inesperado:', error);
  }
};

// Ejecutar la función principal
main()
  .then(() => {
    console.log('\nVerificación completada');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error en el script:', error);
    process.exit(1);
  });
