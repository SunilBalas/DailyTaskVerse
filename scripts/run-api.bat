@echo off
title DailyTaskVerse API
cd /d "%~dp0"
echo Starting DailyTaskVerse API...
set "MSBuildSDKsPath=C:\Program Files\dotnet\sdk\9.0.311\Sdks"
start "" http://localhost:5246/swagger
dotnet run --project DailyTaskVerse.API --launch-profile http
pause
