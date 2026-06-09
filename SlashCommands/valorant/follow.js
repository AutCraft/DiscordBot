const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { vlrApi, getVlrErrorEmbed, getVlrAttachment } = require('../../utils/vlrApi');

module.exports.data = new SlashCommandBuilder()
    .setName('valorant-follow')
    .setDescription('Subscribe รับ DM แจ้งเตือนเมื่อทีมโปรดกำลังจะแข่ง')
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription('เพิ่มทีมที่ต้องการติดตาม')
            .addStringOption(option => 
                option.setName('team')
                    .setDescription('ชื่อทีมที่ต้องการติดตาม (เช่น sen)')
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('remove')
            .setDescription('ลบทีมออกจากการติดตาม')
            .addStringOption(option => 
                option.setName('team')
                    .setDescription('ชื่อทีมที่ต้องการลบ (เช่น sen)')
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('list')
            .setDescription('ดูรายการทีมที่คุณติดตามอยู่')
    );

module.exports.run = async (Client, inter) => {
    const subcommand = inter.options.getSubcommand();
    const userId = inter.user.id;
    
    const dbPath = path.join(__dirname, '../../db/vlrFollow.json');
    let db;
    try {
        db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (e) {
        db = {};
    }

    if (!db[userId]) {
        db[userId] = [];
    }

    // Migration helper: If an old structure exists (array of strings/numbers), empty it.
    if (db[userId].length > 0 && typeof db[userId][0] !== 'object') {
        db[userId] = [];
    }

    if (subcommand === 'add') {
        const teamQuery = inter.options.getString('team').toLowerCase();
        
        try {
            const searchRes = await vlrApi.get(`/v2/search?q=${encodeURIComponent(teamQuery)}`);
            const teams = searchRes.data?.data?.segments?.results?.teams || [];

            if (teams.length === 0) {
                const embed = getVlrErrorEmbed(`🔍 ไม่พบทีม \`${teamQuery}\` ในระบบ`);
                return inter.followUp({ embeds: [embed], files: getVlrAttachment() ? [getVlrAttachment()] : [], flags: MessageFlags.Ephemeral });
            }

            const team = teams[0];
            const teamId = team.id;
            const teamName = team.name;

            if (db[userId].some(t => t.id === teamId)) {
                return inter.followUp({ content: `✅ คุณติดตามทีม **${teamName}** อยู่แล้ว`, flags: MessageFlags.Ephemeral });
            }

            if (db[userId].length >= 5) {
                return inter.followUp({ content: `❌ คุณสามารถติดตามได้สูงสุด 5 ทีมเท่านั้น!`, flags: MessageFlags.Ephemeral });
            }

            db[userId].push({ id: teamId, name: teamName });
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
            await inter.followUp({ content: `✅ เพิ่มทีม **${teamName}** ลงในรายการติดตามแล้ว! บอทจะ DM หาคุณเมื่อทีมนี้กำลังจะแข่ง`, flags: MessageFlags.Ephemeral });

        } catch (err) {
            console.error('Follow Add Error:', err);
            const embed = getVlrErrorEmbed('❌ เกิดข้อผิดพลาดในการดึงข้อมูลจาก VLR API');
            return inter.followUp({ embeds: [embed], files: getVlrAttachment() ? [getVlrAttachment()] : [], flags: MessageFlags.Ephemeral });
        }

    } else if (subcommand === 'remove') {
        const teamQuery = inter.options.getString('team').toLowerCase();
        
        try {
            const searchRes = await vlrApi.get(`/v2/search?q=${encodeURIComponent(teamQuery)}`);
            const teams = searchRes.data?.data?.segments?.results?.teams || [];

            if (teams.length === 0) {
                const embed = getVlrErrorEmbed(`🔍 ไม่พบทีม \`${teamQuery}\` ในระบบ`);
                return inter.followUp({ embeds: [embed], files: getVlrAttachment() ? [getVlrAttachment()] : [], flags: MessageFlags.Ephemeral });
            }

            const team = teams[0];
            const teamId = team.id;

            if (!db[userId].some(t => t.id === teamId)) {
                return inter.followUp({ content: `❌ คุณไม่ได้ติดตามทีม **${team.name}**`, flags: MessageFlags.Ephemeral });
            }

            db[userId] = db[userId].filter(t => t.id !== teamId);
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
            await inter.followUp({ content: `✅ ลบทีม **${team.name}** ออกจากการติดตามแล้ว`, flags: MessageFlags.Ephemeral });

        } catch (err) {
            console.error('Follow Remove Error:', err);
            const embed = getVlrErrorEmbed('❌ เกิดข้อผิดพลาดในการดึงข้อมูลจาก VLR API');
            return inter.followUp({ embeds: [embed], files: getVlrAttachment() ? [getVlrAttachment()] : [], flags: MessageFlags.Ephemeral });
        }

    } else if (subcommand === 'list') {
        if (db[userId].length === 0) {
            return inter.followUp({ content: `📭 คุณยังไม่ได้ติดตามทีมใดเลย\nใช้คำสั่ง \`/valorant-follow add\` เพื่อเริ่มติดตาม`, flags: MessageFlags.Ephemeral });
        }

        const followedNames = db[userId].map(t => `• **${t.name}**`);
        await inter.followUp({ content: `📋 **รายการทีมที่คุณติดตาม (${db[userId].length}/5):**\n${followedNames.join('\n')}`, flags: MessageFlags.Ephemeral });
    }
};

module.exports.help = { name: 'valorant-follow' };
