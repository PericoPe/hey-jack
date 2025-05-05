@echo off
echo ===== Hey Jack Project Cleanup =====
echo.

REM Create backup directory for unnecessary scripts
echo Creating backup directory for unnecessary scripts...
mkdir "src\scripts\backup" 2>nul

REM Move test scripts to backup
echo Moving test scripts to backup...
move "src\scripts\test_*.js" "src\scripts\backup\" 2>nul

REM Move one-time fix scripts to backup
echo Moving one-time fix scripts to backup...
move "src\scripts\fix_*.js" "src\scripts\backup\" 2>nul
move "src\scripts\createTestData.js" "src\scripts\backup\" 2>nul
move "src\scripts\add_test_contributors.js" "src\scripts\backup\" 2>nul
move "src\scripts\create_contributors_table_api.js" "src\scripts\backup\" 2>nul
move "src\scripts\migrate_to_contributors_table.js" "src\scripts\backup\" 2>nul
move "src\scripts\preview_email_template.js" "src\scripts\backup\" 2>nul
move "src\scripts\validar_tabla.js" "src\scripts\backup\" 2>nul
move "src\scripts\sync_aportantes_miembros.js" "src\scripts\backup\" 2>nul
move "src\scripts\sync_aportantes_miembros_fix.js" "src\scripts\backup\" 2>nul

REM Remove log files from root directory
echo Removing log files from root directory...
del *.log 2>nul
del *_log.txt 2>nul
del emails_enviados.html 2>nul

REM Commit changes to GitHub
echo.
echo Committing changes to GitHub...
git add .
git commit -m "Clean up project: Remove unnecessary scripts and log files"
git push origin master

echo.
echo ===== Project cleanup completed =====
echo Unnecessary scripts have been moved to src\scripts\backup
echo.
echo Press any key to exit...
pause > nul
