const axios = require('axios');
const { AttachmentBuilder } = require('discord.js');

// Public VLR.gg API (no Python/Docker needed)
const BASE_URL = 'https://vlrggapi.vercel.app';

const vlrApi = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
});

/**
 * Returns the base Discord embed template for Valorant commands.
 */
function getVlrEmbedTemplate() {
    return {
        color: 0xFFCC33,
        author: {
            name: 'HostWorker Valorant',
            icon_url: 'attachment://valorant.gif',
        },
        footer: { text: 'by vlr.gg' },
    };
}

/**
 * Returns the Valorant gif attachment, or null if not found.
 */
function getVlrAttachment() {
    try {
        return new AttachmentBuilder('./assets/valorant.gif', { name: 'valorant.gif' });
    } catch {
        return null;
    }
}

/**
 * Returns an error embed with the given message.
 */
function getVlrErrorEmbed(message) {
    const embed = getVlrEmbedTemplate();
    embed.description = message;
    return embed;
}

/**
 * Builds a formatted match card for notifications.
 * @param {string} team1
 * @param {string} team2
 * @param {string} scoreOrVs - score "2-1" or "vs"
 * @param {string} event - event name
 * @param {string} timeOrMap - match time or map name
 */
function buildAsciiMatch(team1, team2, scoreOrVs, event, timeOrMap) {
    const clean = (s) => String(s || '').trim().replace(/\*\*/g, '');
    return `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃  ${clean(team1).toUpperCase()} ${clean(scoreOrVs)} ${clean(team2).toUpperCase()}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 📌 EVENT : ${clean(event)}
┃ 🕒 TIME  : ${clean(timeOrMap)}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

module.exports = {
    vlrApi,
    getVlrEmbedTemplate,
    getVlrAttachment,
    getVlrErrorEmbed,
    buildAsciiMatch,
};
