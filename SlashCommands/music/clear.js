module.exports.run = async (Client, inter) => {

    //await inter.deferReply();
    const queue = Client.player.getQueue(inter.guild);

    if (
        inter.guild.me.voice.channelId &&
        inter.member.voice.channelId !==
        inter.guild.me.voice.channelId
    )
        return await inter.followUp({
            embeds: [
                {
                    color: "RED",
                    description: `❌ คุณต้องอยู่ในห้องพูดคุยของฉันเพื่อล้างคิว!`
                }  
            ],
        });

    if (!queue) {
        return await inter.followUp({
            embeds: [
                {
                    color:"RED",
                    description: `❌ ไม่มีเพลงกำลังเล่นอยู่ในคณะนี้`
                },
            ],
        });
    }

    try {
        if (queue) {
            await queue.clear();
            await inter.followUp({ content:  `👍 ได้ทำการล้างคิวเพลงแล้ว!` });
        }
    } catch (err) {
        Client.logger(err.message, "error");
        await inter.followUp({
            embeds: [
                {
                    color: "RED",
                    description: "❌ เคลียร์คิวเพลงไม่ได้, อาจจะไม่มีคิวเพลง"
                }
            ],
        });
    }
}

module.exports.help = {
    name: 'clear',
}