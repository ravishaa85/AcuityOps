@echo off
echo ==============================================
echo   Syncing AcuityOps repository to GitHub
echo ==============================================
echo.
git add .
git commit -m "Update AcuityOps: latest features and clinical updates"
git push -u origin main
echo.
echo ==============================================
echo   Sync complete! Now pull on your server:
echo   git pull origin main
echo   npm run build
echo ==============================================
pause

