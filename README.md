# Discord Bot

> **Super Bot** ที่ออกแบบมาเพื่อทำได้ทุกอย่างใน Discord — เพลง, Esports, แจ้งเตือน, ความบันเทิง และอีกมากมาย
> เป้าหมายคือบอทตัวเดียวที่ตอบโจทย์ทุกความต้องการของ server

Built with `discord.js` v14 — ข้อมูล Valorant จาก [vlr.gg](https://vlr.gg) ผ่าน [vlrggapi](https://github.com/axsddlr/vlrggapi)

---

## ✨ Features

| หมวดหมู่ | รายละเอียด |
|---|---|
| 🎵 **Music** | เล่น YouTube / Spotify ด้วย `discord-player` v6 คุณภาพสูงผ่าน `@discordjs/opus` |
| 🎮 **Valorant Tracker** | Live score, ผลแข่ง, ตารางแข่ง, Roster ทีม และสถิติผู้เล่น |
| 🔔 **Notifications** | แจ้งเตือน channel เมื่อแมตช์ใกล้เริ่ม + DM ส่วนตัวสำหรับทีมโปรด |

---

## 📋 Requirements

- **Node.js** >= 18.x
- **FFmpeg** ติดตั้งในระบบหรือผ่าน `ffmpeg-static`

---

## 🚀 Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd DiscordBot

# Install dependencies (skip Python check for yt-dlp)
set YOUTUBE_DL_SKIP_PYTHON_CHECK=1
npm install
```

สร้างไฟล์ `.env` ในโฟลเดอร์หลัก:

```env
DISCORD_TOKEN=your_discord_bot_token
TENORKEY=your_tenor_api_key
SERVER_ID_ADMIN=your_server_id
USER_ID_ADMIN=your_user_id
```

---

## ▶️ Running the Bot

**Dev Mode (แนะนำ)** — รีสตาร์ทอัตโนมัติเมื่อไฟล์เปลี่ยน:
```bash
npm run dev
```

**Standard Mode:**
```bash
node index.js
```

**Windows GUI** — ดับเบิลคลิก `start.bat`

---

## 🖥️ Running on a VPS (Windows)

1. Copy โฟลเดอร์บอทไปยัง VPS (ยกเว้น `node_modules`)
2. เปิด Terminal ในโฟลเดอร์นั้น แล้วรัน `npm install`
3. ดับเบิลคลิก `start.bat` เพื่อเริ่มบอท
4. **อย่าปิด** หน้าต่าง CMD ไม่งั้นบอทจะหยุดทำงาน

---

## 🤖 Commands

พิมพ์ `/help` ใน Discord เพื่อดูคำสั่งทั้งหมด หรือดูรายการด้านล่าง:

### 🎵 Music
| คำสั่ง | คำอธิบาย |
|---|---|
| `/play <ชื่อเพลง / URL>` | เล่นเพลงจาก YouTube หรือ Spotify |
| `/skip` | ข้ามเพลงปัจจุบัน |
| `/stop` | หยุดเล่นและเคลียร์คิว |
| `/queue` | แสดงคิวเพลง |
| `/loop` | เปิด/ปิด เล่นซ้ำ |
| `/volume <0-100>` | ปรับเสียง |
| `/clear` | เคลียร์คิว |
| `/leave` | ให้บอทออกจากห้องเสียง |

### 🎮 Valorant Esports
| คำสั่ง | คำอธิบาย |
|---|---|
| `/valorant-upcoming` | แสดงแมตช์ที่กำลังจะมา |
| `/valorant-live` | แสดง live score |
| `/valorant-results` | ผลการแข่งขันล่าสุด |
| `/valorant-today` | แมตช์วันนี้ |
| `/valorant-livetracker` | Live tracker อัปเดตทุก 30 วินาที |
| `/valorant-team <ทีม>` | Roster + ผลการแข่งของทีม |
| `/valorant-player <ผู้เล่น>` | Stats และ agent ของนักกีฬา |

### 🔔 Notifications
| คำสั่ง | คำอธิบาย |
|---|---|
| `/valorant-notify on [role]` | เปิดแจ้งเตือนแมตช์ใน channel นี้ (Admin) |
| `/valorant-notify off` | ปิดแจ้งเตือน (Admin) |
| `/valorant-notify status` | ดูสถานะแจ้งเตือน |
| `/valorant-follow add <ทีม>` | ติดตามทีม รับ DM เมื่อทีมกำลังจะแข่ง |
| `/valorant-follow remove <ทีม>` | ยกเลิกติดตามทีม |
| `/valorant-follow list` | ดูทีมที่ติดตาม (สูงสุด 5 ทีม) |

---

## 🛠️ Tech Stack

- [discord.js](https://discord.js.org/) v14
- [discord-player](https://discord-player.js.org/) v6 + `youtube-dl-exec` (yt-dlp)
- [@discordjs/opus](https://github.com/discordjs/opus) — audio encoding
- [vlrggapi](https://github.com/axsddlr/vlrggapi) — Valorant data (self-hosted recommended)
- [nodemon](https://nodemon.io/) — dev auto-restart
