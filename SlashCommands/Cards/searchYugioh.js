const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports.data = new SlashCommandBuilder()
    .setName('searchyugioh')
    .setDescription('ค้นหาการ์ดยูกิ')
    .addStringOption(option =>
        option.setName('card')
            .setDescription('ชื่อการ์ดยูกิ (ภาษาอังกฤษ)')
            .setRequired(true)
    );

module.exports.run = async (Client, inter) => {
    const cardName = inter.options.getString('card');

    try {
        const { data } = await axios.get(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(cardName)}`);

        const card = data?.data?.[0];
        if (!card) return inter.editReply({ content: '❌ ไม่มี Card นี้' });

        const embed = new EmbedBuilder()
            .setTitle(card.name)
            .setThumbnail(`https://storage.googleapis.com/ygoprodeck.com/pics/${card.id}.jpg`)
            .setDescription(card.desc ?? 'N/A')
            .setColor('#FFCC33')
            .addFields(
                { name: 'ID', value: String(card.id ?? 'N/A'), inline: true },
                { name: 'ประเภท', value: card.type ?? 'N/A', inline: true },
                { name: 'พลังโจมตี', value: String(card.atk ?? 'N/A'), inline: true },
                { name: 'พลังป้องกัน', value: String(card.def ?? 'N/A'), inline: true },
                { name: 'เลเวล', value: String(card.level ?? 'N/A'), inline: true },
                { name: 'เผ่า', value: card.race ?? 'N/A', inline: true },
                { name: 'ธาตุ', value: card.attribute ?? 'N/A', inline: true },
                { name: 'ต้นแบบ', value: card.archetype ?? 'N/A', inline: true },
                { name: 'ค่าลิงค์', value: String(card.linkval ?? 'N/A'), inline: true },
            );

        inter.editReply({ embeds: [embed] });
    } catch (err) {
        console.error(err);
        inter.editReply({ content: '❌ ไม่มี Card นี้ หรือเกิดข้อผิดพลาด' });
    }
};

module.exports.help = { name: 'searchyugioh' };