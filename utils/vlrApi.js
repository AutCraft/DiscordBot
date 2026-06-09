const axios = require('axios');
const { AttachmentBuilder } = require('discord.js');

// ใช้ Public API แทน เพื่อจะได้ไม่ต้องติดตั้ง Python/Docker บน VPS ให้หนักเครื่อง
const BASE_URL = 'https://vlrggapi.vercel.app';

const vlrApi = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // 15 minutes
});

function getVlrEmbedTemplate() {
    return {
        color: 0xFFCC33,
        author: {
            name: 'HostWorker Valorant',
            icon_url: 'attachment://valorant.gif',
        },
        footer: { text: 'by vlr' },
    };
}

function getVlrAttachment() {
    try {
        return new AttachmentBuilder('./assets/valorant.gif', { name: 'valorant.gif' });
    } catch (e) {
        return null;
    }
}

function getVlrErrorEmbed(message) {
    const embed = getVlrEmbedTemplate();
    embed.description = message;
    return embed;
}

function buildAsciiMatch(team1, team2, scoreOrVs, event, timeOrMap) {
    const cleanStr = (s) => String(s || '').trim().replace(/\*\*/g, '');
    let t1 = cleanStr(team1).toUpperCase();
    let t2 = cleanStr(team2).toUpperCase();
    let mid = cleanStr(scoreOrVs);
    let ev = cleanStr(event);
    let btm = cleanStr(timeOrMap);

    return `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃  ${t1} ${mid} ${t2}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 📌 EVENT : ${ev}
┃ 🕒 TIME  : ${btm}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

module.exports = {
    vlrApi,
    getVlrEmbedTemplate,
    getVlrAttachment,
    getVlrErrorEmbed,
    buildAsciiMatch
};
