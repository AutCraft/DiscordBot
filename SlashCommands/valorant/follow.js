const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { vlrApi, getVlrErrorEmbed, getVlrAttachment } = require('../../utils/vlrApi');

const DB_PATH = path.join(__dirname, '../../db/vlrFollow.json');
const MAX_FOLLOWS = 5;

function loadDb() {
    try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
    catch { return {}; }
}

function saveDb(db) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 4));
}

async function searchTeam(query) {
    const res = await vlrApi.get(`/v2/search?q=${encodeURIComponent(query)}`);
    return res.data?.data?.segments?.results?.teams || [];
}

module.exports.data = new SlashCommandBuilder()
    .setName('valorant-follow')
    .setDescription('Subscribe รับ DM แจ้งเตือนเมื่อทีมโปรดกำลังจะแข่ง')
    .addSubcommand(sub => sub
        .setName('add')
        .setDescription('เพิ่มทีมที่ต้องการติดตาม')
        .addStringOption(o => o.setName('team').setDescription('ชื่อทีม (เช่น sen, prx)').setRequired(true))
    )
    .addSubcommand(sub => sub
        .setName('remove')
        .setDescription('ลบทีมออกจากการติดตาม')
        .addStringOption(o => o.setName('team').setDescription('ชื่อทีม (เช่น sen)').setRequired(true))
    )
    .addSubcommand(sub => sub
        .setName('list')
        .setDescription('ดูรายการทีมที่คุณติดตามอยู่')
    );

module.exports.run = async (Client, inter) => {
    const subcommand = inter.options.getSubcommand();
    const userId = inter.user.id;
    const db = loadDb();

    if (!db[userId]) db[userId] = [];

    // Migrate old format (array of raw IDs/strings → objects)
    if (db[userId].length > 0 && typeof db[userId][0] !== 'object') {
        db[userId] = [];
        saveDb(db);
    }

    const EPHEMERAL = { flags: MessageFlags.Ephemeral };

    if (subcommand === 'add') {
        const teamQuery = inter.options.getString('team').toLowerCase();
        try {
            const teams = await searchTeam(teamQuery);
            if (teams.length === 0) {
                return inter.followUp({ embeds: [getVlrErrorEmbed(`🔍 ไม่พบทีม \`${teamQuery}\` ในระบบ`)], files: getVlrAttachment() ? [getVlrAttachment()] : [], ...EPHEMERAL });
            }

            const { id, name } = teams[0];
            if (db[userId].some(t => t.id === id)) return inter.followUp({ content: `✅ คุณติดตามทีม **${name}** อยู่แล้ว`, ...EPHEMERAL });
            if (db[userId].length >= MAX_FOLLOWS) return inter.followUp({ content: `❌ ติดตามได้สูงสุด ${MAX_FOLLOWS} ทีมเท่านั้น`, ...EPHEMERAL });

            db[userId].push({ id, name });
            saveDb(db);
            await inter.followUp({ content: `✅ เพิ่มทีม **${name}** สำเร็จ! บอทจะ DM หาคุณเมื่อทีมนี้กำลังจะแข่ง`, ...EPHEMERAL });

        } catch (err) {
            console.error('[valorant-follow add]', err.message);
            await inter.followUp({ embeds: [getVlrErrorEmbed('❌ เกิดข้อผิดพลาดในการดึงข้อมูล')], files: getVlrAttachment() ? [getVlrAttachment()] : [], ...EPHEMERAL });
        }

    } else if (subcommand === 'remove') {
        const teamQuery = inter.options.getString('team').toLowerCase();
        try {
            const teams = await searchTeam(teamQuery);
            if (teams.length === 0) {
                return inter.followUp({ embeds: [getVlrErrorEmbed(`🔍 ไม่พบทีม \`${teamQuery}\` ในระบบ`)], files: getVlrAttachment() ? [getVlrAttachment()] : [], ...EPHEMERAL });
            }

            const { id, name } = teams[0];
            if (!db[userId].some(t => t.id === id)) return inter.followUp({ content: `❌ คุณไม่ได้ติดตามทีม **${name}**`, ...EPHEMERAL });

            db[userId] = db[userId].filter(t => t.id !== id);
            saveDb(db);
            await inter.followUp({ content: `✅ ลบทีม **${name}** ออกจากการติดตามแล้ว`, ...EPHEMERAL });

        } catch (err) {
            console.error('[valorant-follow remove]', err.message);
            await inter.followUp({ embeds: [getVlrErrorEmbed('❌ เกิดข้อผิดพลาดในการดึงข้อมูล')], files: getVlrAttachment() ? [getVlrAttachment()] : [], ...EPHEMERAL });
        }

    } else if (subcommand === 'list') {
        if (db[userId].length === 0) {
            return inter.followUp({ content: `📭 คุณยังไม่ได้ติดตามทีมใดเลย\nพิมพ์ \`/valorant-follow add\` เพื่อเริ่มติดตาม`, ...EPHEMERAL });
        }
        const list = db[userId].map(t => `• **${t.name}**`).join('\n');
        await inter.followUp({ content: `📋 **รายการทีมที่ติดตาม (${db[userId].length}/${MAX_FOLLOWS}):**\n${list}`, ...EPHEMERAL });
    }
};

module.exports.help = { name: 'valorant-follow' };
