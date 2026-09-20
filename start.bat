@echo off
title ShopSphere Launcher
echo ===================================================
echo     Launching ShopSphere E-Commerce Platform
echo ===================================================
echo.
echo Starting Flask REST API Backend (Port 5000)...
start "ShopSphere Backend (Port 5000)" cmd /k "cd backend && python run.py"

echo Starting Vite React Frontend (Port 5173)...
start "ShopSphere Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo Both Frontend & Backend processes launched!
echo Access Web App at: http://localhost:5173
echo Access REST API at: http://127.0.0.1:5000/api
echo ===================================================
