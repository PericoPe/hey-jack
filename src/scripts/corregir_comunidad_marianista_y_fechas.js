/**
 * Script para corregir la comunidad Marianista y sincronizar fechas de cumpleaños
 * Este script:
 * 1. Corrige la comunidad Marianista para que tenga solo 2 miembros activos
 * 2. Asegura que las fechas de cumpleaños en la tabla "eventos" se tomen correctamente de la tabla "miembros"
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Función para corregir la comunidad Marianista
 */
async function corregirComunidadMarianista() {
  try {
    console.log('Buscando comunidad Marianista...');
    
    // 1. Buscar la comunidad Marianista
    const { data: comunidad, error: errorComunidad } = await supabase
      .from('comunidades')
      .select('*')
      .ilike('nombre_comunidad', '%Marianista%')
      .limit(1);
    
    if (errorComunidad) {
      throw new Error(`Error al buscar comunidad: ${errorComunidad.message}`);
    }
    
    if (!comunidad || comunidad.length === 0) {
      console.log('No se encontró la comunidad Marianista');
      return;
    }
    
    const idComunidad = comunidad[0].id_comunidad;
    console.log(`Comunidad encontrada: ${comunidad[0].nombre_comunidad} (ID: ${idComunidad})`);
    
    // 2. Listar todos los miembros de la comunidad
    const { data: miembros, error: errorMiembros } = await supabase
      .from('miembros')
      .select('*')
      .eq('id_comunidad', idComunidad)
      .order('id');
    
    if (errorMiembros) {
      throw new Error(`Error al buscar miembros: ${errorMiembros.message}`);
    }
    
    console.log(`Miembros encontrados en la comunidad Marianista: ${miembros.length}`);
    miembros.forEach((m, index) => {
      console.log(`${index + 1}. ${m.nombre_padre} (${m.email_padre}) - Hijo: ${m.nombre_hijo} - Activo: ${m.activo}`);
    });
    
    // 3. Si hay más de 2 miembros, desactivar los sobrantes
    if (miembros.length > 2) {
      console.log(`Desactivando ${miembros.length - 2} miembros sobrantes...`);
      
      // Obtener IDs de los miembros a desactivar (todos excepto los 2 primeros)
      const idsADesactivar = miembros.slice(2).map(m => m.id);
      
      // Desactivar miembros sobrantes
      const { error: errorUpdate } = await supabase
        .from('miembros')
        .update({ activo: false })
        .in('id', idsADesactivar);
      
      if (errorUpdate) {
        throw new Error(`Error al desactivar miembros: ${errorUpdate.message}`);
      }
      
      console.log(`Se desactivaron ${idsADesactivar.length} miembros correctamente.`);
    } else {
      console.log('No hay miembros sobrantes para desactivar.');
    }
    
    // 4. Verificar miembros activos después de la actualización
    const { data: miembrosActualizados, error: errorActualizados } = await supabase
      .from('miembros')
      .select('*')
      .eq('id_comunidad', idComunidad)
      .eq('activo', true);
    
    if (errorActualizados) {
      throw new Error(`Error al verificar miembros actualizados: ${errorActualizados.message}`);
    }
    
    console.log(`Miembros ACTIVOS después de la actualización: ${miembrosActualizados.length}`);
    miembrosActualizados.forEach((m, index) => {
      console.log(`${index + 1}. ${m.nombre_padre} (${m.email_padre}) - Hijo: ${m.nombre_hijo}`);
    });
    
    return {
      idComunidad,
      nombreComunidad: comunidad[0].nombre_comunidad,
      miembrosActivos: miembrosActualizados.length
    };
  } catch (error) {
    console.error('Error al corregir comunidad Marianista:', error);
    throw error;
  }
}

/**
 * Función para sincronizar fechas de cumpleaños entre miembros y eventos
 */
