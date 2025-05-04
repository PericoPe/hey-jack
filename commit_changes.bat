@echo off
echo Realizando commit de cambios en Hey Jack...
cd /d "c:\Users\javie\CascadeProjects\Hey Jack"
git add .
git commit -m "Fix: Corregido trigger de sincronización, cálculo de fechas y nombres en aportantes"
git push
echo Commit y push completados.
pause
