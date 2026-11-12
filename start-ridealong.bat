@echo off
title RideAlong Server Runner
echo ========================================================
echo    Starting RideAlong Full-Stack Web Application
echo ========================================================
echo.
cd /d "%~dp0"
echo Starting Backend API (Port 3001) and Vite Frontend (Port 5173)...
echo.
node run.js
pause
