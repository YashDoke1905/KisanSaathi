@echo off
title SmartHarvest - Frontend (Vite React)
echo ===================================================
echo Starting SmartHarvest Web UI on port 5173...
echo UI: http://localhost:5173
echo ===================================================
cd /d "%~dp0frontend"
npm run dev
pause
