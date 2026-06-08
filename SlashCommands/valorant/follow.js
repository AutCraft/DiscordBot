const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { getVlrErrorEmbed, getVlrAttachment } = require('../../utils/vlrApi');

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

    const lookupPath = path.join(__dirname, '../../db/vlrLookup.json');
    let lookup;
    try {
        lookup = JSON.parse(fs.readFileSync(lookupPath, 'utf8'));
    } catch (e) {
        lookup = { teams: {} };
    }

    if (!db[userId]) {
        db[userId] = [];
    }

    if (subcommand === 'add') {
        const teamQuery = inter.options.getString('team').toLowerCase();
        const teamId = lookup.teams[teamQuery];

        if (!teamId) {
            const embed = getVlrErrorEmbed(`🔍 ไม่พบทีม \`${teamQuery}\` ในฐานข้อมูล`);
            return inter.followUp({ embeds: [embed], files: getVlrAttachment() ? [getVlrAttachment()] : [], flags: MessageFlags.Ephemeral });
        }

        if (db[userId].includes(teamId)) {
            return inter.followUp({ content: `✅ คุณติดตามทีม \`${teamQuery}\` อยู่แล้ว`, flags: MessageFlags.Ephemeral });
        }

        if (db[userId].length >= 5) {
            return inter.followUp({ content: `❌ คุณสามารถติดตามได้สูงสุด 5 ทีมเท่านั้น!`, flags: MessageFlags.Ephemeral });
        }

        db[userId].push(teamId);
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
        await inter.followUp({ content: `✅ เพิ่มทีม \`${teamQuery}\` ลงในรายการติดตามแล้ว! บอทจะ DM หาคุณเมื่อทีมนี้กำลังจะแข่ง`, flags: MessageFlags.Ephemeral });

    } else if (subcommand === 'remove') {
        const teamQuery = inter.options.getString('team').toLowerCase();
        const teamId = lookup.teams[teamQuery];

        if (!teamId || !db[userId].includes(teamId)) {
            return inter.followUp({ content: `❌ คุณไม่ได้ติดตามทีม \`${teamQuery}\` หรือไม่พบในระบบ`, flags: MessageFlags.Ephemeral });
        }

        db[userId] = db[userId].filter(id => id !== teamId);
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
        await inter.followUp({ content: `✅ ลบทีม \`${teamQuery}\` ออกจากการติดตามแล้ว`, flags: MessageFlags.Ephemeral });

    } else if (subcommand === 'list') {
        if (db[userId].length === 0) {
            return inter.followUp({ content: `📭 คุณยังไม่ได้ติดตามทีมใดเลย\nใช้คำสั่ง \`/valorant-follow add\` เพื่อเริ่มติดตาม`, flags: MessageFlags.Ephemeral });
        }

        // Reverse lookup to find names
        const followedNames = [];
        for (const tid of db[userId]) {
            let foundName = Object.keys(lookup.teams).find(k => lookup.teams[k] === tid);
            followedNames.push(`• **${foundName ? foundName.toUpperCase() : `ID: ${tid}`}**`);
        }

        await inter.followUp({ content: `📋 **รายการทีมที่คุณติดตาม (${db[userId].length}/5):**\n${followedNames.join('\n')}`, flags: MessageFlags.Ephemeral });
    }
};

module.exports.help = { name: 'valorant-follow' };
