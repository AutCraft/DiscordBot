const Client = require("../index").Client
const { createCmd } = require("../dataHandler")
Client.on('ready', async () => {
    let servers = await Client.guilds.cache.size
    Client.user.setPresence({ activities: [{ name: `/help | ${servers} Servers`, type: "WATCHING"}], status : "idle"})
    console.log(`${Client.user.tag} is online!`)

    createCmd(Client)
})