const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports.data = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('หยุดเล่นเพลงและล้างคิว');

module.exports.run = async (Client, inter) => {
    const queue = useQueue(inter.guildId);
    if (!queue || !queue.node.isPlaying())
        return void inter.followUp({ content: '❌ ไม่มีการเล่นเพลงในขณะนี้!' });

    queue.delete();
    inter.followUp({ content: '👍 หยุดเล่นเพลงสำเร็จแล้ว' });
};

module.exports.help = { name: 'stop' };