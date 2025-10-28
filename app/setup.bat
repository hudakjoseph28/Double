@echo off
echo 🚀 Setting up Double App...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v18 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo.

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully!
    echo.
    echo 🎉 Setup complete! You can now start the app with:
    echo    npx expo start
    echo.
    echo 📱 Demo login credentials:
    echo    Email: demo@doubledate.com
    echo    Password: demo123
    echo.
    echo    Or use developer account:
    echo    Email: testing@gmail.com
    echo    Password: test123
    echo.
    pause
) else (
    echo ❌ Failed to install dependencies. Please check the error messages above.
    pause
    exit /b 1
)
