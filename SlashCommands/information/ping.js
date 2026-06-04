const Discord = require("discord.js")

module.exports.run = async (Client, inter) => {
    const ping = inter.createdTimestamp - inter.createdTimestamp; 
    const embed = new Discord.MessageEmbed()
        .setColor("#FFCC33")
            .setTitle("PONG! :ping_pong:")
            .setThumbnail(inter.user.displayAvatarURL())
            .addFields(
                { name: "Latency", value: `\`${Date.now() - inter.createdTimestamp}ms\`` },
                { name: "API Latency", value: `\`${Math.round(Client.ws.ping)}ms\`` }
            )
        inter.followUp({ embeds: [embed] })
}

module.exports.help = {
    name: 'ping',
}