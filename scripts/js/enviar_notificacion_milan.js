/**
 * Script para enviar notificaciones por email para el cumpleaños de Milan
 * Este script utiliza la plantilla HTML creada y envía emails de prueba
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://xxxxxxxxxxxxxxxxxxxxxxxx.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'tu-clave-de-supabase';
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración del transporte de email (cambia estos valores con tus credenciales)
const transporter = nodemailer.createTransport({
  service: 'gmail',  // O el servicio que prefieras: 'hotmail', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER || 'tu-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'tu-contraseña-o-app-password'
  }
});

// Leer la plantilla HTML
const templatePath = path.join(__dirname, 'email_template_cumpleanos.html');
const templateSource = fs.readFileSync(templatePath, 'utf8');
const template = handlebars.compile(templateSource);

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
    
    // Formatear fecha para mostrar
    const fechaFormateada = fechaCumple.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
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
  
  // Calcular monto individual (o usar valor predeterminado)
  const montoIndividual = comunidad.monto_individual || 1500;
  
  // Calcular monto objetivo (miembros activos * monto individual)
  const montoObjetivo = miembros.length * montoIndividual;
  
  console.log(`Enviando emails para el cumpleaños de ${miembro.nombre_hijo}...`);
  console.log(`Comunidad: ${comunidad.nombre_comunidad || comunidad.institucion}`);
  console.log(`Miembros activos: ${miembros.length}`);
  console.log(`Monto individual: $${montoIndividual}`);
  console.log(`Monto objetivo: $${montoObjetivo}`);
  
  // Array para almacenar promesas de envío de emails
  const promesasEnvio = [];
  
  // Enviar email a cada miembro (excepto al padre del cumpleañero)
  for (const destinatario of miembros) {
    // No enviar email al padre del cumpleañero
    if (destinatario.email_padre === miembro.email_padre) {
      console.log(`Saltando al padre del cumpleañero: ${destinatario.nombre_padre} (${destinatario.email_padre})`);
      continue;
    }
    
    // Datos para la plantilla
    const datosPlantilla = {
      nombre_padre: destinatario.nombre_padre,
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
    const htmlEmail = template(datosPlantilla);
    
    // Configurar email
    const mailOptions = {
      from: '"Hey Jack" <notificaciones@heyjack.com.ar>',
      to: destinatario.email_padre,
      subject: `¡${miembro.nombre_hijo} cumple años! Colabora con su regalo`,
      html: htmlEmail
    };
    
    // Agregar promesa de envío al array
    promesasEnvio.push(
      new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(`Error al enviar email a ${destinatario.email_padre}:`, error);
            reject(error);
          } else {
            console.log(`Email enviado a ${destinatario.nombre_padre} (${destinatario.email_padre}): ${info.response}`);
            resolve(info);
          }
        });
      })
    );
    
    // Esperar un poco entre envíos para no sobrecargar el servidor
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Esperar a que se completen todos los envíos
  try {
    await Promise.all(promesasEnvio);
    console.log('Todos los emails han sido enviados correctamente');
    return true;
  } catch (error) {
    console.error('Error al enviar algunos emails:', error);
    return false;
  }
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
    
    // Obtener miembros de la comunidad
    const miembros = await obtenerMiembrosComunidad(datosCumpleanero.comunidad.id_comunidad);
    console.log(`Se encontraron ${miembros.length} miembros en la comunidad`);
    
    // Enviar emails
    const resultado = await enviarEmails(datosCumpleanero, miembros);
    
    if (resultado) {
      console.log('Proceso completado exitosamente');
    } else {
      console.log('El proceso completó con algunos errores');
    }
  } catch (error) {
    console.error('Error en el proceso principal:', error);
  }
}

// Ejecutar la función principal
main();
