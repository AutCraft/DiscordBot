const { QueryType } = require("discord-player");
const playdl = require("play-dl");
const { MessageAttachment } = require('discord.js');

module.exports.run = async (Client, inter) => {

    /*const songTitle = inter.options.getString('song');

    if (!inter.member.voice.channel)
        return inter.followUp({
            content: "Please join a voice channel first!",
        });

    const searchResult = await player.search(songTitle, {
        requestedBy: inter.user,
        searchEngine: QueryType.AUTO,
    });

    const queue = await player.createQueue(inter.guild, {
        metadata: inter.channel,
    });

    if (!queue.connection)
        await queue.connect(inter.member.voice.channel);
    
    inter.followUp({ embeds: [
            {
                color: 0x0099ff,
                author: {
                    name: 'Playing',
                    icon_url: 'https://raw.githubusercontent.com/HELLSNAKES/Music-Slash-Bot/main/assets/music.gif',
                },
                description: `song: [${searchResult.tracks}](${songTitle})`,
                footer: {
                    text: `in ${queue.connection.channel.name}`,
                },
            },
        ],
     });*/

    /*const songString = inter.options.getString("song");
    const searchResult = await Client.player.search(songString, {
        requestedBy: inter.user,
        searchEngine: QueryType.AUTO,
    });

    if (!searchResult || !searchResult.tracks.length)
        return inter.followUp({
            embeds: [{
                color:"RED",
                description: `❌ ไม่พบเพลง!`,
            }],
        });

    let queue = await Client.player.createQueue(inter.guildId, {
        leaveOnEnd: false,
        leaveOnStop: true,
        initialVolume: 80,
        leaveOnEmptyCooldown: 60 * 1000 * 3,
        bufferingTimeout: 200,
        leaveOnEmpty: true,
        async onBeforeCreateStream(track, source, _queue) {
            if (source === "soundcloud") {
                const client_id = await playdl.getFreeClientID();
                playdl.setToken({
                    soundcloud: {
                        client_id: client_id,
                    },
                });
                if (await playdl.so_validate(track.url)) {
                    let soundCloudInfo = await playdl.soundcloud(track.url);
                    return (await playdl.stream_from_info(soundCloudInfo)).stream;
                }
                return;
            }

            if (source === "youtube") {
                const validateSP = playdl.sp_validate(track.url);
                const spotifyList = ["track", "album", "playlist"];
                if (spotifyList.includes(validateSP)) {
                    if (playdl.is_expired()) {
                        await playdl.refreshToken();
                    }
                    let spotifyInfo = await playdl.spotify(track.url);
                    let youtube = await playdl.search(`${spotifyInfo.name}`, {
                        limit: 2,
                    });
                    return (
                        await playdl.stream(youtube[0].url, {
                            discordPlayerCompatibility: true,
                            quality: 1,
                        })
                    ).stream;
                }

                return (
                    await playdl.stream(track.url, {
                        discordPlayerCompatibility: true,
                        quality: 1,
                    })
                ).stream;
            }
        },
    });

    try {
        if (!queue.connection)
            await queue.connect(inter.member.voice.channel);
    } catch {
        Client.player.deleteQueue(inter.guildId);
        queue.destroy(true);
        return await inter.followUp({
            content: "❌ ไม่สามารถเข้าร่วมห้องพูดคุยของคุณได้!",
            empheral: true,
        });
    }
    
    searchResult.playlist
        ? queue.addTracks(searchResult.tracks)
        : queue.addTrack(searchResult.tracks[0]);

    if (!queue.playing) await queue.play();

    const progress = queue.createProgressBar();
    const perc = queue.getPlayerTimestamp();

    const musicEmbed = {
        color: "#0x0099ff",
        //title: `${queue.playing ? "✅ Added to Queue" : "🎵  Playing"}`,
        author: {
            name: `Quality Players`,
            icon_url: 'https://raw.githubusercontent.com/HELLSNAKES/Music-Slash-Bot/main/assets/music.gif',
        },
        description: `เพลง: **[${searchResult.tracks[0].title}](${searchResult.tracks[0].url})** \`(${searchResult.tracks[0].duration})\``,*/
        /*thumbnail: {
            url: `${searchResult.tracks[0].thumbnail}`,
        },
        fields: [
            {
                name: "Author",
                value: `${searchResult.tracks[0].author}`,
                inline: true,
            },
            {
                name: "🕓 Duration",
                value: `${searchResult.tracks[0].duration}`,
                inline: true,
            },
        ],*/
        /*footer: {
            text: `${queue.playing ? `ถูกเพิ่มเข้าคิวแล้ว!` :`ได้เล่นใน *${queue.connection.channel.name}*`}`,
        },
    };*/

    /*let playlistEmbed = {
        color: "#0x0099ff",
        author: {
            name: ` Quality Playlist`,
            icon_url: 'https://raw.githubusercontent.com/HELLSNAKES/Music-Slash-Bot/main/assets/music.gif',
        },
        description: `เพลย์ลิสต์: ${searchResult.tracks[0].author} \`${queue.tracks.length}\``,
    };

    if (!queue.playing) {
        try {
            await queue.play();
            searchResult.playlist
                ? await inter.followUp({
                    embeds: [playlistEmbed, musicEmbed],
                })
                : await inter.followUp({
                    embeds: [musicEmbed],
                });
            return;
        } catch (err) {
            Client.logger(err.message, "error");
            await inter.followUp({
                embeds: [
                    {color: "RED",
                    description: `❌ เกิดข้อผิดพลาดขณะพยายามเล่นเพลงนี้! \nError Message: ${err.message}`,
                }],
            });
        }
    }

    if (queue.playing) {
        searchResult.playlist
            ? await inter.followUp({ embeds: [playlistEmbed, musicEmbed] })
            : await inter.followUp({ embeds: [musicEmbed] });
        return;
    }*/

    const guild = inter.guildId;
    const channel = inter.member.voice.channel;
    const query = inter.options.getString("song");
    const searchResult = await Client.player
        .search(query, {
            requestedBy: inter.user,
            searchEngine: QueryType.AUTO
        })
        .catch(() => {
            console.log('he');
        });
    if (!searchResult || !searchResult.tracks.length) return void inter.followUp({ content: 'No results were found!' });

    const queue = await Client.player.createQueue(guild, {
        ytdlOptions: {
            filter: 'audioonly',
            highWaterMark: 1 << 30,
            dlChunkSize: 0,
        },
        metadata: inter
    });

    try {
        if (!queue.connection) await queue.connect(channel);
    } catch {
        void Client.player.deleteQueue(inter.guildID);
        return void inter.followUp({ content: 'Could not join your voice channel!' });
    }

    const file = new MessageAttachment('./assets/music.gif');

    await inter.followUp({
        embeds: [
            {
                color: "#FFCC33",
                author: {
                    name: `Quality Players`,
                    icon_url: 'attachment://music.gif',
                },
                description: `เพลง: **[${searchResult.tracks[0].title}](${searchResult.tracks[0].url})** \`(${searchResult.tracks[0].duration})\``,
                footer: {
                    text: `${queue.playing ? `ถูกเพิ่มเข้าคิวแล้ว!` : `ได้เล่นใน *${queue.connection.channel.name}*`}`,
                }
            }],
        files: [file],
    });
    searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
    if (!queue.playing) await queue.play();
} 

module.exports.help = {
    name: 'play',
}