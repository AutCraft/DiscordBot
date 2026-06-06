const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates,
    ],
    allowedMentions: { parse: ['users', 'roles'], repliedUser: true }
});

client.SlashCmds = new Collection();
module.exports.Client = client;

// Discord Player v6
const { Player } = require('discord-player');
const { YoutubeiExtractor } = require('discord-player-youtubei');
const { registerPlayerEvents } = require('./player');

client.player = new Player(client, {
    skipFFmpeg: false,
    connectionTimeout: 30000,
});

// YoutubeiExtractor using youtube-dl-exec (yt-dlp) as requested (like rawon)
client.player.extractors.register(YoutubeiExtractor, {
    useYoutubeDL: true
});
// Load remaining extractors (Spotify, SoundCloud, etc.) — skip built-in YouTube
client.player.extractors.loadDefault((ext) => ext !== 'YouTubeExtractor');

// Register player error/event listeners
registerPlayerEvents(client.player);

// Event Handler
const eventFiles = fs.readdirSync('./events').filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
    require(`./events/${file}`);
    console.log(`[EVENT HANDLER] - Loaded: ${file}`);
}

// Slash Commands Handler
fs.readdirSync('./SlashCommands').forEach(dir => {
    const files = fs.readdirSync(`./SlashCommands/${dir}`).filter(f => f.endsWith('.js'));
    if (files.length === 0) return console.log(`[SLASH CMD HANDLER] - No commands found in ${dir}`);

    files.forEach(file => {
        const cmd = require(`./SlashCommands/${dir}/${file}`);
        console.log(`[SLASH CMD HANDLER] - Loaded: ${file}`);
        try {
            client.SlashCmds.set(cmd.help.name, cmd);
        } catch (err) {
            console.error(`[SLASH CMD HANDLER] - Error loading ${file}:`, err);
        }
    });
});

client.login(process.env.DISCORD_TOKEN);