module.exports.run = async (Client, inter) => {

    //await interaction.deferReply();
    const queue = Client.player.getQueue(inter.guild);

    if (!queue) {
        return await inter.followUp({
            embeds: [
                {
                    color: "RED",
                    description: `❌ ไม่ได้อยู่ในห้องพูดคุย!`
                }
            ],
        });
    }

    if (
        inter.guild.me.voice.channelId &&
        inter.member.voice.channelId !==
        inter.guild.me.voice.channelId
    )
        return await inter.followUp({
            embeds: [
                {
                    color: "RED",
                    description: `❌ ไม่ได้อยู่ในห้องพูดคุย!`
                }
            ],
        });

    try {
        if (queue) {
            await queue.destroy(true);
            await inter.followUp({ content: `👍 ได้ทำการออกจากห้องสำเร็จ!` });
        }
    } catch (err) {
        Client.logger(err.message, "error");
        await inter.followUp({
            embeds: [
                {
                    color: "RED",
                    description: `❌ ไม่สามารถยกเลิกการเชื่อมต่อบอท`
                }
            ],
        });
    }
    
}

module.exports.help = {
    name: 'leave',
}