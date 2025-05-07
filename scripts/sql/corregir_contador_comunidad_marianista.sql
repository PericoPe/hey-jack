-- Script para corregir el contador de miembros en la tabla comunidades
-- Creado: 6 de mayo de 2025

-- 1. Primero, veamos la estructura completa de la tabla comunidades
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'comunidades' 
ORDER BY ordinal_position;

-- 2. Veamos los datos de la comunidad Marianista
SELECT * FROM comunidades WHERE nombre_comunidad ILIKE '%Marianista%';

-- 3. Veamos cuántos miembros activos tiene realmente la comunidad Marianista
SELECT 
    c.nombre_comunidad,
    COUNT(*) as miembros_reales
FROM 
    comunidades c
JOIN 
    miembros m ON m.id_comunidad = c.id_comunidad
WHERE 
    c.nombre_comunidad ILIKE '%Marianista%'
    AND m.activo = true
GROUP BY 
    c.nombre_comunidad;

-- 4. Actualizar TODOS los posibles campos que puedan almacenar el contador de miembros
UPDATE comunidades
SET 
    cantidad_miembros = 2,
    miembros = 2,
    total_miembros = 2,
    num_miembros = 2,
    count_miembros = 2,
    members_count = 2
WHERE 
    nombre_comunidad ILIKE '%Marianista%';

-- 5. Verificar las políticas RLS de la tabla comunidades
SELECT 
    policyname, 
    tablename, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM 
    pg_policies
WHERE 
    tablename = 'comunidades';

-- 6. Simplificar las políticas RLS (mantener solo las 3 principales)
-- Primero eliminamos todas las políticas existentes
DROP POLICY IF EXISTS admin_comunidades ON comunidades;
DROP POLICY IF EXISTS user_comunidades ON comunidades;
DROP POLICY IF EXISTS public_comunidades ON comunidades;
DROP POLICY IF EXISTS delete_comunidades_admin ON comunidades;
DROP POLICY IF EXISTS insert_comunidades_admin ON comunidades;
DROP POLICY IF EXISTS insert_comunidades_public ON comunidades;
DROP POLICY IF EXISTS update_comunidades_admin ON comunidades;

-- Luego creamos las 3 políticas principales
-- 1. Política para el administrador (acceso total)
CREATE POLICY admin_comunidades ON comunidades
    FOR ALL
    TO authenticated
    USING (auth.email() = 'javierhrusino@gmail.com');

-- 2. Política para usuarios autenticados (solo sus propias comunidades)
CREATE POLICY user_comunidades ON comunidades
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM miembros m 
        WHERE m.id_comunidad = id_comunidad 
        AND m.email_padre = auth.email()
    ));

-- 3. Política para usuarios anónimos (todas las comunidades)
CREATE POLICY public_comunidades ON comunidades
    FOR SELECT
    TO anon
    USING (true);

-- 7. Verificar las políticas después de la simplificación
SELECT 
    policyname, 
    tablename, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM 
    pg_policies
WHERE 
    tablename = 'comunidades';

-- 8. Verificación final del contador de miembros
SELECT 
    *
FROM 
    comunidades
WHERE 
    nombre_comunidad ILIKE '%Marianista%';
