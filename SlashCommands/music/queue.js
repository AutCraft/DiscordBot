const { AttachmentBuilder, SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports.data = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('แสดงคิวเพลงทั้งหมด');

module.exports.run = async (Client, inter) => {
    const queue = useQueue(inter.guildId);
    if (!queue || !queue.node.isPlaying())
        return inter.followUp({ content: '❌ ไม่มีเพลงกำลังเล่นอยู่ในขณะนี้' });

    const currentTrack = queue.currentTrack;
    const tracks = queue.tracks.toArray().slice(0, 10).map((m, i) =>
        `${i + 1}. **[${m.title}](${m.url})** - ${m.requestedBy.tag}`
    );

    const remaining = queue.tracks.size - 10;

    const file = new AttachmentBuilder('./assets/music.gif');
    return inter.followUp({
        embeds: [{
            color: 0xFFCC33,
            author: {
                name: 'HostWorker Players',
                icon_url: 'attachment://music.gif',
            },
            fields: [{
                name: '🎶 เพลงที่กำลังเล่นอยู่',
                value: `**[${currentTrack.title}](${currentTrack.url})** - ${currentTrack.requestedBy.tag}`,
            }],
            description: tracks.length
                ? tracks.join('\n') + (remaining > 0 ? `\n...และอีก ${remaining} เพลง` : '')
                : 'ไม่มีเพลงในคิว',
        }],
        files: [file],
    });
};

module.exports.help = { name: 'queue' };