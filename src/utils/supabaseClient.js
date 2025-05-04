const { createClient } = require('@supabase/supabase-js');

// Estas credenciales son públicas y se pueden incluir en el código del cliente
// Para un proyecto en producción, considera usar variables de entorno
const supabaseUrl = 'https://xpwfqfpwhnzuazvfltcx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhwd2ZxZnB3aG56dWF6dmZsdGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMDU0NDQsImV4cCI6MjA2MTg4MTQ0NH0.7fYccKYRbqafy3sQX2cHTtWqtPSdtGfjZvOQnj4jQA8';

// Crear un cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
