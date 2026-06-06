const { SlashCommandBuilder } = require('discord.js');
const { AttachmentBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports.data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('เล่นเพลงในห้องพูดคุย')
    .addStringOption(option =>
        option.setName('song')
            .setDescription('เพลงที่คุณต้องการเล่น ทั้งลิงค์ หรือ ชื่อเพลง')
            .setRequired(true)
    );

module.exports.run = async (Client, inter) => {
    const channel = inter.member.voice.channel;
    if (!channel)
        return inter.followUp({ content: '❌ กรุณาเข้าห้องพูดคุยก่อน!', ephemeral: true });

    const query = inter.options.getString('song');
    const player = useMainPlayer();
    const queueNode = player.nodes.get(inter.guildId);
    const isFirst = !queueNode?.currentTrack;

    const result = await player.search(query, { requestedBy: inter.user });
    if (!result || !result.tracks.length)
        return inter.followUp({ content: '❌ ไม่พบเพลงที่ค้นหา!' });

    try {
        const { track } = await player.play(channel, result, {
            nodeOptions: {
                metadata: {
                    channel: inter.channel,
                    voiceChannel: channel
                },
                selfDeaf: true,
                volume: 80,
                leaveOnEmpty: true,
                leaveOnEmptyCooldown: 300000,
                leaveOnEnd: false,
                connectionTimeout: 30000,   // 30s voice connection timeout
                bufferingTimeout: 10000,    // 10s — gives Youtubei time to prepare stream
            }
        });

        const file = new AttachmentBuilder('./assets/music.gif');
        await inter.followUp({
            embeds: [{
                color: 0xFFCC33,
                author: {
                    name: 'HostWorker Players',
                    icon_url: 'attachment://music.gif',
                },
                description: `เพลง: **[${track.title}](${track.url})** \`(${track.duration})\``,
                footer: {
                    text: isFirst ? `ได้เล่นใน *${channel.name}*` : `${result.playlist ? 'เพิ่มเพลย์ลิสต์เข้าคิวแล้ว!' : 'เพิ่มเข้าคิวแล้ว!'}`,
                }
            }],
            files: [file],
        });
    } catch (err) {
        console.error(err);
        const msg = err.message?.length > 200 ? err.message.slice(0, 200) + '...' : err.message;
        inter.followUp({ content: `❌ เกิดข้อผิดพลาด: ${msg}` });
    }
};

module.exports.help = { name: 'play' };