@echo off
echo Stopping PostgreSQL Server...
"C:\Users\Admin\pgsql\bin\pg_ctl.exe" -D "C:\Users\Admin\pgsql\data" stop -m fast
pause
