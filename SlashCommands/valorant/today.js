const { SlashCommandBuilder } = require('discord.js');
const { vlrApi, getVlrEmbedTemplate, getVlrAttachment, getVlrErrorEmbed } = require('../../utils/vlrApi');

module.exports.data = new SlashCommandBuilder()
    .setName('valorant-today')
    .setDescription('แสดงแมตช์ทั้งหมดของวันนี้ (ทั้งที่แข่งแล้วและยังไม่แข่ง)');

module.exports.run = async (Client, inter) => {


    try {
        const [upcomingRes, resultsRes] = await Promise.all([
            vlrApi.get('/match?q=upcoming'),
            vlrApi.get('/match?q=results')
        ]);

        const upcomingSegments = upcomingRes.data?.data?.segments || [];
        const resultsSegments = resultsRes.data?.data?.segments || [];

        const today = new Date();
        const isToday = (timestamp) => {
            if (!timestamp) return false;
            // Handle if timestamp is seconds instead of ms
            const ms = String(timestamp).length <= 10 && !isNaN(Number(timestamp)) ? Number(timestamp) * 1000 : timestamp;
            const d = new Date(ms);
            return d.getDate() === today.getDate() &&
                   d.getMonth() === today.getMonth() &&
                   d.getFullYear() === today.getFullYear();
        };

        const todayUpcoming = upcomingSegments.filter(m => isToday(m.unix_timestamp));
        const todayResults = resultsSegments.filter(m => isToday(m.unix_timestamp));

        const embed = getVlrEmbedTemplate();
        embed.title = `📆 Today's Matches — ${today.toLocaleDateString('th-TH')}`;

        embed.fields = [];

        const cleanStr = (s) => (!s || String(s).trim() === 'N/A' || String(s).trim() === 'TBA' || String(s).trim() === 'TBD') ? '-' : String(s);

        if (todayUpcoming.length === 0) {
            embed.fields.push({ name: '🕐 Upcoming', value: 'ไม่มีแมตช์ที่รอแข่ง', inline: false });
        } else {
            let matchText = '';
            for (const match of todayUpcoming.slice(0, 5)) {
                matchText += `**${cleanStr(match.team1)} vs ${cleanStr(match.team2)}**\n${cleanStr(match.match_event)}\n${cleanStr(match.time_until_match)}\n────────────────────────\n`;
            }
            if (matchText.length > 1024) matchText = matchText.substring(0, 1020) + '...';
            embed.fields.push({ name: '🕐 Upcoming', value: matchText, inline: false });
        }

        if (todayResults.length === 0) {
            embed.fields.push({ name: '✅ Completed', value: 'ยังไม่มีแมตช์ที่จบวันนี้', inline: false });
        } else {
            let matchText = '';
            for (const match of todayResults.slice(0, 5)) {
                const scoreStr = (cleanStr(match.score1) === '-' && cleanStr(match.score2) === '-') ? '-' : `${match.score1 || 0} - ${match.score2 || 0}`;
                const eventName = cleanStr(match.tournament_name) !== '-' ? cleanStr(match.tournament_name) : cleanStr(match.match_event);
                matchText += `**${cleanStr(match.team1)} vs ${cleanStr(match.team2)}**\n${eventName}\n${scoreStr} (${cleanStr(match.time_completed)})\n────────────────────────\n`;
            }
            if (matchText.length > 1024) matchText = matchText.substring(0, 1020) + '...';
            embed.fields.push({ name: '✅ Completed', value: matchText, inline: false });
        }

        const files = getVlrAttachment() ? [getVlrAttachment()] : [];
        await inter.followUp({ embeds: [embed], files });

    } catch (err) {
        console.error(err);
        const errorEmbed = getVlrErrorEmbed('❌ ไม่สามารถเชื่อมต่อ vlrggapi ได้ในขณะนี้');
        await inter.followUp({ embeds: [errorEmbed], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
    }
};

module.exports.help = { name: 'valorant-today' };