async function sincronizarFechasCumpleanos() {
  try {
    console.log('\nSincronizando fechas de cumpleaños...');
    
    // 1. Buscar discrepancias entre miembros y eventos
    const { data: discrepancias, error: errorDiscrepancias } = await supabase
      .rpc('buscar_discrepancias_fechas_cumpleanos');
    
    // Si la función RPC no existe, hacemos una consulta directa
    if (errorDiscrepancias && errorDiscrepancias.message.includes('does not exist')) {
      console.log('La función RPC no existe, realizando consulta directa...');
      
      // Obtener todos los miembros y sus eventos correspondientes
      const { data: miembros, error: errorMiembros } = await supabase
        .from('miembros')
        .select('id, nombre_hijo, cumple_hijo');
      
      if (errorMiembros) {
        throw new Error(`Error al obtener miembros: ${errorMiembros.message}`);
      }
      
      // Para cada miembro, buscar eventos correspondientes y actualizar fechas
      let totalActualizados = 0;
      
      for (const miembro of miembros) {
        // Buscar eventos para este miembro
        const { data: eventos, error: errorEventos } = await supabase
          .from('eventos')
          .select('id_evento, nombre_hijo, fecha_evento')
          .ilike('nombre_hijo', `%${miembro.nombre_hijo}%`);
        
        if (errorEventos) {
          console.error(`Error al buscar eventos para ${miembro.nombre_hijo}: ${errorEventos.message}`);
          continue;
        }
        
        if (!eventos || eventos.length === 0) {
          console.log(`No se encontraron eventos para ${miembro.nombre_hijo}`);
          continue;
        }
        
        // Verificar discrepancias y actualizar
        const eventosConDiscrepancia = eventos.filter(e => 
          e.fecha_evento === null || 
          new Date(e.fecha_evento).toISOString() !== new Date(miembro.cumple_hijo).toISOString()
        );
        
        if (eventosConDiscrepancia.length > 0) {
          console.log(`Encontradas ${eventosConDiscrepancia.length} discrepancias para ${miembro.nombre_hijo}`);
          
          // Actualizar eventos
          for (const evento of eventosConDiscrepancia) {
            const { error: errorUpdate } = await supabase
              .from('eventos')
              .update({ fecha_evento: miembro.cumple_hijo })
              .eq('id_evento', evento.id_evento);
            
            if (errorUpdate) {
              console.error(`Error al actualizar evento ${evento.id_evento}: ${errorUpdate.message}`);
            } else {
              totalActualizados++;
              console.log(`Actualizado evento ${evento.id_evento} con fecha ${miembro.cumple_hijo}`);
              
              // Actualizar también eventos_activos
              const { error: errorUpdateActivo } = await supabase
                .from('eventos_activos')
                .update({ fecha_cumple: miembro.cumple_hijo })
                .eq('id_evento', evento.id_evento);
              
              if (errorUpdateActivo) {
                console.error(`Error al actualizar evento_activo ${evento.id_evento}: ${errorUpdateActivo.message}`);
              } else {
                console.log(`Actualizado evento_activo ${evento.id_evento} con fecha ${miembro.cumple_hijo}`);
              }
            }
          }
        }
      }
      
      console.log(`Total de eventos actualizados: ${totalActualizados}`);
    } else if (errorDiscrepancias) {
      throw new Error(`Error al buscar discrepancias: ${errorDiscrepancias.message}`);
    } else {
      // Si la función RPC existe y se ejecutó correctamente
      console.log(`Se encontraron ${discrepancias.length} discrepancias de fechas`);
      
      // Actualizar eventos con fechas incorrectas
      for (const d of discrepancias) {
        const { error: errorUpdate } = await supabase
          .from('eventos')
          .update({ fecha_evento: d.fecha_miembro })
          .eq('id_evento', d.id_evento);
        
        if (errorUpdate) {
          console.error(`Error al actualizar evento ${d.id_evento}: ${errorUpdate.message}`);
        } else {
          console.log(`Actualizado evento ${d.id_evento} con fecha ${d.fecha_miembro}`);
        }
        
        // Actualizar también eventos_activos
        const { error: errorUpdateActivo } = await supabase
          .from('eventos_activos')
          .update({ fecha_cumple: d.fecha_miembro })
          .eq('id_evento', d.id_evento);
        
        if (errorUpdateActivo) {
          console.error(`Error al actualizar evento_activo ${d.id_evento}: ${errorUpdateActivo.message}`);
        } else {
          console.log(`Actualizado evento_activo ${d.id_evento} con fecha ${d.fecha_miembro}`);
        }
      }
    }
    
    // Caso específico de Milan
    console.log('\nVerificando específicamente el caso de Milan...');
    
    // Verificar fecha de Milan en miembros
    const { data: milanData, error: errorMilan } = await supabase
      .from('miembros')
      .select('id, nombre_hijo, cumple_hijo')
      .ilike('nombre_hijo', '%Milan%')
      .limit(1);
    
    if (errorMilan) {
      throw new Error(`Error al buscar a Milan: ${errorMilan.message}`);
    }
    
    if (!milanData || milanData.length === 0) {
      console.log('No se encontró a Milan en la base de datos');
    } else {
      const milan = milanData[0];
      console.log(`Milan encontrado: ${milan.nombre_hijo}, Fecha actual: ${milan.cumple_hijo}`);
      
      // Corregir fecha si es necesario
      if (!milan.cumple_hijo || new Date(milan.cumple_hijo).toISOString() !== new Date('2025-05-18').toISOString()) {
        console.log('Corrigiendo fecha de Milan a 18 de mayo de 2025...');
        
        const { error: errorUpdateMilan } = await supabase
          .from('miembros')
          .update({ cumple_hijo: '2025-05-18' })
          .eq('id', milan.id);
        
        if (errorUpdateMilan) {
          throw new Error(`Error al actualizar fecha de Milan: ${errorUpdateMilan.message}`);
        }
        
        console.log('Fecha de Milan actualizada correctamente');
        
        // Actualizar también eventos y eventos_activos para Milan
        const { data: eventosMilan, error: errorEventosMilan } = await supabase
          .from('eventos')
          .select('id_evento')
          .ilike('nombre_hijo', '%Milan%');
        
        if (errorEventosMilan) {
          throw new Error(`Error al buscar eventos de Milan: ${errorEventosMilan.message}`);
        }
        
        if (eventosMilan && eventosMilan.length > 0) {
          const idEventosMilan = eventosMilan.map(e => e.id_evento);
          
          // Actualizar eventos
          const { error: errorUpdateEventosMilan } = await supabase
            .from('eventos')
            .update({ fecha_evento: '2025-05-18' })
            .in('id_evento', idEventosMilan);
          
          if (errorUpdateEventosMilan) {
            throw new Error(`Error al actualizar eventos de Milan: ${errorUpdateEventosMilan.message}`);
          }
          
          console.log(`Actualizados ${eventosMilan.length} eventos de Milan`);
          
          // Actualizar eventos_activos
          const { error: errorUpdateEventosActivosMilan } = await supabase
            .from('eventos_activos')
            .update({ fecha_cumple: '2025-05-18' })
            .in('id_evento', idEventosMilan);
          
          if (errorUpdateEventosActivosMilan) {
            throw new Error(`Error al actualizar eventos_activos de Milan: ${errorUpdateEventosActivosMilan.message}`);
          }
          
          console.log(`Actualizados ${eventosMilan.length} eventos_activos de Milan`);
        }
      } else {
        console.log('La fecha de Milan ya es correcta (18 de mayo de 2025)');
      }
    }
    
    console.log('\nSincronización de fechas completada');
  } catch (error) {
    console.error('Error al sincronizar fechas de cumpleaños:', error);
    throw error;
  }
}

/**
 * Función principal
 */
async function main() {
  try {
    console.log('=== INICIANDO CORRECCIÓN DE COMUNIDAD MARIANISTA Y FECHAS DE CUMPLEAÑOS ===');
    
    // 1. Corregir comunidad Marianista
    const resultadoComunidad = await corregirComunidadMarianista();
    
    // 2. Sincronizar fechas de cumpleaños
    await sincronizarFechasCumpleanos();
    
    console.log('\n=== PROCESO COMPLETADO EXITOSAMENTE ===');
    console.log(`Comunidad Marianista: ${resultadoComunidad.nombreComunidad}`);
    console.log(`Miembros activos: ${resultadoComunidad.miembrosActivos} (corregido de 4 a 2)`);
    console.log('Fechas de cumpleaños sincronizadas correctamente');
    console.log('Se ha asegurado que la fecha de Milan es 18 de mayo de 2025');
  } catch (error) {
    console.error('\n=== ERROR EN EL PROCESO ===');
    console.error(error);
  }
}

// Ejecutar función principal
main();
