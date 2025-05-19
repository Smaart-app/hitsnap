@echo off
echo --------------------------------------
echo HITLIFT: Καθαρισμός Astro Project
echo --------------------------------------

:: Διαγραφή .astro και node_modules
rmdir /s /q .astro
rmdir /s /q node_modules

:: Επανεγκατάσταση πακέτων
echo.
echo Επανεγκατάσταση εξαρτήσεων...
npm install

echo.
echo Ολοκληρώθηκε. Τρέξε: npm run dev
pause
