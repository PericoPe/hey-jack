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

// --- Mapeo automático para comunidades ---
function mapToDbCommunity(data) {
  return {
    ...data,
    nombre_padre: data.creador_nombre,
    email_padre: data.creador_email,
    whatsapp_padre: data.creador_whatsapp,
  };
}

function mapFromDbCommunity(row) {
  return {
    ...row,
    creador_nombre: row.nombre_padre,
    creador_email: row.email_padre,
    creador_whatsapp: row.whatsapp_padre,
  };
}

// --- Mapeo automático para miembros ---
function mapToDbMember(data) {
  return {
    ...data,
    nombre_padre: data.nombre_padre,
    email_padre: data.email_padre,
    whatsapp_padre: data.whatsapp_padre,
    nombre_hijo: data.nombre_hijo,
    nacimiento_hijo: data.nacimiento_hijo,
    cumple_hijo: data.cumple_hijo,
    perfil: data.perfil,
    monto_individual: data.monto_individual,
    activo: data.activo,
    nombre_comunidad: data.nombre_comunidad,
    id_comunidad: data.id_comunidad,
  };
}

function mapFromDbMember(row) {
  return {
    ...row,
    // Aquí puedes agregar alias si el frontend espera otros nombres
  };
}

// --- Mapeo automático para eventos ---
function mapToDbEvento(data) {
  return {
    ...data,
    // Mapea solo si hay diferencias entre frontend y backend
    // Por ahora, se asume que los nombres coinciden
  };
}

function mapFromDbEvento(row) {
  return {
    ...row,
    // Aquí puedes agregar alias si el frontend espera otros nombres
  };
}

// CRUD Comunidades
export async function createCommunity(data) {
  const mapped = mapToDbCommunity(data);
  delete mapped.creador_nombre;
  delete mapped.creador_email;
  delete mapped.creador_whatsapp;
  const { data: result, error } = await supabase
    .from('comunidades')
    .insert([mapped])
    .select();
  return { result: result?.map(mapFromDbCommunity), error };
}

export async function getCommunities() {
  const { data, error } = await supabase
    .from('comunidades')
    .select('*');
  return { result: data?.map(mapFromDbCommunity), error };
}

export async function updateCommunity(id, updates) {
  const mapped = mapToDbCommunity(updates);
  delete mapped.creador_nombre;
  delete mapped.creador_email;
  delete mapped.creador_whatsapp;
  const { data, error } = await supabase
    .from('comunidades')
    .update(mapped)
    .eq('id', id)
    .select();
  return { result: data?.map(mapFromDbCommunity), error };
}

// CRUD Miembros
export async function createMember(data) {
  const mapped = mapToDbMember(data);
  const { data: result, error } = await supabase
    .from('miembros')
    .insert([mapped])
    .select();
  return { result: result?.map(mapFromDbMember), error };
}

export async function getMembers() {
  const { data, error } = await supabase
    .from('miembros')
    .select('*');
  return { result: data?.map(mapFromDbMember), error };
}

export async function updateMember(id, updates) {
  const mapped = mapToDbMember(updates);
  const { data, error } = await supabase
    .from('miembros')
    .update(mapped)
    .eq('id', id)
    .select();
  return { result: data?.map(mapFromDbMember), error };
}

// CRUD Eventos
export async function createEvento(data) {
  const mapped = mapToDbEvento(data);
  const { data: result, error } = await supabase
    .from('eventos')
    .insert([mapped])
    .select();
  return { result: result?.map(mapFromDbEvento), error };
}

export async function getEventos() {
  const { data, error } = await supabase
    .from('eventos')
    .select('*');
  return { result: data?.map(mapFromDbEvento), error };
}

export async function updateEvento(id, updates) {
  const mapped = mapToDbEvento(updates);
  const { data, error } = await supabase
    .from('eventos')
    .update(mapped)
    .eq('id', id)
    .select();
  return { result: data?.map(mapFromDbEvento), error };
}

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
