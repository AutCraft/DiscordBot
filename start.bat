@echo off
echo Starting Discord Bot (Auto-Restart Mode)...
set YOUTUBE_DL_SKIP_PYTHON_CHECK=1
npx nodemon index.js
PAUSE