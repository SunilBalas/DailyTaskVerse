@echo off
echo Starting DailyTaskVerse...
echo.
echo Launching API server...
start "DailyTaskVerse API" "%~dp0run-api.bat"

echo Waiting for API to be ready on http://localhost:5246 ...
:WAIT_API
timeout /t 2 /nobreak >nul
curl -s -o nul -w "" http://localhost:5246/swagger >nul 2>&1
if %errorlevel% neq 0 (
    echo   API not ready yet, retrying...
    goto WAIT_API
)
echo   API is ready!
echo.

echo Launching React UI...
start "DailyTaskVerse UI" "%~dp0run-ui.bat"
echo.
echo Both services are running.
echo   API:  http://localhost:5246
echo   UI:   http://localhost:5173
echo.
pause
