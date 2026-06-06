const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports.data = new SlashCommandBuilder()
    .setName('volume')
    .setDescription('เปลี่ยนระดับเสียงบอท')
    .addIntegerOption(option =>
        option.setName('volume')
            .setDescription('ระดับเสียง 1 - 100')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
    );

module.exports.run = async (Client, inter) => {
    const volume = inter.options.getInteger('volume');
    const queue = useQueue(inter.guildId);

    const botVoice = inter.guild.members.me?.voice.channelId;
    if (botVoice && inter.member.voice.channelId !== botVoice)
        return inter.followUp({ content: '❌ คุณต้องอยู่ในห้องพูดคุยเพื่อเปลี่ยนระดับเสียง!' });

    if (!queue) return inter.followUp({ content: '❌ ไม่มีการเล่นเพลงในขณะนี้!' });

    queue.node.setVolume(volume);
    inter.followUp({ content: `👍 ตั้งค่าระดับเสียงเป็น **${volume}%**` });
};

module.exports.help = { name: 'volume' };