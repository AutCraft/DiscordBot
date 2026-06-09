const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { vlrApi, getVlrEmbedTemplate, getVlrAttachment, getVlrErrorEmbed } = require('../../utils/vlrApi');

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
        // 1. Search for the player
        const searchRes = await vlrApi.get(`/v2/search?q=${encodeURIComponent(playerQuery)}`);
        const players = searchRes.data?.data?.segments?.results?.players || [];

        if (players.length === 0) {
            const embed = getVlrErrorEmbed(`🔍 ไม่พบผู้เล่น \`${playerQuery}\` ในระบบ`);
            return inter.followUp({ embeds: [embed], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
        }

        const playerId = players[0].id;

        // Fetch player profile from V2 API
        const response = await vlrApi.get(`/v2/player?id=${playerId}&q=profile&timespan=all`);
        const playerData = response.data?.data?.segments?.[0];

        if (!playerData) {
            const embed = getVlrErrorEmbed('📭 ไม่พบข้อมูลผู้เล่นจาก vlrggapi');
            return inter.followUp({ embeds: [embed], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
        }

        const info = playerData;
        const currentTeams = [playerData.current_team].filter(Boolean);
        const agentStats = playerData.agent_stats || [];

        const embed = getVlrEmbedTemplate();
        embed.title = `👤 ${info.name || 'N/A'} (${info.real_name || 'N/A'})`;
        if (info.avatar && info.avatar !== '') {
            let avatarUrl = info.avatar;
            if (avatarUrl.startsWith('//')) avatarUrl = 'https:' + avatarUrl;
            embed.thumbnail = { url: avatarUrl };
        }

        const stats = agentStats[0] || {};
        const statsDesc = `Rating:  ${stats.rating || '-'}\nACS:     ${stats.acs || '-'}\nK/D:     ${stats.kd || '-'}\nADR:     ${stats.adr || '-'}\nKAST%:   ${stats.kast || '-'}`;

        let agentsDesc = '';
        for (let i = 0; i < Math.min(agentStats.length, 3); i++) {
            const a = agentStats[i];
            agentsDesc += `${i + 1}. ${a.agent} — ${a.use_count || a.usage_count} usage · Win ${a.use_pct || a.usage_pct}\n`;
        }

        let teamInfo = '-';
        if (currentTeams.length > 0) {
            const t = currentTeams[0];
            teamInfo = `${t.name} [ ${t.status || 'Active'} ]`;
        } else if (playerData.past_teams && playerData.past_teams.length > 0) {
            const t = playerData.past_teams[0];
            teamInfo = `(Past) ${t.name} [ ${t.dates || '-'} ]`;
        }

        embed.fields = [
            { name: '🛡️ Team', value: teamInfo, inline: false },
            { name: '📊 Stats (All Time)', value: `\`\`\`\n${statsDesc}\n\`\`\``, inline: false },
            { name: '🦸 Top 3 Agents', value: agentsDesc ? agentsDesc : '-', inline: false }
        ];

        const files = getVlrAttachment() ? [getVlrAttachment()] : [];
        await inter.followUp({ embeds: [embed], files });

    } catch (err) {
        console.error(err);
        const errorEmbed = getVlrErrorEmbed('❌ เกิดข้อผิดพลาดในการดึงข้อมูล vlrggapi');
        await inter.followUp({ embeds: [errorEmbed], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
    }
};

module.exports.help = { name: 'valorant-player' };
