@echo off
echo Realizando push de cambios a GitHub...
cd /d "c:\Users\javie\CascadeProjects\Hey Jack"
git push origin main
if %ERRORLEVEL% NEQ 0 (
    echo Error al hacer push. Intentando con --force...
    git push origin main --force
)
echo Push completado. Verifica GitHub.
pause
