@echo off
echo Starting DailyTaskVerse...
echo.
echo Launching API server...
start "DailyTaskVerse API" "%~dp0run-api.bat"
echo Launching React UI...
start "DailyTaskVerse UI" "%~dp0run-ui.bat"
echo.
echo Both services are starting in separate windows.
echo   API:  https://localhost:5246  (check console for actual port)
echo   UI:   http://localhost:5173
echo.
pause
