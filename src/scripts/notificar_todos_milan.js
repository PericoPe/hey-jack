/**
 * Script para enviar notificaciones por email a todos los aportantes para el cumpleaños de Milan
 * Este script utiliza la plantilla HTML creada y envía emails a todos los miembros que deben aportar
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
console.log('URL de Supabase:', supabaseUrl ? 'Configurada' : 'No configurada');

// Configuración del transporte de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});
console.log('Credenciales de Gmail:', process.env.GMAIL_USER ? 'Configuradas' : 'No configuradas');

// Leer la plantilla HTML
const templatePath = path.join(__dirname, '../../email_template_cumpleanos.html');
const templateSource = fs.readFileSync(templatePath, 'utf8');

/**
 * Función para reemplazar variables en la plantilla
 */
function reemplazarVariables(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

/**
 * Función para obtener los datos del cumpleañero (Milan)
 */
async function obtenerDatosCumpleanero() {
  try {
    // Buscar a Milan en la tabla miembros
    const { data: milanData, error } = await supabase
      .from('miembros')
      .select('*, comunidades(*)')
      .ilike('nombre_hijo', '%Milan%')
      .limit(1);
    
    if (error) throw error;
    if (!milanData || milanData.length === 0) {
      throw new Error('No se encontró a Milan en la base de datos');
    }
    
    const milan = milanData[0];
    const comunidad = milan.comunidades;
    
    // Calcular días restantes para el cumpleaños
    // Asegurarnos de que la fecha sea correcta (18 de mayo de 2025)
    // Nota: al crear un objeto Date con una fecha en formato ISO (YYYY-MM-DD), JavaScript la interpreta en UTC
    // Por eso necesitamos ajustar para obtener la fecha correcta en hora local
    const fechaCumpleStr = milan.cumple_hijo; // Formato: '2025-05-18'
    console.log('Fecha de cumpleaños en la base de datos:', fechaCumpleStr);
    
    // Extraer los componentes de la fecha manualmente para evitar problemas de zona horaria
    const [year, month, day] = fechaCumpleStr.split('-').map(num => parseInt(num, 10));
    // Nota: en JavaScript, los meses van de 0 a 11, por lo que restamos 1 al mes
    const fechaCumple = new Date(year, month - 1, day);
    console.log('Fecha de cumpleaños procesada:', fechaCumple.toISOString());
    
    const hoy = new Date();
    // Crear fecha de cumpleaños para este año (para comparar)
    const cumpleEsteAnio = new Date(hoy.getFullYear(), month - 1, day);
    
    let diasRestantes;
    if (cumpleEsteAnio < hoy) {
      // Si ya pasó este año, calcular para el próximo año
      const cumpleProximoAnio = new Date(hoy.getFullYear() + 1, month - 1, day);
      diasRestantes = Math.floor((cumpleProximoAnio - hoy) / (1000 * 60 * 60 * 24));
    } else {
      diasRestantes = Math.floor((cumpleEsteAnio - hoy) / (1000 * 60 * 60 * 24));
    }
    
    // Formatear la fecha para mostrarla correctamente (18 de mayo de 2025)
    const fechaFormateada = `${day} de ${new Date(year, month - 1, day).toLocaleDateString('es-AR', {month: 'long'})} de ${year}`;
    console.log('Fecha de cumpleaños formateada:', fechaFormateada);
    
    return {
      miembro: milan,
      comunidad: comunidad,
      fechaCumple: fechaFormateada,
      diasRestantes: diasRestantes
    };
  } catch (error) {
    console.error('Error al obtener datos del cumpleañero:', error);
    throw error;
  }
}

/**
 * Función para obtener los aportantes para el evento de Milan
 */
async function obtenerAportantes(idComunidad, emailPadreCumpleanero) {
  try {
    // Primero obtener el evento activo para Milan
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('id_comunidad', idComunidad)
      .ilike('nombre_hijo', '%Milan%')
      .limit(1);
    
    if (eventosError) throw eventosError;
    if (!eventos || eventos.length === 0) {
      throw new Error('No se encontró un evento activo para Milan');
    }
    
    const idEvento = eventos[0].id_evento;
    
    // Obtener los aportantes para este evento
    const { data: aportantes, error: aportantesError } = await supabase
      .from('eventos_activos_aportantes')
      .select('*')
      .eq('id_evento', idEvento);
    
    if (aportantesError) throw aportantesError;
    
    // Filtrar los aportantes: excluir al padre del cumpleañero y solo incluir los que no han pagado ni han sido notificados
    const aportantesFiltrados = (aportantes || []).filter(aportante => {
      return aportante.email_padre !== emailPadreCumpleanero && 
             (!aportante.pagado || aportante.pagado === false) && 
             (!aportante.notificado || aportante.notificado === false);
    });
    
    console.log(`Total de aportantes en la base: ${aportantes?.length || 0}`);
    console.log(`Aportantes filtrados (excluyendo al padre del cumpleañero): ${aportantesFiltrados.length}`);
    
    return { aportantes: aportantesFiltrados, evento: eventos[0] };
  } catch (error) {
    console.error('Error al obtener aportantes:', error);
    throw error;
  }
}

/**
 * Función para marcar aportantes como notificados
 */
async function marcarComoNotificados(aportantesIds) {
  if (!aportantesIds || aportantesIds.length === 0) return;
  
  try {
    const { error } = await supabase
      .from('eventos_activos_aportantes')
      .update({ notificado: true })
      .in('id', aportantesIds);
    
    if (error) throw error;
    console.log(`${aportantesIds.length} aportantes marcados como notificados`);
  } catch (error) {
    console.error('Error al marcar aportantes como notificados:', error);
    throw error;
  }
}

/**
 * Función para enviar emails a los aportantes
 */
async function enviarEmails(datosCumpleanero, datosAportantes) {
  const { miembro, comunidad, fechaCumple, diasRestantes } = datosCumpleanero;
  const { aportantes, evento } = datosAportantes;
  
  console.log(`Enviando emails para el cumpleaños de ${miembro.nombre_hijo}...`);
  console.log(`Comunidad: ${comunidad.nombre_comunidad || comunidad.institucion}`);
  console.log(`Aportantes pendientes: ${aportantes.length}`);
  console.log(`Padre del cumpleañero (NO APORTA): ${miembro.nombre_padre} (${miembro.email_padre})`);
  console.log(`Fecha de cumpleaños: ${fechaCumple}`);
  console.log(`Días restantes: ${diasRestantes}`);
  
  // Lista de IDs de aportantes notificados exitosamente
  const aportantesNotificados = [];
  
  // Calcular el monto objetivo correcto (aportantes * monto individual)
  const montoIndividual = comunidad.monto_individual || 1500;
  const montoObjetivo = aportantes.length * montoIndividual;
  
  // Enviar email a cada aportante
  for (const aportante of aportantes) {
    // Datos para la plantilla
    const datosPlantilla = {
      nombre_padre: aportante.nombre_padre,
      nombre_hijo_cumpleañero: miembro.nombre_hijo,
      fecha_cumpleaños: fechaCumple,
      dias_restantes: diasRestantes,
      nombre_comunidad: comunidad.nombre_comunidad || comunidad.institucion,
      nombre_padre_organizador: miembro.nombre_padre,
      monto_aporte: montoIndividual,
      link_pago: `https://heyjack.com.ar/pago/${comunidad.id_comunidad}/${evento.id_evento}/${aportante.id}`,
      institucion: comunidad.institucion,
      grado: comunidad.grado,
      division: comunidad.division,
      cantidad_miembros: aportantes.length,
      monto_objetivo: montoObjetivo
    };
    
    // Generar HTML con los datos
    const htmlEmail = reemplazarVariables(templateSource, datosPlantilla);
    
    // Configurar email
    const mailOptions = {
      from: '"Hey Jack" <notificaciones@heyjack.com.ar>',
      to: aportante.email_padre,
      subject: `¡${miembro.nombre_hijo} cumple años! Colabora con su regalo`,
      html: htmlEmail
    };
    
    // Enviar email
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email enviado a ${aportante.nombre_padre} (${aportante.email_padre}): ${info.response}`);
      aportantesNotificados.push(aportante.id);
      
      // Reducimos el tiempo de espera entre envíos para que sea más rápido
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error al enviar email a ${aportante.nombre_padre} (${aportante.email_padre}):`, error);
    }
  }
  
  // Marcar aportantes como notificados en la base de datos
  if (aportantesNotificados.length > 0) {
    await marcarComoNotificados(aportantesNotificados);
  }
  
  console.log(`Total de emails enviados: ${aportantesNotificados.length}`);
  return aportantesNotificados.length;
}

