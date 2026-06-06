const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports.data = new SlashCommandBuilder()
    .setName('clear')
    .setDescription('เคลียร์คิวเพลงทั้งหมด');

module.exports.run = async (Client, inter) => {
    const queue = useQueue(inter.guildId);

    if (!queue) return inter.followUp({ content: '❌ ไม่มีเพลงกำลังเล่นอยู่ในขณะนี้' });

    const botVoice = inter.guild.members.me?.voice.channelId;
    if (botVoice && inter.member.voice.channelId !== botVoice)
        return inter.followUp({ content: '❌ คุณต้องอยู่ในห้องพูดคุยของบอทเพื่อล้างคิว!' });

    queue.tracks.clear();
    inter.followUp({ content: '👍 ได้ทำการล้างคิวเพลงแล้ว!' });
};

module.exports.help = { name: 'clear' };