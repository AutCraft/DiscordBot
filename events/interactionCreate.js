const { Client } = require('../index');

Client.on('interactionCreate', async (inter) => {
    if (!inter.isChatInputCommand()) return;

    try {
        await inter.deferReply();
    } catch (e) {
        console.error('[DeferReply Error] Failed to defer:', e.message);
        return; // ห้ามรันต่อถ้า Defer ไม่สำเร็จ เพราะจะทำให้ Error InteractionNotReplied
    }

    const cmd = Client.SlashCmds.get(inter.commandName);
    if (!cmd) return inter.followUp({ content: '❌ ไม่พบคำสั่งนี้!' });

    inter.member = inter.guild.members.cache.get(inter.user.id);

    try {
        await cmd.run(Client, inter);
    } catch (err) {
        console.error(`[INTERACTION ERROR] ${inter.commandName}:`, err);
        const msg = { content: '❌ เกิดข้อผิดพลาดขณะรันคำสั่งนี้!' };
        if (inter.deferred || inter.replied) {
            inter.followUp(msg).catch(() => {});
        } else {
            inter.reply(msg).catch(() => {});
        }
    }
});