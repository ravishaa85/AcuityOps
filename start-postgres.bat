@echo off
echo Starting PostgreSQL Server...
"C:\Users\Admin\pgsql\bin\pg_ctl.exe" -D "C:\Users\Admin\pgsql\data" -l "C:\Users\Admin\pgsql\logfile.log" start
if %ERRORLEVEL% EQU 0 (
    echo PostgreSQL is running on port 5432.
) else (
    echo PostgreSQL failed to start or is already running.
)
pause
