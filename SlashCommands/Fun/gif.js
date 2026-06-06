const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports.data = new SlashCommandBuilder()
    .setName('gif')
    .setDescription('หาภาพ GIF')
    .addStringOption(option =>
        option.setName('search')
            .setDescription('ค้นหาชื่อภาพ GIF')
            .setRequired(true)
    );

module.exports.run = async (Client, inter) => {
    const keywords = inter.options.getString('search');
    const url = `https://g.tenor.com/v1/search?q=${encodeURIComponent(keywords)}&key=${process.env.TENORKEY}&limit=8`;

    try {
        const response = await fetch(url);
        const json = await response.json();
        if (!json.results || !json.results.length)
            return inter.followUp({ content: '❌ ไม่พบ GIF ที่ค้นหา!' });

        const index = Math.floor(Math.random() * json.results.length);
        inter.followUp(json.results[index].url);
    } catch (err) {
        inter.followUp({ content: '❌ เกิดข้อผิดพลาดในการค้นหา GIF' });
    }
};

module.exports.help = { name: 'gif' };