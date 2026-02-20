@echo off
TITLE VisuLens Launcher
echo ==========================================
echo       VisuLens: AI Visual Search
echo ==========================================
echo.

:: Check if backend venv exists
if not exist "backend\venv\Scripts\python.exe" (
    echo [ERROR] Backend virtual environment not found in backend\venv
    echo Please follow the setup instructions in README.md first.
    pause
    exit /b
)

:: Start Backend in a new minimized window
echo [1/3] Starting Backend Server (Port 5000)...
start /min cmd /c "cd backend && venv\Scripts\python.exe app.py"

:: Wait for backend to initialize
timeout /t 3 /nobreak > nul

:: Start Frontend in a new minimized window
echo [2/3] Starting Frontend Dev Server (Port 5173)...
start /min cmd /c "cd frontend && npm run dev"

:: Wait for frontend to initialize
echo [3/3] Launching VisuLens in your browser...
timeout /t 5 /nobreak > nul

:: Open the browser to the local URL
start http://localhost:5173/

echo.
echo ==========================================
echo VisuLens is now LIVE at http://localhost:5173
echo.
echo NOTE: Two terminal windows are running in the background.
echo Close them or this window to stop the servers.
echo ==========================================
echo.
pause
