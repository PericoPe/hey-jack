require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 4000; // Puedes cambiar el puerto si lo necesitas

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

async function enviarNotificaciones() {
  const fechaObjetivo = new Date();
  fechaObjetivo.setDate(fechaObjetivo.getDate() + 15);
  const fechaStr = fechaObjetivo.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('eventos_activos')
    .select(`
      id_evento,
      nombre_hijo,
      fecha_evento,
      nombre_comunidad,
      eventos_activos_aportantes (
        email_padre,
        nombre_padre,
        monto_individual,
        notificacion_email
      )
    `)
    .eq('fecha_evento', fechaStr);

  if (error) {
    console.error('Error consultando Supabase:', error);
    return { enviados: 0, error };
  }

  let enviados = 0;
  for (const evento of data) {
    for (const aportante of evento.eventos_activos_aportantes) {
      if (!aportante.notificacion_email) {
        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: aportante.email_padre,
          subject: `¡Aportá para el cumpleaños de ${evento.nombre_hijo}!`,
          text: `
Hola ${aportante.nombre_padre}:

Te recordamos que en 15 días es el cumpleaños de ${evento.nombre_hijo} (${evento.fecha_evento}) en la comunidad ${evento.nombre_comunidad}.
Por favor, realiza tu aporte de $${aportante.monto_individual} lo antes posible.

¡Gracias!
          `
        };

        try {
          await transporter.sendMail(mailOptions);
          enviados++;
          console.log(`Email enviado a ${aportante.email_padre}`);

          await supabase
            .from('eventos_activos_aportantes')
            .update({ notificacion_email: true, fecha_notificacion_email: new Date().toISOString() })
            .match({ email_padre: aportante.email_padre, id_evento: evento.id_evento });
        } catch (err) {
          console.error(`Error enviando email a ${aportante.email_padre}:`, err);
        }
      }
    }
  }

  return { enviados, error: null };
}

// Endpoint para disparar el envío manual desde el panel admin
app.post('/enviar-notificaciones', async (req, res) => {
  const resultado = await enviarNotificaciones();
  if (resultado.error) {
    return res.status(500).json({ ok: false, error: resultado.error });
  }
  res.json({ ok: true, enviados: resultado.enviados });
});

// Para probar manualmente desde la terminal
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor de notificaciones corriendo en http://localhost:${PORT}`);
    console.log('Puedes hacer un POST a /enviar-notificaciones para disparar el envío manual.');
  });
}

module.exports = { enviarNotificaciones }; // Por si luego quieres importar la función
