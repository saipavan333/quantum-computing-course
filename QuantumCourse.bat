@echo off
rem ── Quantum Computing: Zero to Professional — desktop launcher ──
rem Opens the course in its own app window (Edge app mode). Falls back
rem to your default browser if Edge isn't found. Fully offline.
setlocal
set "HTML=%~dp0index.html"
set "URL=file:///%HTML:\=/%"

set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%LocalAppData%\Microsoft\Edge\Application\msedge.exe"

if exist "%EDGE%" (
  start "" "%EDGE%" --app="%URL%"
) else (
  start "" "%HTML%"
)
endlocal
