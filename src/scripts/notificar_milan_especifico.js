/**
 * Script para enviar una notificación específica por email sobre el cumpleaños de Milan
 * a lic.ceciliadoval@gmail.com
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
    const fechaCumple = new Date(milan.cumple_hijo);
    const hoy = new Date();
    const cumpleEsteAnio = new Date(hoy.getFullYear(), fechaCumple.getMonth(), fechaCumple.getDate());
    
    let diasRestantes;
    if (cumpleEsteAnio < hoy) {
      // Si ya pasó este año, calcular para el próximo año
      const cumpleProximoAnio = new Date(hoy.getFullYear() + 1, fechaCumple.getMonth(), fechaCumple.getDate());
      diasRestantes = Math.floor((cumpleProximoAnio - hoy) / (1000 * 60 * 60 * 24));
    } else {
      diasRestantes = Math.floor((cumpleEsteAnio - hoy) / (1000 * 60 * 60 * 24));
    }
    
    // Asegurarnos de que la fecha se muestre correctamente (18 de mayo)
    const fechaFormateada = `${fechaCumple.getDate()} de ${fechaCumple.toLocaleDateString('es-AR', {month: 'long'})} de ${fechaCumple.getFullYear()}`;
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
 * Función para obtener el evento activo de Milan
 */
async function obtenerEventoMilan(idComunidad) {
  try {
    // Obtener el evento activo para Milan
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
    
    return eventos[0];
  } catch (error) {
    console.error('Error al obtener evento de Milan:', error);
    throw error;
  }
}

/**
 * Función para enviar email específico a lic.ceciliadoval@gmail.com
 */
async function enviarEmailEspecifico(datosCumpleanero, evento) {
  const { miembro, comunidad, fechaCumple, diasRestantes } = datosCumpleanero;
  
  console.log(`Enviando email específico para el cumpleaños de ${miembro.nombre_hijo}...`);
  console.log(`Destinatario: lic.ceciliadoval@gmail.com`);
  console.log(`Fecha de cumpleaños: ${fechaCumple}`);
  console.log(`Días restantes: ${diasRestantes}`);
  
  // Calcular el monto objetivo correcto (asumiendo 9 aportantes)
  const montoIndividual = comunidad.monto_individual || 1500;
  const cantidadAportantes = 9; // Según la memoria, se calculan 9 aportantes
  const montoObjetivo = cantidadAportantes * montoIndividual;
  
  // Datos para la plantilla
  const datosPlantilla = {
    nombre_padre: "Cecilia Doval", // Nombre del destinatario
    nombre_hijo_cumpleañero: miembro.nombre_hijo,
    fecha_cumpleaños: fechaCumple,
    dias_restantes: diasRestantes,
    nombre_comunidad: comunidad.nombre_comunidad || comunidad.institucion,
    nombre_padre_organizador: miembro.nombre_padre,
    monto_aporte: montoIndividual,
    link_pago: `https://heyjack.com.ar/pago/${comunidad.id_comunidad}/${evento.id_evento}/especial`,
    institucion: comunidad.institucion,
    grado: comunidad.grado,
    division: comunidad.division,
    cantidad_miembros: cantidadAportantes,
    monto_objetivo: montoObjetivo
  };
  
  // Generar HTML con los datos
  const htmlEmail = reemplazarVariables(templateSource, datosPlantilla);
  
  // Configurar email
  const mailOptions = {
    from: '"Hey Jack" <notificaciones@heyjack.com.ar>',
    to: 'lic.ceciliadoval@gmail.com',
    subject: `¡${miembro.nombre_hijo} cumple años! Colabora con su regalo`,
    html: htmlEmail
  };
  
  // Enviar email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email enviado a lic.ceciliadoval@gmail.com: ${info.response}`);
    return true;
  } catch (error) {
    console.error(`Error al enviar email a lic.ceciliadoval@gmail.com:`, error);
    throw error;
  }
}

/**
 * Función principal
 */
async function main() {
  try {
    console.log('Iniciando envío de notificación específica para el cumpleaños de Milan...');
    
    // Obtener datos del cumpleañero (Milan)
    const datosCumpleanero = await obtenerDatosCumpleanero();
    console.log('Datos del cumpleañero obtenidos:', datosCumpleanero.miembro.nombre_hijo);
    
    // Obtener evento activo de Milan
    const eventoMilan = await obtenerEventoMilan(datosCumpleanero.comunidad.id_comunidad);
    console.log('Evento activo de Milan obtenido:', eventoMilan.id_evento);
    
    // Enviar email específico
    console.time('Tiempo de envío de email');
    await enviarEmailEspecifico(datosCumpleanero, eventoMilan);
    console.timeEnd('Tiempo de envío de email');
    
    console.log('Proceso completado. Se envió el email específico a lic.ceciliadoval@gmail.com');
  } catch (error) {
    console.error('Error en el proceso principal:', error);
  }
}

// Ejecutar la función principal
main();
