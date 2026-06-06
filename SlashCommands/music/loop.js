const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { useQueue, QueueRepeatMode } = require('discord-player');

module.exports.data = new SlashCommandBuilder()
    .setName('loop')
    .setDescription('ตั้งค่าโหมดวนซ้ำ')
    .addIntegerOption(option =>
        option.setName('mode')
            .setDescription('ประเภทลูป')
            .setRequired(true)
            .addChoices(
                { name: 'ปิด', value: QueueRepeatMode.OFF },
                { name: 'เพลงเดียว 🔂', value: QueueRepeatMode.TRACK },
                { name: 'ทั้งคิว 🔁', value: QueueRepeatMode.QUEUE },
                { name: 'เล่นอัตโนมัติ ▶', value: QueueRepeatMode.AUTOPLAY },
            )
    );

module.exports.run = async (Client, inter) => {
    const queue = useQueue(inter.guildId);
    if (!queue || !queue.node.isPlaying())
        return void inter.followUp({ content: '❌ ไม่มีการเล่นเพลงในขณะนี้!' });

    const loopMode = inter.options.getInteger('mode');
    queue.setRepeatMode(loopMode);

    const modeText = loopMode === QueueRepeatMode.OFF ? 'ปิดลูป 👍'
        : loopMode === QueueRepeatMode.TRACK ? 'เพลงเดียว 🔂'
            : loopMode === QueueRepeatMode.QUEUE ? 'ทั้งคิว 🔁'
                : 'เล่นอัตโนมัติ ▶';

    const file = new AttachmentBuilder('./assets/music.gif');
    return void inter.followUp({
        embeds: [{
            color: 0xFFCC33,
            author: {
                name: 'HostWorker Players',
                icon_url: 'attachment://music.gif',
            },
            description: `✅ ได้ทำการเปลี่ยนเป็นแบบ \`${modeText}\``,
        }],
        files: [file],
    });
};

module.exports.help = { name: 'loop' };