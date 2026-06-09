const { SlashCommandBuilder } = require('discord.js');
const { vlrApi, getVlrEmbedTemplate, getVlrAttachment, getVlrErrorEmbed } = require('../../utils/vlrApi');

const CLEAN = (s) => (!s || ['N/A', 'TBA', 'TBD'].includes(String(s).trim())) ? '-' : String(s);

module.exports.data = new SlashCommandBuilder()
    .setName('valorant-player')
    .setDescription('ดู stats ของ pro player')
    .addStringOption(option =>
        option.setName('player')
            .setDescription('ชื่อผู้เล่น (เช่น tenz)')
            .setRequired(true)
    );

module.exports.run = async (Client, inter) => {
    const playerQuery = inter.options.getString('player').toLowerCase();

    try {
        // Search for player by name
        const searchRes = await vlrApi.get(`/v2/search?q=${encodeURIComponent(playerQuery)}`);
        const players = searchRes.data?.data?.segments?.results?.players || [];

        if (players.length === 0) {
            const embed = getVlrErrorEmbed(`🔍 ไม่พบผู้เล่น \`${playerQuery}\` ในระบบ`);
            return inter.followUp({ embeds: [embed], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
        }

        // Fetch full player profile
        const { data } = await vlrApi.get(`/v2/player?id=${players[0].id}&q=profile&timespan=all`);
        const player = data?.data?.segments?.[0];

        if (!player) {
            return inter.followUp({ embeds: [getVlrErrorEmbed('📭 ไม่พบข้อมูลผู้เล่นจาก vlrggapi')], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
        }

        const agentStats = player.agent_stats || [];
        const embed = getVlrEmbedTemplate();
        embed.title = `👤 ${player.name || 'N/A'} (${player.real_name || 'N/A'})`;

        const avatarUrl = player.avatar;
        if (avatarUrl) embed.thumbnail = { url: avatarUrl.startsWith('//') ? `https:${avatarUrl}` : avatarUrl };

        // Build top stats from top agent
        const topAgent = agentStats[0] || {};
        const statsBlock = [
            `Rating:  ${CLEAN(topAgent.rating)}`,
            `ACS:     ${CLEAN(topAgent.acs)}`,
            `K/D:     ${CLEAN(topAgent.kd)}`,
            `ADR:     ${CLEAN(topAgent.adr)}`,
            `KAST%:   ${CLEAN(topAgent.kast)}`,
        ].join('\n');

        // Top 3 agents
        const agentsText = agentStats.slice(0, 3)
            .map((a, i) => `${i + 1}. ${a.agent} — ${a.use_count || a.usage_count} games · ${a.use_pct || a.usage_pct}`)
            .join('\n') || '-';

        // Team info
        const currentTeam = player.current_team;
        let teamText = '-';
        if (currentTeam?.name) {
            teamText = `${currentTeam.name} [ ${currentTeam.status || 'Active'} ]`;
        } else if (player.past_teams?.length > 0) {
            const t = player.past_teams[0];
            teamText = `(Past) ${t.name} [ ${t.dates || '-'} ]`;
        }

        embed.fields = [
            { name: '🛡️ Team', value: teamText, inline: false },
            { name: '📊 Stats (All Time)', value: `\`\`\`\n${statsBlock}\n\`\`\``, inline: false },
            { name: '🦸 Top 3 Agents', value: agentsText, inline: false },
        ];

        const files = getVlrAttachment() ? [getVlrAttachment()] : [];
        await inter.followUp({ embeds: [embed], files });

    } catch (err) {
        console.error('[valorant-player]', err.message);
        await inter.followUp({ embeds: [getVlrErrorEmbed('❌ เกิดข้อผิดพลาดในการดึงข้อมูล')], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
    }
};

module.exports.help = { name: 'valorant-player' };
