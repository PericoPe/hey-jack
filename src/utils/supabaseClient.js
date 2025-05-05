import { createClient } from '@supabase/supabase-js';

// Estas credenciales son públicas y se pueden incluir en el código del cliente
// Para un proyecto en producción, considera usar variables de entorno
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

// Crear un cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
