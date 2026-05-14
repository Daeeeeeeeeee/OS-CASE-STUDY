@echo off
title CPU Scheduling Simulator — Launcher

echo =============================================
echo   CPU Scheduling Simulator
echo   OS Case Study ^| Process Management
echo =============================================
echo.
echo  Opening Villapana-Christian-Hope_BSCS-3B.html in your browser...
echo.

REM Try to open with the default browser
start "" "%~dp0Villapana-Christian-Hope_BSCS-3B.html"

if errorlevel 1 (
    echo  [ERROR] Could not open the file automatically.
    echo  Please open Villapana-Christian-Hope_BSCS-3B.html manually in your browser.
)

echo  Done! The simulator should now be running in your browser.
echo.
pause
