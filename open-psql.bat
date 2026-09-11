@echo off
set PGPASSWORD=password123
"C:\Users\Admin\pgsql\bin\psql.exe" -U postgres -h localhost -p 5432 -d acuityops
