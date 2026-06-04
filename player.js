module.exports.registerPlayerEvents = (player) => {

    player.on("error", (queue, error) => {
        console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
    });
    player.on("connectionError", (queue, error) => {
        console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
    });

    player.on("botDisconnect", (queue) => {
        if (queue) {
            queue.clear();
            queue.destroy(true);
        }
    });

    player.on("channelEmpty", (queue) => {
        if (queue) {
            queue.clear();
            queue.destroy(true);
        }
    });

    player.on("trackStart", (queue, track) => {
        
    });

    player.on("trackAdd", (queue, track) => {
        
    });

    player.on("queueEnd", (queue) => {
        
    });

};