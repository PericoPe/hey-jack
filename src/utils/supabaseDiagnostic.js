import supabase from './supabaseClient';

// Función para verificar la conexión a Supabase y los datos disponibles
const runDiagnostic = async () => {
  console.log('Iniciando diagnóstico de Supabase...');
  
  try {
    // 1. Verificar la conexión a Supabase
    console.log('1. Verificando conexión a Supabase...');
    const { data: connectionTest, error: connectionError } = await supabase.from('comunidades').select('count()', { count: 'exact' });
    
    if (connectionError) {
      console.error('❌ Error de conexión a Supabase:', connectionError);
      return false;
    }
    
    console.log('✅ Conexión a Supabase exitosa');
    
    // 2. Verificar tablas y datos
    const tables = ['comunidades', 'miembros', 'eventos', 'eventos_activos', 'eventos_activos_aportantes'];
    
    for (const table of tables) {
      console.log(`2. Verificando tabla ${table}...`);
      const { data, error, count } = await supabase.from(table).select('count()', { count: 'exact' });
      
      if (error) {
        console.error(`❌ Error al verificar tabla ${table}:`, error);
      } else {
        console.log(`✅ Tabla ${table} accesible. Registros: ${count}`);
      }
    }
    
    // 3. Verificar datos específicos
    console.log('3. Verificando datos específicos...');
    
    // Verificar comunidades
    const { data: comunidades, error: comunidadesError } = await supabase.from('comunidades').select('*').limit(1);
    if (comunidadesError) {
      console.error('❌ Error al obtener comunidades:', comunidadesError);
    } else if (comunidades.length === 0) {
      console.warn('⚠️ No hay comunidades en la base de datos');
    } else {
      console.log('✅ Comunidades encontradas:', comunidades);
    }
    
    // Verificar miembros
    const { data: miembros, error: miembrosError } = await supabase.from('miembros').select('*').limit(1);
    if (miembrosError) {
      console.error('❌ Error al obtener miembros:', miembrosError);
    } else if (miembros.length === 0) {
      console.warn('⚠️ No hay miembros en la base de datos');
    } else {
      console.log('✅ Miembros encontrados:', miembros);
    }
    
    // Verificar Hernan Sanjurjo
    const { data: hernan, error: hernanError } = await supabase
      .from('miembros')
      .select('*')
      .or('nombre_padre.ilike.%Hernan Sanjurjo%,email_padre.ilike.%hernan.sanjurjo%')
      .limit(1);
    
    if (hernanError) {
      console.error('❌ Error al buscar a Hernan Sanjurjo:', hernanError);
    } else if (hernan.length === 0) {
      console.warn('⚠️ No se encontró a Hernan Sanjurjo en la base de datos');
    } else {
      console.log('✅ Hernan Sanjurjo encontrado:', hernan);
    }
    
    // Verificar eventos activos
    const { data: eventosActivos, error: eventosActivosError } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('estado', 'activo')
      .limit(1);
    
    if (eventosActivosError) {
      console.error('❌ Error al obtener eventos activos:', eventosActivosError);
    } else if (eventosActivos.length === 0) {
      console.warn('⚠️ No hay eventos activos en la base de datos');
    } else {
      console.log('✅ Eventos activos encontrados:', eventosActivos);
    }
    
    // Verificar aportantes
    const { data: aportantes, error: aportantesError } = await supabase
      .from('eventos_activos_aportantes')
      .select('*')
      .limit(1);
    
    if (aportantesError) {
      console.error('❌ Error al obtener aportantes:', aportantesError);
    } else if (aportantes.length === 0) {
      console.warn('⚠️ No hay aportantes en la base de datos');
    } else {
      console.log('✅ Aportantes encontrados:', aportantes);
    }
    
    console.log('Diagnóstico completado');
    return true;
  } catch (error) {
    console.error('Error en diagnóstico:', error);
    return false;
  }
};

export default runDiagnostic;
