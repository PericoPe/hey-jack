-- Script para corregir las políticas de seguridad RLS en la tabla comunidades
-- Este script debe ejecutarse en Supabase SQL Editor

-- 1. Primero habilitar RLS en la tabla comunidades
ALTER TABLE comunidades ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar todas las políticas existentes para evitar conflictos
DROP POLICY IF EXISTS admin_comunidades ON comunidades;
DROP POLICY IF EXISTS user_comunidades ON comunidades;
DROP POLICY IF EXISTS public_comunidades ON comunidades;
DROP POLICY IF EXISTS "Acceso público total a comunidades" ON comunidades;

-- 3. Crear políticas claras y sin conflictos

-- Política para administrador (acceso total)
CREATE POLICY admin_comunidades ON comunidades
    FOR ALL
    TO authenticated
    USING (auth.email() = 'javierhrusino@gmail.com');

-- Política para usuarios normales (solo lectura de sus propias comunidades)
CREATE POLICY user_comunidades ON comunidades
    FOR SELECT
    TO authenticated
    USING (
        auth.email() != 'javierhrusino@gmail.com' AND
        EXISTS (
            SELECT 1 FROM miembros
            WHERE miembros.id_comunidad = comunidades.id_comunidad
            AND miembros.email_padre = auth.email()
        )
    );

-- Política para usuarios anónimos (solo lectura de todas las comunidades)
CREATE POLICY public_comunidades ON comunidades
    FOR SELECT
    TO public
    USING (TRUE);  -- Permite acceso a todas las comunidades para usuarios anónimos

-- 4. Verificar que las políticas se han creado correctamente
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM
    pg_policies
WHERE
    tablename = 'comunidades'
ORDER BY
    policyname;

-- 5. Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Las políticas de seguridad para la tabla comunidades han sido corregidas';
END $$;