/**
 * Función principal
 */
async function main() {
  try {
    console.log('Iniciando envío de notificaciones para el cumpleaños de Milan...');
    
    // Obtener datos del cumpleañero (Milan)
    const datosCumpleanero = await obtenerDatosCumpleanero();
    console.log('Datos del cumpleañero obtenidos:', datosCumpleanero.miembro.nombre_hijo);
    
    // Obtener aportantes para el evento (excluyendo al padre del cumpleañero)
    const datosAportantes = await obtenerAportantes(datosCumpleanero.comunidad.id_comunidad, datosCumpleanero.miembro.email_padre);
    console.log(`Se encontraron ${datosAportantes.aportantes.length} aportantes pendientes`);
    
    if (datosAportantes.aportantes.length === 0) {
      console.log('No hay aportantes pendientes de notificar');
      return;
    }
    
    // Enviar emails a los aportantes
    console.time('Tiempo de envío de emails');
    const emailsEnviados = await enviarEmails(datosCumpleanero, datosAportantes);
    console.timeEnd('Tiempo de envío de emails');
    
    console.log(`Proceso completado. Se enviaron ${emailsEnviados} emails de ${datosAportantes.aportantes.length} aportantes pendientes.`);
  } catch (error) {
    console.error('Error en el proceso principal:', error);
  }
}

// Ejecutar la función principal
main();
