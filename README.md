# Discord Bot

A powerful and customizable Discord Bot built with `discord.js` v14.

## Features
- 🎵 Advanced Music Playback using `discord-player` (v6.7.1)
- 🚀 Seamless YouTube extraction bypassing 403 errors using `yt-dlp` (`youtube-dl-exec`)
- 🔊 High-quality audio encoding via native `@discordjs/opus`
- 💬 Slash Commands support (`/play`, `/skip`, `/queue`, etc.)

## Prerequisites
- Node.js >= 18.x
- FFmpeg installed and in PATH (or provided via `ffmpeg-static`)

## Installation

1. Clone the repository
2. Install the dependencies:
   ```bash
   set YOUTUBE_DL_SKIP_PYTHON_CHECK=1
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```env
   DISCORD_TOKEN=your_discord_bot_token
   TENORKEY=your_tenor_api_key
   SERVER_ID_ADMIN=your_server_id_admin
   USER_ID_ADMIN=your_user_id_admin
   ```

## Running the Bot

**Auto-Restart Mode (Recommended):**
To run the bot with automatic restarts whenever a file changes, simply double-click `start.bat` on Windows, or run:
```bash
npm run dev
```

**Standard Mode:**
```bash
node index.js
```

## Running on a VPS (Windows)
1. Copy the entire bot folder to your Windows VPS (exclude the `node_modules` folder to save time).
2. Open a Terminal (CMD/PowerShell) in the bot's folder and run `npm install`.
3. Double-click the `start.bat` file to start the bot.
4. Keep the CMD window open! Do not close it, or the bot will stop.
