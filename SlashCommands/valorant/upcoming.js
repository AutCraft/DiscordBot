const { SlashCommandBuilder } = require('discord.js');
const { vlrApi, getVlrEmbedTemplate, getVlrAttachment, getVlrErrorEmbed } = require('../../utils/vlrApi');

module.exports.data = new SlashCommandBuilder()
    .setName('valorant-upcoming')
    .setDescription('แสดงแมตช์ที่กำลังจะมาในข้างหน้า');

module.exports.run = async (Client, inter) => {


    try {
        const response = await vlrApi.get('/match?q=upcoming');
        const segments = response.data?.data?.segments || [];

        if (segments.length === 0) {
            const embed = getVlrEmbedTemplate();
            embed.description = 'ไม่มีแมตช์ในช่วงนี้';
            return inter.followUp({ embeds: [embed], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
        }

        const embed = getVlrEmbedTemplate();
        embed.title = '📅 Upcoming Matches';

        const limit = Math.min(segments.length, 10);
        let matchText = '';

        const cleanStr = (s) => (!s || String(s).trim() === 'N/A' || String(s).trim() === 'TBA' || String(s).trim() === 'TBD') ? '-' : String(s);

        for (let i = 0; i < limit; i++) {
            const match = segments[i];
            matchText += `**${cleanStr(match.team1)} vs ${cleanStr(match.team2)}**\n${cleanStr(match.match_event)}\n${cleanStr(match.time_until_match)}\n────────────────────────\n`;
        }

        // Limit to 1024 characters just in case
        if (matchText.length > 1024) {
            matchText = matchText.substring(0, 1020) + '...';
        }

        embed.fields = [
            { name: 'Match', value: matchText || 'ไม่มีข้อมูล', inline: false }
        ];
        const files = getVlrAttachment() ? [getVlrAttachment()] : [];
        await inter.followUp({ embeds: [embed], files });

    } catch (err) {
        console.error('[API Error]:', err.message);
        const errorEmbed = getVlrErrorEmbed('❌ ไม่สามารถเชื่อมต่อ vlrggapi ได้ในขณะนี้');
        await inter.followUp({ embeds: [errorEmbed], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
    }
};

module.exports.help = { name: 'valorant-upcoming' };
