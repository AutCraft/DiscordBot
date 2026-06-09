const { SlashCommandBuilder } = require('discord.js');

const COMMANDS = {
    '🎵 เพลง (Music)': [
        { name: '/play `<ชื่อเพลง / URL>`', desc: 'เล่นเพลงจาก YouTube หรือ Spotify' },
        { name: '/skip', desc: 'ข้ามเพลงปัจจุบัน' },
        { name: '/stop', desc: 'หยุดเล่นเพลงและเคลียร์คิว' },
        { name: '/queue', desc: 'แสดงรายการเพลงในคิว' },
        { name: '/loop', desc: 'เปิด/ปิด การเล่นซ้ำ' },
        { name: '/volume `<0-100>`', desc: 'ปรับระดับเสียง' },
        { name: '/clear', desc: 'เคลียร์คิวเพลงทั้งหมด' },
        { name: '/leave', desc: 'ให้บอทออกจากห้องเสียง' },
    ],
    '🎮 Valorant Esports': [
        { name: '/valorant-upcoming', desc: 'แสดงแมตช์ที่กำลังจะมาในเร็วๆ นี้' },
        { name: '/valorant-live', desc: 'แสดง live score ของแมตช์ที่กำลังแข่งอยู่' },
        { name: '/valorant-results', desc: 'แสดงผลการแข่งขันล่าสุด' },
        { name: '/valorant-today', desc: 'แสดงแมตช์ของวันนี้' },
        { name: '/valorant-livetracker', desc: 'ติดตาม live score แบบอัปเดตอัตโนมัติทุก 30 วินาที' },
        { name: '/valorant-team `<ชื่อทีม>`', desc: 'ดู roster และผลการแข่งขันล่าสุดของทีม' },
        { name: '/valorant-player `<ชื่อผู้เล่น>`', desc: 'ดู stats และ agent ที่ใช้บ่อยของนักกีฬา' },
    ],
    '🔔 การแจ้งเตือน (Notifications)': [
        { name: '/valorant-notify on `[role]`', desc: 'เปิดการแจ้งเตือนแมตช์ใน 15 นาที (Admin)' },
        { name: '/valorant-notify off', desc: 'ปิดการแจ้งเตือน (Admin)' },
        { name: '/valorant-notify status', desc: 'ดูสถานะการแจ้งเตือนปัจจุบัน' },
        { name: '/valorant-follow add `<ทีม>`', desc: 'ติดตามทีม รับ DM ส่วนตัวเมื่อทีมกำลังจะแข่ง' },
        { name: '/valorant-follow remove `<ทีม>`', desc: 'ยกเลิกติดตามทีม' },
        { name: '/valorant-follow list', desc: 'ดูทีมที่คุณกำลังติดตามอยู่ (สูงสุด 5 ทีม)' },
    ],
    'ℹ️ ทั่วไป (Utility)': [
        { name: '/ping', desc: 'เช็คว่าบอทยังออนไลน์และ latency' },
        { name: '/echo `<ข้อความ>`', desc: 'ให้บอทพูดข้อความของคุณ' },
        { name: '/help', desc: 'แสดงคำสั่งทั้งหมดนี้' },
        { name: '/gif `<ค้นหา>`', desc: 'ค้นหา GIf ตามคีย์เวิด' },
    ],
};

module.exports.data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('แสดงรายการคำสั่งทั้งหมดของบอท');

module.exports.run = async (Client, inter) => {
    const embed = {
        color: 0xFFCC33,
        title: '📖 HostWorker Bot — คำสั่งทั้งหมด',
        description: '**Super Bot** ที่ออกแบบมาเพื่อทำได้ทุกอย่างใน Discord\nเพลง · Esports · แจ้งเตือน · ความบันเทิง และอีกมากมาย\nข้อมูล Valorant จาก [vlr.gg](https://vlr.gg) ผ่าน vlrggapi',
        fields: Object.entries(COMMANDS).map(([category, cmds]) => ({
            name: category,
            value: cmds.map(c => `\`${c.name}\` — ${c.desc}`).join('\n'),
            inline: false,
        })),
        footer: { text: 'HostWorker Bot' },
        timestamp: new Date().toISOString(),
    };

    await inter.followUp({ embeds: [embed] });
};

module.exports.help = { name: 'help' };
