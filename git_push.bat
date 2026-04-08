@echo off
cd /d "%~dp0"
echo === Initializing git repo ===
git init
echo # imbolgharmony > README.md
echo === Adding all files ===
git add .
echo === Committing ===
git commit -m "first commit"
echo === Setting branch ===
git branch -M main
echo === Adding remote ===
git remote add origin https://github.com/OndraDol/imbolgharmony.git
echo === Pushing to GitHub ===
git push -u origin main
echo === DONE ===
pause
