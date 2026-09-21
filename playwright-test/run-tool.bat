@echo off
title AUTOMATION TESTING TOOL - SWT301
echo =======================================================
echo          KHOI CHAY TOOL KIEM THU TU DONG
echo =======================================================
echo.
echo 1. Chay Tool o che do Truc quan (UI Mode)
echo 2. Chay Tool tu dong va Xuat bao cao Excel
echo.
set /p choice="Chon che do (1 hoac 2): "

if "%choice%"=="1" (
    npx playwright test --ui
) else (
    npx playwright test --headed
    pause
)