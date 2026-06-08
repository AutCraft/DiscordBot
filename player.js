module.exports.registerPlayerEvents = (player) => {

    player.events.on('error', (queue, error) => {
        console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
        console.error('[FULL STACK]', error);
    });

    player.events.on('playerError', (queue, error) => {
        console.log(`[${queue.guild.name}] Player error: ${error.message}`);
        console.error('[PLAYER ERROR STACK]', error);
    });

    // player.on('debug', (msg) => {
    //     console.log('[PLAYER DEBUG]', msg);
    // });
    // player.events.on('debug', (queue, msg) => {
    //     console.log(`[QUEUE DEBUG ${queue.guild.name}]`, msg);
    // });

    player.events.on('disconnect', (queue) => {
        queue.tracks.clear();
        queue.delete();
    });

    player.events.on('emptyChannel', (queue) => {
        console.log(`[${queue.guild.name}] Channel is empty, leaving...`);
    });

    player.events.on('emptyQueue', (queue) => {
        console.log(`[${queue.guild.name}] Queue is empty.`);
    });

    player.events.on('audioTrackAdd', (queue, track) => {
        const roomName = queue.channel?.name || queue.metadata?.voiceChannel?.name || 'Unknown';
        console.log(`[${queue.guild.name}] | Room: ${roomName} | Song added: ${track.title}`);
    });

    player.events.on('audioTracksAdd', (queue, tracks) => {
        const roomName = queue.channel?.name || queue.metadata?.voiceChannel?.name || 'Unknown';
        console.log(`[${queue.guild.name}] | Room: ${roomName} | Playlist added: ${tracks.length} songs`);
    });

};