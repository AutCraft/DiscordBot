const { REST, Routes } = require('discord.js');
const { Client } = require('../index');

Client.on('ready', async () => {
    const servers = Client.guilds.cache.size;
    Client.user.setPresence({
        activities: [{ name: `/help | ${servers} Servers`, type: 3 }], // 3 = WATCHING
        status: 'idle'
    });
    console.log(`✅ ${Client.user.tag} is online!`);

    const allCommands = [...Client.SlashCmds.values()];
    const globalCommands = allCommands.filter(cmd => cmd.help.name !== 'reload').map(cmd => cmd.data);
    const adminCommands = allCommands.filter(cmd => cmd.help.name === 'reload').map(cmd => cmd.data);

    if (!globalCommands.length && !adminCommands.length) {
        console.log('[SLASH REG] - No command definitions found (missing .data property)');
        return;
    }

    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        const adminGuildId = process.env.SERVER_ID_ADMIN;
        const devGuildId = process.env.GUILD_ID;

        if (devGuildId) {
            // Guild commands — updates instantly (use during development)
            await rest.put(
                Routes.applicationGuildCommands(Client.user.id, devGuildId),
                { body: allCommands.map(cmd => cmd.data) }
            );
            console.log(`[SLASH REG] - Registered ${allCommands.length} slash commands to dev guild.`);
        } else {
            // Global commands — can take up to 1 hour to propagate (use for production)
            await rest.put(
                Routes.applicationCommands(Client.user.id),
                { body: globalCommands }
            );
            console.log(`[SLASH REG] - Registered ${globalCommands.length} slash commands globally.`);

            if (adminGuildId && adminCommands.length > 0) {
                await rest.put(
                    Routes.applicationGuildCommands(Client.user.id, adminGuildId),
                    { body: adminCommands }
                );
                console.log(`[SLASH REG] - Registered ${adminCommands.length} admin commands to admin guild (${adminGuildId}).`);
            }
        }
    } catch (err) {
        console.error('[SLASH REG] - Failed to register slash commands:', err);
    }
});