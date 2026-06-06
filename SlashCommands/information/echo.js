const { SlashCommandBuilder } = require('discord.js');

module.exports.data = new SlashCommandBuilder()
    .setName('echo')
    .setDescription('บอทจะพิมพ์คำของคุณ')
    .addStringOption(option =>
        option.setName('text')
            .setDescription('ข้อความที่ต้องการให้บอทพิมพ์')
            .setRequired(true)
    );

module.exports.run = async (Client, inter) => {
    const text = inter.options.getString('text');
    return await inter.followUp({ content: text });
};

module.exports.help = { name: 'echo' };