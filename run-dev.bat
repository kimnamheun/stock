@echo off
rem 이 프로젝트는 Node 20.9 이상이 필요합니다 (시스템 기본은 18).
rem nvm에 설치된 v23.8.0을 이 창에서만 사용하도록 PATH를 앞에 추가합니다.
set "PATH=%APPDATA%\nvm\v23.8.0;%PATH%"
cd /d "%~dp0"
npm run dev
