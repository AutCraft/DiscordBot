const { MessageAttachment } = require('discord.js');

module.exports.run = async (Client, inter) => {

    const queue = Client.player.getQueue(inter.guildId);
    const currentTrack = queue.current;
    if (!queue?.playing)
        return inter.followUp({
            content: "❌ ไม่มีการเล่นเพลงในคณะนี้!",
        });

    await queue.skip();

    const file = new MessageAttachment('./assets/music.gif');

    inter.followUp({
        embeds: [
            {
                color: FFCC33,
                author: {
                    name: 'Quality Players',
                    icon_url: 'attachment://music.gif',
                },
                description: `เพลง: ${currentTrack}`,
                footer: {
                    text: `ได้ทำการข้ามเพลง`,
                },
            },
        ],
        files: [file],
    });
} 

module.exports.help = {
    name: 'skip',
}