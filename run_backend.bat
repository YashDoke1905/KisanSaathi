@echo off
title SmartHarvest - Backend (FastAPI)
echo ===================================================
echo Starting SmartHarvest Backend API on port 8000...
echo Docs: http://localhost:8000/docs
echo ===================================================
cd /d "%~dp0backend"
call venv\Scripts\activate
python run.py
pause
