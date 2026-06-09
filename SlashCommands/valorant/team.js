const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { vlrApi, getVlrEmbedTemplate, getVlrAttachment, getVlrErrorEmbed } = require('../../utils/vlrApi');

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
        // 1. Search for the team
        const searchRes = await vlrApi.get(`/v2/search?q=${encodeURIComponent(teamQuery)}`);
        const teams = searchRes.data?.data?.segments?.results?.teams || [];

        if (teams.length === 0) {
            const embed = getVlrErrorEmbed(`🔍 ไม่พบทีม \`${teamQuery}\` ในระบบ`);
            return inter.followUp({ embeds: [embed], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
        }

        const teamId = teams[0].id;

        // Fetch team info & recent matches
        const [teamRes, matchesRes] = await Promise.all([
            vlrApi.get(`/v2/team?id=${teamId}&q=profile`),
            vlrApi.get(`/team/matches?id=${teamId}`)
        ]);

        const teamInfo = teamRes.data?.data?.segments?.[0];
        const teamRoster = teamInfo?.roster || [];
        const matchesData = matchesRes.data?.data?.segments || [];

        if (!teamInfo) {
            const embed = getVlrErrorEmbed('📭 ไม่พบข้อมูลโปรไฟล์ทีมจาก vlrggapi');
            return inter.followUp({ embeds: [embed], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
        }

        const embed = getVlrEmbedTemplate();
        embed.title = `🛡️ ${teamInfo.name} [${teamInfo.tag || teamQuery.toUpperCase()}]`;
        if (teamInfo.logo && teamInfo.logo !== '') {
            let logoUrl = teamInfo.logo;
            if (logoUrl.startsWith('//')) logoUrl = 'https:' + logoUrl;
            embed.thumbnail = { url: logoUrl };
        }

        let rosterDesc = '';
        for (const player of teamRoster) {
            const isCap = player.is_captain ? ' 👑' : '';
            const playerName = player.alias || player.real_name || 'Unknown';
            rosterDesc += `• ${playerName} (${player.role || 'Player'})${isCap}\n`;
        }

        embed.fields = [
            { name: '👥 Roster', value: rosterDesc || '-', inline: false }
        ];

        if (matchesData.length === 0) {
            embed.fields.push({ name: '📊 Recent Matches', value: 'ไม่มีข้อมูลแมตช์', inline: false });
        } else {
            let matchText = '';
            
            const cleanStr = (s) => (!s || String(s).trim() === 'N/A' || String(s).trim() === 'TBA' || String(s).trim() === 'TBD') ? '-' : String(s);

            for (const match of matchesData.slice(0, 5)) {
                const myTeam = teamInfo.tag || teamInfo.name || teamQuery.toUpperCase();
                
                // Find opponent
                let opp = 'Unknown';
                if (match.team1 && typeof match.team1 === 'object') {
                    if (match.team1.name && match.team1.name.toLowerCase() !== teamInfo.name.toLowerCase()) {
                        opp = match.team1.name;
                    } else if (match.team2 && match.team2.name) {
                        opp = match.team2.name;
                    }
                } else if (match.teams) {
                    if (match.teams.team1 && match.teams.team1.toLowerCase() !== teamInfo.name.toLowerCase()) {
                        opp = match.teams.team1;
                    } else if (match.teams.team2 && match.teams.team2.toLowerCase() !== teamInfo.name.toLowerCase()) {
                        opp = match.teams.team2;
                    } else {
                        opp = match.teams.team2 || 'Unknown';
                    }
                }
                
                let ev = match.event || match.tournament_name || 'Unknown';
                let scoreStr = match.score || '-';
                
                // format date to GMT+7 if possible
                let matchTime = cleanStr(match.date || match.time_completed);
                if (matchTime !== '-') {
                    // Fix malformed date string from API e.g. "2026/05/308:00 pm" -> "2026/05/30 8:00 pm"
                    matchTime = matchTime.replace(/(\d{4}\/\d{2}\/\d{2})(\d{1,2}:\d{2}\s[ap]m)/i, '$1 $2');
                    try {
                        const dateObj = new Date(matchTime + " GMT");
                        if (!isNaN(dateObj.getTime())) {
                            const formatter = new Intl.DateTimeFormat('th-TH', { 
                                timeZone: 'Asia/Bangkok', 
                                dateStyle: 'medium',
                                timeStyle: 'short'
                            });
                            matchTime = formatter.format(dateObj) + ' (GMT+7)';
                        }
                    } catch (e) {
                        // fallback to original string
                    }
                }

                matchText += `**${myTeam} vs ${cleanStr(opp)}**\n${cleanStr(ev)}\n${cleanStr(scoreStr)} (${matchTime})\n────────────────────────\n`;
            }
            
            if (matchText.length > 1024) matchText = matchText.substring(0, 1020) + '...';

            embed.fields.push(
                { name: '📊 Recent Matches', value: matchText || 'ไม่มีข้อมูล', inline: false }
            );
        }

        const files = getVlrAttachment() ? [getVlrAttachment()] : [];
        await inter.followUp({ embeds: [embed], files });

    } catch (err) {
        console.error(err);
        const errorEmbed = getVlrErrorEmbed('❌ เกิดข้อผิดพลาดในการดึงข้อมูล vlrggapi');
        await inter.followUp({ embeds: [errorEmbed], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
    }
};

module.exports.help = { name: 'valorant-team' };
