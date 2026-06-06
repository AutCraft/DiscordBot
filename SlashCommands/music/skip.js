const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports.data = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('ข้ามเพลงปัจจุบัน');

module.exports.run = async (Client, inter) => {
    const queue = useQueue(inter.guildId);
    if (!queue || !queue.node.isPlaying())
        return inter.followUp({ content: '❌ ไม่มีการเล่นเพลงในขณะนี้!' });

    const currentTrack = queue.currentTrack;
    queue.node.skip();

    const file = new AttachmentBuilder('./assets/music.gif');
    inter.followUp({
        embeds: [{
            color: 0xFFCC33,
            author: {
                name: 'HostWorker Players',
                icon_url: 'attachment://music.gif',
            },
            description: `⏭️ ข้ามเพลง: **${currentTrack.title}**`,
            footer: { text: 'ได้ทำการข้ามเพลง' },
        }],
        files: [file],
    });
};

module.exports.help = { name: 'skip' };