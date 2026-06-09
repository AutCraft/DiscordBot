const fs = require('fs');
const path = require('path');
const { vlrApi, getVlrEmbedTemplate, getVlrAttachment, buildAsciiMatch } = require('./vlrApi');

function startVlrJobs(Client) {
    const notifyDbPath = path.join(__dirname, '../db/vlrNotify.json');
    const followDbPath = path.join(__dirname, '../db/vlrFollow.json');

    // Run every 5 minutes
    setInterval(async () => {
        try {
            let notifyDb;
            try {
                notifyDb = JSON.parse(fs.readFileSync(notifyDbPath, 'utf8'));
            } catch (e) {
                notifyDb = { enabled: false, notifiedMatches: [] };
            }

            let followDb;
            try {
                followDb = JSON.parse(fs.readFileSync(followDbPath, 'utf8'));
            } catch (e) {
                followDb = {};
            }

            const hasFollowers = Object.keys(followDb).length > 0;
            if (!notifyDb.enabled && !hasFollowers) return;
            
            if (!notifyDb.notifiedMatches) {
                notifyDb.notifiedMatches = [];
            }

            const res = await vlrApi.get('/v2/match?q=upcoming').catch(() => null);
            if (!res || !res.data?.data?.segments) return;

            const upcoming = res.data.data.segments;
            const now = Date.now();
            let dbUpdated = false;

            for (const match of upcoming) {
                if (!match.unix_timestamp) continue;
                
                // V2 API returns "YYYY-MM-DD HH:MM:SS". Assuming it's UTC time from the API.
                let ms;
                if (String(match.unix_timestamp).includes('-')) {
                    // Convert to ISO 8601 UTC
                    ms = new Date(match.unix_timestamp.replace(' ', 'T') + 'Z').getTime();
                } else {
                    ms = String(match.unix_timestamp).length <= 10 && !isNaN(Number(match.unix_timestamp)) ? Number(match.unix_timestamp) * 1000 : match.unix_timestamp;
                }
                
                const matchTime = new Date(ms).getTime();
                if (isNaN(matchTime)) continue;

                const timeDiff = matchTime - now;

                // Within 15 minutes
                if (timeDiff > 0 && timeDiff <= 900000) {
                    const matchId = match.match_event + match.team1 + match.team2; // Pseudo-unique ID

                    if (!notifyDb.notifiedMatches.includes(matchId)) {
                        
                        const formatter = new Intl.DateTimeFormat('th-TH', { 
                            timeZone: 'Asia/Bangkok', 
                            dateStyle: 'short', 
                            timeStyle: 'short' 
                        });
                        const matchTimeGMT7 = formatter.format(new Date(matchTime)) + ' (GMT+7)';
                        
                        // 1. Channel Notification
                        if (notifyDb.enabled && notifyDb.channelId) {
                            const channel = await Client.channels.fetch(notifyDb.channelId).catch(() => null);
                            if (channel) {
                                const embed = getVlrEmbedTemplate();
                                embed.title = '⚔️ แมตช์กำลังจะเริ่ม!';
                                const ascii = buildAsciiMatch(match.team1, match.team2, 'vs', match.match_event, matchTimeGMT7);
                                embed.description = `\`\`\`text\n${ascii}\n\`\`\`\n🔗 ${match.match_page || 'https://vlr.gg'}`;
                                
                                await channel.send({
                                    content: notifyDb.roleId ? `<@&${notifyDb.roleId}>` : '',
                                    embeds: [embed],
                                    files: getVlrAttachment() ? [getVlrAttachment()] : []
                                }).catch(console.error);
                            }
                        }

                        // 2. DM Notifications (Follow)
                        const team1Name = match.team1.toLowerCase();
                        const team2Name = match.team2.toLowerCase();

                        for (const [userId, followedTeams] of Object.entries(followDb)) {
                            // Check if followedTeams contains our team name
                            const isFollowed = followedTeams.some(t => {
                                if (typeof t === 'object' && t.name) {
                                    return t.name.toLowerCase() === team1Name || t.name.toLowerCase() === team2Name;
                                }
                                return false;
                            });

                            if (isFollowed) {
                                const user = await Client.users.fetch(userId).catch(() => null);
                                if (user) {
                                    const embed = getVlrEmbedTemplate();
                                    embed.title = '🔔 ทีมที่คุณติดตามกำลังจะแข่ง!';
                                    const ascii = buildAsciiMatch(match.team1, match.team2, 'vs', match.match_event, matchTimeGMT7);
                                    embed.description = `\`\`\`text\n${ascii}\n\`\`\`\n🔗 ${match.match_page || 'https://vlr.gg'}`;
                                    await user.send({
                                        embeds: [embed],
                                        files: getVlrAttachment() ? [getVlrAttachment()] : []
                                    }).catch(() => {}); // ignore DM disabled
                                }
                            }
                        }

                        notifyDb.notifiedMatches.push(matchId);
                        dbUpdated = true;
                    }
                }
            }

            // Clean up old matches
            if (notifyDb.notifiedMatches.length > 50) {
                notifyDb.notifiedMatches = notifyDb.notifiedMatches.slice(-50);
                dbUpdated = true;
            }

            if (dbUpdated) {
                fs.writeFileSync(notifyDbPath, JSON.stringify(notifyDb, null, 4));
            }

        } catch (err) {
            console.error('vlrJobs Error:', err);
        }
    }, 5 * 60 * 1000); // 5 minutes
}

module.exports = { startVlrJobs };
