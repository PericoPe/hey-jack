import { createClient } from '@supabase/supabase-js';

// Estas credenciales son públicas y se pueden incluir en el código del cliente
// Para un proyecto en producción, considera usar variables de entorno
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

// Opciones adicionales para el cliente de Supabase
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
};

// Crear un cliente de Supabase con opciones mejoradas
const supabase = createClient(supabaseUrl, supabaseKey, options);

// Función para verificar la conexión
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('comunidades').select('count(*)').limit(1);
    if (error) throw error;
    console.log('Conexión a Supabase exitosa:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error al conectar con Supabase:', error);
    return { success: false, error };
  }
};

export default supabase;
