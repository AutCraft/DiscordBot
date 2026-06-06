const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports.data = new SlashCommandBuilder()
    .setName('searchanime')
    .setDescription('ค้นหาอนิเมะ')
    .addStringOption(option =>
        option.setName('anime')
            .setDescription('ชื่ออนิเมะที่ต้องการค้นหา')
            .setRequired(true)
    );

module.exports.run = async (Client, inter) => {
    const animeName = inter.options.getString('anime');

    try {
        const { data } = await axios.get(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(animeName)}`, {
            headers: {
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json',
            }
        });

        const anime = data?.data?.[0];
        if (!anime) return inter.followUp({ content: '❌ ไม่มี Anime เรื่องนี้' });

        const attr = anime.attributes;
        const embed = new EmbedBuilder()
            .setTitle(attr.titles.en_jp ?? attr.titles.en ?? animeName)
            .setURL(`https://kitsu.io/anime/${anime.id}`)
            .setThumbnail(attr.posterImage?.original)
            .setDescription(attr.synopsis ? attr.synopsis.slice(0, 1024) : 'N/A')
            .setColor('#FFCC33')
            .addFields(
                { name: 'ประเภท', value: attr.showType ?? 'N/A', inline: true },
                { name: 'ปีที่ทำ', value: `${attr.startDate ?? 'N/A'} ถึง ${attr.endDate ?? 'N/A'}`, inline: true },
                { name: 'สถานะ', value: attr.status ?? 'N/A', inline: true },
                { name: 'จำนวนตอน', value: String(attr.episodeCount ?? 'N/A'), inline: true },
                { name: 'ระยะเวลา/ตอน', value: `${attr.episodeLength ?? 'N/A'} นาที`, inline: true },
                { name: 'เรทอายุ', value: attr.ageRating ?? 'N/A', inline: true },
                { name: 'อันดับเรตติ้ง', value: String(attr.ratingRank ?? 'N/A'), inline: true },
                { name: 'คะแนนเฉลี่ย', value: attr.averageRating ?? 'N/A', inline: true },
            );

        inter.editReply({ embeds: [embed] });
    } catch (err) {
        console.error(err);
        inter.editReply({ content: '❌ ไม่มี Anime เรื่องนี้ หรือเกิดข้อผิดพลาด' });
    }
};

module.exports.help = { name: 'searchanime' };