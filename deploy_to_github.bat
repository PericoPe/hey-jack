@echo off
echo ===================================================
echo Desplegando cambios a GitHub para el proyecto Hey Jack
echo ===================================================
echo.

cd /d "c:\Users\javie\CascadeProjects\Hey Jack"

echo Verificando estado del repositorio...
git status

echo.
echo Añadiendo todos los archivos modificados...
git add .

echo.
echo Realizando commit...
git commit -m "Fix: Corregido trigger de sincronización, cálculo de fechas y nombres en aportantes"

echo.
echo Intentando push normal...
git push
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo El push normal falló. Intentando con configuración explícita...
    git push origin HEAD:main
    
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo Segundo intento falló. Intentando con --force...
        git push origin HEAD:main --force
    )
)

echo.
echo Proceso completado. Verifica GitHub para confirmar que los cambios se subieron correctamente.
echo.
echo Presiona cualquier tecla para salir...
pause > nul
