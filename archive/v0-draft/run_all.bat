@echo off
title SmartHarvest Launcher
echo ===================================================
echo Launching SmartHarvest Precision Agriculture Platform
echo ===================================================
start "SmartHarvest Backend" "%~dp0run_backend.bat"
timeout /t 3 /nobreak >nul
start "SmartHarvest Frontend" "%~dp0run_frontend.bat"
echo Services launched.
echo Web UI: http://localhost:5173
echo Swagger API: http://localhost:8000/docs
