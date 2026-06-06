const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports.data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('แสดงค่าความหน่วงของบอท');

module.exports.run = async (Client, inter) => {
    const embed = new EmbedBuilder()
        .setColor('#FFCC33')
        .setTitle('PONG! 🏓')
        .setThumbnail(inter.user.displayAvatarURL())
        .addFields(
            { name: 'Latency', value: `\`${Date.now() - inter.createdTimestamp}ms\``, inline: true },
            { name: 'API Latency', value: `\`${Math.round(Client.ws.ping)}ms\``, inline: true }
        );

    inter.followUp({ embeds: [embed] });
};

module.exports.help = { name: 'ping' };