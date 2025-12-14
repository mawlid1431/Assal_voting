@echo off
echo ========================================
echo Updating Packages to Latest Versions
echo ========================================
echo.

echo Step 1: Updating React type definitions...
call npm install --save-dev @types/react@latest @types/react-dom@latest

echo.
echo Step 2: Updating development tools...
call npm install --save-dev @vitejs/plugin-react@latest autoprefixer@latest

echo.
echo Step 3: Updating UI libraries...
call npm install lucide-react@latest

echo.
echo Step 4: Updating all other packages...
call npm update

echo.
echo Step 5: Checking for security vulnerabilities...
call npm audit fix

echo.
echo ========================================
echo Update Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Review the changes
echo 2. Test your application: npm run dev
echo 3. Check for any breaking changes
echo.
pause
