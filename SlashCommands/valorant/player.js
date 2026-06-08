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
        const lookupPath = path.join(__dirname, '../../db/vlrLookup.json');
        let lookupData;
        try {
            lookupData = JSON.parse(fs.readFileSync(lookupPath, 'utf8'));
        } catch (e) {
            lookupData = { players: {} };
        }

        const playerId = lookupData.players[playerQuery];

        if (!playerId) {
            const embed = getVlrErrorEmbed('🔍 ไม่พบผู้เล่นนี้ในฐานข้อมูล กรุณาเพิ่มใน vlrLookup.json ก่อน');
            return inter.followUp({ embeds: [embed], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
        }

        const response = await vlrApi.get(`/player?id=${playerId}&q=profile&timespan=all`);
        const playerData = response.data?.data?.segments?.[0];

        if (!playerData) {
            const embed = getVlrErrorEmbed('📭 ไม่พบข้อมูลผู้เล่นจาก vlrggapi');
            return inter.followUp({ embeds: [embed], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
        }

        console.log("=== PLAYER DATA ===");
        console.log(JSON.stringify(playerData, null, 2));

        const embed = getVlrEmbedTemplate();
        embed.title = `👤 ${playerData.name || 'N/A'} (${playerData.real_name || 'N/A'})`;
        if (playerData.avatar) {
            embed.thumbnail = { url: playerData.avatar };
        }

        const stats = playerData.agent_stats[0] || {};
        const statsDesc = `Rating:  ${stats.rating || '-'}\nACS:     ${stats.acs || '-'}\nK/D:     ${stats.kd || '-'}\nADR:     ${stats.adr || '-'}\nKAST%:   ${stats.kast || '-'}`;

        let agentsDesc = '';
        const agents = playerData.agent_stats || [];
        for (let i = 0; i < Math.min(agents.length, 3); i++) {
            const a = agents[i];
            agentsDesc += `${i + 1}. ${a.agent} — ${a.usage_count} usage · Rating ${a.usage_pct}\n`;
        }

        let teamInfo = '-';
        if (playerData.current_team) {
            if (typeof playerData.current_team === 'object') {
                teamInfo = `${playerData.current_team.name} [ ${playerData.current_team.joined || '-'} ]`;
            } else {
                teamInfo = String(playerData.current_team);
            }
        }

        embed.fields = [
            { name: '🛡️ Team', value: teamInfo, inline: false },
            { name: '📊 Stats (Last 90d)', value: `\`\`\`\n${statsDesc}\n\`\`\``, inline: false },
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
