@echo off
echo ===== Hey Jack GitHub Push Script =====
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Git is not installed or not in PATH. Please install Git and try again.
    exit /b 1
)

echo Checking git status...
git status

echo.
echo Adding all files to git...
git add .

echo.
echo Creating commit...
git commit -m "Complete Hey Jack platform with admin panel and database fixes"

echo.
echo Checking remote repository...
git remote -v

REM Check if origin exists
git remote -v | find "origin" >nul
if %ERRORLEVEL% neq 0 (
    echo.
    echo No remote repository found. Please enter your GitHub repository URL:
    set /p REPO_URL=GitHub URL (e.g., https://github.com/username/repo.git): 
    
    echo.
    echo Adding remote repository...
    git remote add origin %REPO_URL%
)

echo.
echo Pushing to GitHub...
git push -u origin master

echo.
echo ===== Process completed =====
pause
