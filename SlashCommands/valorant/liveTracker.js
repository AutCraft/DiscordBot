const { SlashCommandBuilder } = require('discord.js');
const { vlrApi, getVlrEmbedTemplate, getVlrAttachment, getVlrErrorEmbed } = require('../../utils/vlrApi');

module.exports.data = new SlashCommandBuilder()
    .setName('valorant-livetracker')
    .setDescription('ติดตาม Live Score แบบอัปเดตอัตโนมัติ (Tracker)');

module.exports.run = async (Client, inter) => {


    try {
        const response = await vlrApi.get('/match?q=live_score');
        const segments = response.data?.data?.segments || [];

        if (segments.length === 0) {
            const embed = getVlrEmbedTemplate();
            embed.description = 'ตอนนี้ไม่มีแมตช์ live';
            return inter.followUp({ embeds: [embed], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
        }

        const buildTrackerEmbed = (matches, isEnded = false, timeout = false) => {
            const embed = getVlrEmbedTemplate();
            embed.title = '🔴 Live Tracker';
            if (isEnded) {
                embed.title = '✅ การแข่งขันจบแล้ว';
                embed.description = 'ไม่พบแมตช์ที่กำลังแข่งในขณะนี้';
                return embed;
            }
            if (timeout) {
                embed.title = '⏹️ หยุด tracker อัตโนมัติ (3h)';
                embed.description = 'เซสชั่นเกินเวลาที่กำหนด (3 ชั่วโมง)';
                return embed;
            }

            if (matches.length === 0) {
                embed.description = 'ไม่พบข้อมูลแมตช์';
            } else {
                const limit = Math.min(matches.length, 10);
                let matchText = '';
                
                const cleanStr = (s) => (!s || String(s).trim() === 'N/A' || String(s).trim() === 'TBA' || String(s).trim() === 'TBD') ? '-' : String(s);

                for (let i = 0; i < limit; i++) {
                    const match = matches[i];
                    const scoreStr = (cleanStr(match.score1) === '-' && cleanStr(match.score2) === '-') ? '-' : `${match.score1 || 0} - ${match.score2 || 0}`;
                    const mapStr = cleanStr(match.current_map) !== '-' ? `Map: ${match.current_map}` : '';
                    matchText += `**${cleanStr(match.team1)} vs ${cleanStr(match.team2)}**\n${cleanStr(match.match_event)}\n${scoreStr} ${mapStr}\n────────────────────────\n`;
                }
                
                if (matchText.length > 1024) matchText = matchText.substring(0, 1020) + '...';

                embed.fields = [
                    { name: 'Match', value: matchText || 'ไม่มีข้อมูล', inline: false }
                ];
            }

            const now = new Date();
            const timeString = now.toTimeString().split(' ')[0];
            embed.footer = { text: `by vlr · อัปเดตล่าสุด: ${timeString}` };
            return embed;
        };

        let initialEmbed = buildTrackerEmbed(segments);
        const files = getVlrAttachment() ? [getVlrAttachment()] : [];
        const message = await inter.followUp({ embeds: [initialEmbed], files });

        // 3 hours = 10800000 ms
        const MAX_DURATION = 3 * 60 * 60 * 1000;
        const INTERVAL_TIME = 30 * 1000;
        let elapsed = 0;

        const intervalId = setInterval(async () => {
            elapsed += INTERVAL_TIME;

            if (elapsed >= MAX_DURATION) {
                clearInterval(intervalId);
                const timeoutEmbed = buildTrackerEmbed([], false, true);
                return message.edit({ embeds: [timeoutEmbed], files: [] }).catch(() => { });
            }

            try {
                const res = await vlrApi.get('/match?q=live_score');
                const liveMatches = res.data?.data?.segments || [];

                if (liveMatches.length === 0) {
                    clearInterval(intervalId);
                    const endedEmbed = buildTrackerEmbed([], true, false);
                    return message.edit({ embeds: [endedEmbed], files: [] }).catch(() => { });
                }

                const updatedEmbed = buildTrackerEmbed(liveMatches);
                await message.edit({ embeds: [updatedEmbed], files: [] }).catch(() => { });
            } catch (err) {
                console.error('Tracker API Error:', err);
                // Don't stop tracker on a single API fail, just wait for next tick
            }
        }, INTERVAL_TIME);

    } catch (err) {
        console.error(err);
        const errorEmbed = getVlrErrorEmbed('❌ ไม่สามารถเชื่อมต่อ vlrggapi ได้ในขณะนี้');
        await inter.followUp({ embeds: [errorEmbed], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
    }
};

module.exports.help = { name: 'valorant-live-tracker' };
