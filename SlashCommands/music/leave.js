const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports.data = new SlashCommandBuilder()
    .setName('leave')
    .setDescription('ออกจากห้องพูดคุย');

module.exports.run = async (Client, inter) => {
    const queue = useQueue(inter.guildId);

    if (!queue) return inter.followUp({ content: '❌ บอทไม่ได้อยู่ในห้องพูดคุยในขณะนี้!' });

    const botVoice = inter.guild.members.me?.voice.channelId;
    if (botVoice && inter.member.voice.channelId !== botVoice)
        return inter.followUp({ content: '❌ คุณต้องอยู่ในห้องพูดคุยเดียวกับบอท!' });

    queue.delete();
    inter.followUp({ content: '👍 ได้ทำการออกจากห้องสำเร็จ!' });
};

module.exports.help = { name: 'leave' };