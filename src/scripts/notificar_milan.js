/**
 * Script para enviar notificaciones por email para el cumpleaños de Milan
 * Este script utiliza la plantilla HTML creada y envía emails de prueba
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
 * Función para obtener los miembros de la comunidad (para enviar emails)
 */
async function obtenerMiembrosComunidad(idComunidad) {
  try {
    const { data: miembros, error } = await supabase
      .from('miembros')
      .select('*')
      .eq('id_comunidad', idComunidad)
      .eq('activo', true);
    
    if (error) throw error;
    return miembros || [];
  } catch (error) {
    console.error('Error al obtener miembros de la comunidad:', error);
    throw error;
  }
}

/**
 * Función para enviar emails a los miembros de la comunidad
 */
async function enviarEmails(datosCumpleanero, miembros) {
  const { miembro, comunidad, fechaCumple, diasRestantes } = datosCumpleanero;
  console.log('Datos del miembro:', miembro);
  
  // Calcular monto individual (o usar valor predeterminado)
  const montoIndividual = comunidad.monto_individual || 1500;
  
  // Calcular monto objetivo (miembros activos - 1) * monto individual (excluyendo al padre del cumpleañero)
  const montoObjetivo = (miembros.length - 1) * montoIndividual;
  
  console.log(`Miembros totales: ${miembros.length}, Aportantes (excluyendo al padre): ${miembros.length - 1}`);
  
  console.log(`Enviando emails para el cumpleaños de ${miembro.nombre_hijo}...`);
  console.log(`Comunidad: ${comunidad.nombre_comunidad || comunidad.institucion}`);
  console.log(`Miembros activos: ${miembros.length}`);
  console.log(`Monto individual: $${montoIndividual}`);
  console.log(`Monto objetivo: $${montoObjetivo}`);
  
  // Para prueba, solo enviaremos al administrador (javierhrusino@gmail.com)
  const emailAdmin = 'javierhrusino@gmail.com';
  
  console.log(`Padre del cumpleañero: ${miembro.nombre_padre} (${miembro.email_padre}) - NO APORTA`);
  
  // Datos para la plantilla
  const datosPlantilla = {
    nombre_padre: 'Administrador',
    nombre_hijo_cumpleañero: miembro.nombre_hijo,
    fecha_cumpleaños: fechaCumple,
    dias_restantes: diasRestantes,
    nombre_comunidad: comunidad.nombre_comunidad || comunidad.institucion,
    nombre_padre_organizador: miembro.nombre_padre,
    monto_aporte: montoIndividual,
    link_pago: `https://heyjack.com.ar/pago/${comunidad.id_comunidad}/${miembro.id_miembro}`,
    institucion: comunidad.institucion,
    grado: comunidad.grado,
    division: comunidad.division,
    cantidad_miembros: miembros.length,
    monto_objetivo: montoObjetivo
  };
  
  // Generar HTML con los datos
  const htmlEmail = reemplazarVariables(templateSource, datosPlantilla);
  
  // Configurar email
  const mailOptions = {
    from: '"Hey Jack" <notificaciones@heyjack.com.ar>',
    to: emailAdmin,
    subject: `[PRUEBA] ¡${miembro.nombre_hijo} cumple años! Colabora con su regalo`,
    html: htmlEmail
  };
  
  // Enviar email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email de prueba enviado a ${emailAdmin}: ${info.response}`);
    return true;
  } catch (error) {
    console.error(`Error al enviar email a ${emailAdmin}:`, error);
    return false;
  }
}

/**
 * Función principal
 */
async function main() {
  try {
    console.log('Iniciando envío de notificación de prueba para el cumpleaños de Milan...');
    
    // Obtener datos del cumpleañero (Milan)
    const datosCumpleanero = await obtenerDatosCumpleanero();
    console.log('Datos del cumpleañero obtenidos:', datosCumpleanero.miembro.nombre_hijo);
    
    // Obtener miembros de la comunidad
    const miembros = await obtenerMiembrosComunidad(datosCumpleanero.comunidad.id_comunidad);
    console.log(`Se encontraron ${miembros.length} miembros en la comunidad`);
    
    // Enviar email de prueba
    const resultado = await enviarEmails(datosCumpleanero, miembros);
    
    if (resultado) {
      console.log('Email de prueba enviado exitosamente');
    } else {
      console.log('Error al enviar email de prueba');
    }
  } catch (error) {
    console.error('Error en el proceso principal:', error);
  }
}

// Ejecutar la función principal
main();
