const Discord = require("discord.js")

module.exports.run = async (Client, message, args, prefix) => {
    const embed = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("PONG! :ping_pong:")
        .addFields(
            { name: "Latency", value: `\`${Date.now() - message.createdTimestamp}ms\`` },
            { name: "API Latency", value: `\`${Math.round(Client.ws.ping)}ms\`` }
        )
    message.reply({ embeds: [embed] })
}

module.exports.help = {
    name: "ping",
    aliases: []
}