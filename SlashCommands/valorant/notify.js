const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports.data = new SlashCommandBuilder()
    .setName('valorant-notify')
    .setDescription('ตั้งค่าระบบแจ้งเตือนแมตช์ที่กำลังจะเริ่ม')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(subcommand =>
        subcommand
            .setName('on')
            .setDescription('เปิดแจ้งเตือนและตั้ง role ที่ต้องการ ping')
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('Role ที่จะถูก ping เมื่อแมตช์จะเริ่ม (ไม่ใส่ก็ได้ ถ้าไม่ต้องการแท็กใคร)')
                    .setRequired(false)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('off')
            .setDescription('ปิดการแจ้งเตือน')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('status')
            .setDescription('ดูสถานะการแจ้งเตือนปัจจุบัน')
    );

module.exports.run = async (Client, inter) => {
    const subcommand = inter.options.getSubcommand();
    const dbPath = path.join(__dirname, '../../db/vlrNotify.json');

    let db;
    try {
        db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (e) {
        db = { enabled: false, guildId: null, channelId: null, roleId: null, notifiedMatches: [] };
    }

    if (subcommand === 'on') {
        const role = inter.options.getRole('role');
        db.enabled = true;
        db.guildId = inter.guildId;
        db.channelId = inter.channelId;
        db.roleId = role ? role.id : null;

        fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));

        const msg = role
            ? `✅ เปิดการแจ้งเตือนสำเร็จ! บอทจะแจ้งเตือนในช่องนี้และแท็ก <@&${role.id}> เมื่อมีแมตช์จะเริ่มใน 15 นาที`
            : `✅ เปิดการแจ้งเตือนสำเร็จ! บอทจะแจ้งเตือนในช่องนี้ (แบบไม่แท็กใคร) เมื่อแมตช์จะเริ่มใน 15 นาที`;

        await inter.followUp({ content: msg });
    } else if (subcommand === 'off') {
        db.enabled = false;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
        await inter.followUp({ content: `🛑 ปิดการแจ้งเตือนเรียบร้อยแล้ว` });
    } else if (subcommand === 'status') {
        const roleText = db.roleId ? `<@&${db.roleId}>` : `ไม่แท็กใคร`;
        const status = db.enabled ? `🟢 เปิดใช้งาน\n📍 ช่อง: <#${db.channelId}>\n👥 Role: ${roleText}` : `🔴 ปิดใช้งานอยู่`;
        await inter.followUp({ content: `**สถานะการแจ้งเตือน Valorant:**\n${status}` });
    }
};

module.exports.help = { name: 'valorant-notify' };
