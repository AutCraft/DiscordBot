const { QueueRepeatMode } = require('discord-player');
const { MessageAttachment } = require('discord.js');

module.exports.run = async (Client, inter) => {

    const queue = Client.player.getQueue(inter.guildId);
    //await queue.defer();
    if (!queue || !queue.playing) return void inter.followUp({ content: '❌ ไม่มีการเล่นเพลงในคณะนี้!' });
    const loopMode = inter.options.getInteger("mode");
    //return void inter.followUp(`${loopMode}`);
    const success = queue.setRepeatMode(loopMode);
    const mode = loopMode === QueueRepeatMode.OFF ? 'ปิดลูป👍' : loopMode === QueueRepeatMode.TRACK ? 'เล่นเพลงเดียว🔂' : loopMode === QueueRepeatMode.QUEUE ? 'เล่นทั้งคิว🔁' : 'เล่นอัตโนมัติ▶';
    //return void inter.followUp({ content: success ? `${mode} | Updated loop mode!` : '❌ | Could not update loop mode!' });

    const file = new MessageAttachment('./assets/music.gif');

    return void inter.followUp({
        embeds: [
            {
                color: FFCC33,
                author: {
                    name: 'Quality Players',
                    icon_url: 'attachment://music.gif',
                },
                description: `${success ? `ได้ทำการเปลี่ยนเป็นแบบ \`${ mode }\` ` : '❌ ไม่สามารถทำได้!'}`,
            },
        ],
        files: [file],
    });
}

module.exports.help = {
    name: 'loop',
}