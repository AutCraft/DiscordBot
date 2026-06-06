const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports.data = new SlashCommandBuilder()
    .setName('reload')
    .setDescription('โหลดคำสั่งใหม่โดยไม่ต้องรีสตาร์ทบอท (แอดมินเท่านั้น)')
    .addStringOption(option =>
        option.setName('command')
            .setDescription('ชื่อคำสั่งที่ต้องการรีโหลด (เช่น play, loop)')
            .setRequired(true)
    );

module.exports.run = async (Client, inter) => {
    // กำหนดให้ใช้ได้เฉพาะในเซิร์ฟเวอร์ที่กำหนดไว้ใน .env เท่านั้น
    const adminGuildId = process.env.SERVER_ID_ADMIN;
    if (inter.guildId !== adminGuildId) {
        return inter.followUp({ content: '❌ คำสั่งนี้ใช้ได้เฉพาะในเซิร์ฟเวอร์ผู้ดูแลระบบเท่านั้น!', ephemeral: true });
    }

    const adminUserId = process.env.USER_ID_ADMIN;
    // กำหนดให้ใช้ได้เฉพาะผู้ใช้ไอดีที่ระบุไว้เท่านั้น (คุณ Autan)
    if (inter.user.id !== adminUserId) {
        return inter.followUp({ content: '❌ เฉพาะเจ้าของบอทเท่านั้นที่สามารถใช้คำสั่งนี้ได้!', ephemeral: true });
    }

    const commandName = inter.options.getString('command').toLowerCase();
    const command = Client.SlashCmds.get(commandName);

    if (!command) {
        return inter.followUp({ content: `❌ ไม่พบคำสั่ง \`${commandName}\` ในระบบ!`, ephemeral: true });
    }

    // ค้นหาว่าไฟล์คำสั่งนี้อยู่โฟลเดอร์ไหน
    const slashCommandsPath = path.join(__dirname, '..', '..', 'SlashCommands');
    const folders = fs.readdirSync(slashCommandsPath);

    let folderName;
    for (const folder of folders) {
        const files = fs.readdirSync(path.join(slashCommandsPath, folder));
        if (files.includes(`${commandName}.js`)) {
            folderName = folder;
            break;
        }
    }

    if (!folderName) {
        return inter.followUp({ content: `❌ หาไฟล์คำสั่งไม่เจอ!`, ephemeral: true });
    }

    const commandPath = path.join(slashCommandsPath, folderName, `${commandName}.js`);

    try {
        // 1. ลบความจำเก่า (Cache) ออกไป
        delete require.cache[require.resolve(commandPath)];

        // 2. โหลดไฟล์ใหม่เข้ามา
        const newCommand = require(commandPath);

        // 3. เอาคำสั่งใหม่ไปทับของเก่าในระบบ
        Client.SlashCmds.set(newCommand.help.name, newCommand);

        await inter.followUp({ content: `✅ รีโหลดคำสั่ง \`/${commandName}\` สำเร็จแล้ว! (เพลงไม่ดับแน่นอน)` });
    } catch (error) {
        console.error(error);
        await inter.followUp({ content: `❌ เกิดข้อผิดพลาดตอนรีโหลด: \`${error.message}\`` });
    }
};

module.exports.help = { name: 'reload' };
