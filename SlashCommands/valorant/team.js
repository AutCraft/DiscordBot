const { SlashCommandBuilder } = require('discord.js');
const { vlrApi, getVlrEmbedTemplate, getVlrAttachment, getVlrErrorEmbed } = require('../../utils/vlrApi');

const CLEAN = (s) => (!s || ['N/A', 'TBA', 'TBD'].includes(String(s).trim())) ? '-' : String(s);

/** Format a match date string from the old API (e.g. "2026/05/308:00 pm") to GMT+7 */
function formatMatchTime(raw) {
    let t = CLEAN(raw);
    if (t === '-') return t;
    // Fix malformed date string: "2026/05/308:00 pm" → "2026/05/30 8:00 pm"
    t = t.replace(/(\d{4}\/\d{2}\/\d{2})(\d{1,2}:\d{2}\s[ap]m)/i, '$1 $2');
    try {
        const d = new Date(t + ' GMT');
        if (!isNaN(d.getTime())) {
            return new Intl.DateTimeFormat('th-TH', {
                timeZone: 'Asia/Bangkok',
                dateStyle: 'medium',
                timeStyle: 'short',
            }).format(d) + ' (GMT+7)';
        }
    } catch { /* fallback */ }
    return t;
}

/** Resolve opponent name from match object */
function getOpponent(match, myTeamName) {
    if (match.team1 && typeof match.team1 === 'object') {
        const t1 = match.team1.name;
        const t2 = match.team2?.name;
        return t1?.toLowerCase() !== myTeamName.toLowerCase() ? t1 : (t2 || 'Unknown');
    }
    if (match.teams) {
        const t1 = match.teams.team1;
        const t2 = match.teams.team2;
        if (t1?.toLowerCase() !== myTeamName.toLowerCase()) return t1;
        if (t2?.toLowerCase() !== myTeamName.toLowerCase()) return t2;
        return t2 || 'Unknown';
    }
    return 'Unknown';
}

module.exports.data = new SlashCommandBuilder()
    .setName('valorant-team')
    .setDescription('ดูข้อมูล roster, อันดับ และผลงานล่าสุดของทีม')
    .addStringOption(option =>
        option.setName('team')
            .setDescription('ชื่อย่อทีม หรือชื่อเต็ม (เช่น sen, prx)')
            .setRequired(true)
    );

module.exports.run = async (Client, inter) => {
    const teamQuery = inter.options.getString('team').toLowerCase();

    try {
        // Search for team by name
        const searchRes = await vlrApi.get(`/v2/search?q=${encodeURIComponent(teamQuery)}`);
        const teams = searchRes.data?.data?.segments?.results?.teams || [];

        if (teams.length === 0) {
            return inter.followUp({ embeds: [getVlrErrorEmbed(`🔍 ไม่พบทีม \`${teamQuery}\` ในระบบ`)], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
        }

        const teamId = teams[0].id;

        // Fetch team profile and recent match results in parallel
        const [profileRes, matchesRes] = await Promise.all([
            vlrApi.get(`/v2/team?id=${teamId}&q=profile`),
            vlrApi.get(`/team/matches?id=${teamId}`),
        ]);

        const teamInfo = profileRes.data?.data?.segments?.[0];
        const matchesData = matchesRes.data?.data?.segments || [];

        if (!teamInfo) {
            return inter.followUp({ embeds: [getVlrErrorEmbed('📭 ไม่พบข้อมูลโปรไฟล์ทีมจาก vlrggapi')], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
        }

        const embed = getVlrEmbedTemplate();
        embed.title = `🛡️ ${teamInfo.name} [${teamInfo.tag || teamQuery.toUpperCase()}]`;

        const logoUrl = teamInfo.logo;
        if (logoUrl) embed.thumbnail = { url: logoUrl.startsWith('//') ? `https:${logoUrl}` : logoUrl };

        // Roster
        const rosterText = (teamInfo.roster || [])
            .map(p => `• ${p.alias || p.real_name || 'Unknown'} (${p.role || 'Player'})${p.is_captain ? ' 👑' : ''}`)
            .join('\n') || '-';

        embed.fields = [{ name: '👥 Roster', value: rosterText, inline: false }];

        // Recent matches
        if (matchesData.length === 0) {
            embed.fields.push({ name: '📊 Recent Matches', value: 'ไม่มีข้อมูลแมตช์', inline: false });
        } else {
            let matchText = matchesData.slice(0, 5).map(match => {
                const myTag = teamInfo.tag || teamInfo.name || teamQuery.toUpperCase();
                const opp = getOpponent(match, teamInfo.name);
                const ev = CLEAN(match.event || match.tournament_name);
                const score = CLEAN(match.score);
                const time = formatMatchTime(match.date || match.time_completed);
                return `**${myTag} vs ${CLEAN(opp)}**\n${ev}\n${score} (${time})\n────────────────────────`;
            }).join('\n');

            if (matchText.length > 1024) matchText = matchText.substring(0, 1020) + '...';
            embed.fields.push({ name: '📊 Recent Matches', value: matchText || 'ไม่มีข้อมูล', inline: false });
        }

        const files = getVlrAttachment() ? [getVlrAttachment()] : [];
        await inter.followUp({ embeds: [embed], files });

    } catch (err) {
        console.error('[valorant-team]', err.message);
        await inter.followUp({ embeds: [getVlrErrorEmbed('❌ เกิดข้อผิดพลาดในการดึงข้อมูล')], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
    }
};

module.exports.help = { name: 'valorant-team' };
