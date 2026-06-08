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
    const padCenter = (str, len) => {
        let s = String(str || '').trim().replace(/\*\*/g, '');
        if (s.length > len) s = s.substring(0, len - 1) + '…';
        const pad = len - s.length;
        const left = Math.floor(pad / 2);
        const right = pad - left;
        return ' '.repeat(left) + s + ' '.repeat(right);
    };

    const t1 = padCenter(team1, 14);
    const t2 = padCenter(team2, 14);
    const mid = padCenter(scoreOrVs, 6);
    const ev = padCenter(event, 36);
    const btm = padCenter(timeOrMap, 36);

    return `┌──────────────┬──────┬──────────────┐
│${t1}│${mid}│${t2}│
├──────────────┴──────┴──────────────┤
│${ev}│
├────────────────────────────────────┤
│${btm}│
└────────────────────────────────────┘`;
}

module.exports = {
    vlrApi,
    getVlrEmbedTemplate,
    getVlrAttachment,
    getVlrErrorEmbed,
    buildAsciiMatch
};
