const Client = require("../index").Client
const Timeout = new Set()
Client.on('interactionCreate', async (inter) => {
    if(inter.isCommand()) {
        await inter.deferReply({ ephemeral: false }).catch(() => {});

        const cmd = Client.SlashCmds.get(inter.commandName);
        if (!cmd)
            return inter.followUp({ content: "An error has occured " });

        const args = [];

        for (let option of inter.options.data) {
            if (option.type === "SUB_COMMAND") {
                if (option.name) args.push(option.name);
                option.options?.forEach((x) => {
                    if (x.value) args.push(x.value);
                });
            } else if (option.value) args.push(option.value);
        }
        inter.member = inter.guild.members.cache.get(inter.user.id);

        cmd.run(Client, inter, args);

        /*let slashCmds = Client.SlashCmds.get(inter.commandName)
        if(slashCmds) slashCmds.run(Client, inter)*/
        /*try {
            if (slashCmds.timeout) {
                if (Timeout.has(`${inter.user.id}${slashCmds.name}`)) {
                    return inter.reply({ content: `You need to wait **${humanizeDuration(slashCmds.timeout, { round: true })}** to use command again`, ephemeral: true })
                }
            }
            if (slashCmds.permissions) {
                if (!inter.member.permissions.has(slashCmds.permissions)) {
                    return inter.reply({ content: `:x: You need \`${slashCmds.permissions}\` to use this command`, ephemeral: true })
                }
            }
            slashCmds.run(Client, inter)
            Timeout.add(`${inter.user.id}${slashCmds.name}`)
            setTimeout(() => {
                Timeout.delete(`${inter.user.id}${slashCmds.name}`)
            }, slashCmds.timeout)
        } catch (error) {
            console.error(error)
            await inter.reply({ content: ":x: There was an error while executing this command!", ephemeral: true })
        }*/

    }
    if (inter.isContextMenu()) {
        await inter.deferReply({ ephemeral: false });
        const command = Client.SlashCmds.get(inter.commandName);
        if (command) command.run(Client, inter);
    }
})