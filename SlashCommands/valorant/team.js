const { SlashCommandBuilder } = require('discord.js');
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
        const lookupPath = path.join(__dirname, '../../db/vlrLookup.json');
        let lookupData;
        try {
            lookupData = JSON.parse(fs.readFileSync(lookupPath, 'utf8'));
        } catch (e) {
            lookupData = { teams: {} };
        }

        const teamId = lookupData.teams[teamQuery];

        if (!teamId) {
            const embed = getVlrErrorEmbed('🔍 ไม่พบทีมนี้ในฐานข้อมูล กรุณาเพิ่มใน vlrLookup.json ก่อน');
            return inter.followUp({ embeds: [embed], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
        }

        // Fetch team info & recent matches
        const [teamRes, matchesRes] = await Promise.all([
            vlrApi.get(`/team?id=${teamId}&q=profile`),
            vlrApi.get(`/team/matches?id=${teamId}&q=matches&page=1`)
        ]);

        const teamData = teamRes.data?.data?.segments?.[0];
        const matchesData = matchesRes.data?.data?.segments || [];

        if (!teamData) {
            const embed = getVlrErrorEmbed('📭 ไม่พบข้อมูลทีมจาก vlrggapi');
            return inter.followUp({ embeds: [embed], files: getVlrAttachment() ? [getVlrAttachment()] : [] });
        }

        const embed = getVlrEmbedTemplate();
        embed.title = `🛡️ ${teamData.name} [${teamData.tag || teamQuery.toUpperCase()}]`;
        if (teamData.logo) {
            embed.thumbnail = { url: teamData.logo };
        }

        let rosterDesc = '';
        const roster = teamData.roster || [];
        for (const player of roster) {
            const isCap = player.is_captain ? ' 👑' : '';
            const playerName = player.ign || player.user || player.alias || player.player || player.name || 'Unknown';
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
                const myTeam = teamData.tag || teamQuery.toUpperCase();
                
                let opp = match.team2 || match.opponent || match.team;
                if (opp && typeof opp === 'object') opp = opp.name || opp.tag || opp.team || 'Unknown';
                
                let ev = match.tournament_name || match.event_name || match.tournament || match.event || match.match_event || match.series;
                if (ev && typeof ev === 'object') ev = ev.name || 'Unknown';
                
                let s1 = match.score1 ?? match.team1_score ?? match.score_1;
                let s2 = match.score2 ?? match.team2_score ?? match.score_2;
                
                if (typeof s1 === 'object' && s1 !== null) s1 = s1.score || s1.value || 0;
                if (typeof s2 === 'object' && s2 !== null) s2 = s2.score || s2.value || 0;
                
                let matchTime = match.time_completed || match.time || match.date || match.eta || match.status || '-';

                const scoreStr = (cleanStr(s1) === '-' && cleanStr(s2) === '-') ? (match.score || match.result || '-') : `${s1 || 0} - ${s2 || 0}`;
                matchText += `**${myTeam} vs ${cleanStr(opp)}**\n${cleanStr(ev)}\n${cleanStr(scoreStr)} (${cleanStr(matchTime)})\n────────────────────────\n`;
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
