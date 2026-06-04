const fetch = require('node-fetch')

module.exports.run = async (Client, inter) => {
    //await inter.deferReply();
    const keywords = inter.options.getString("search");

    let url = `https://g.tenor.com/v1/search?q=${keywords}&key=${process.env.TENORKEY}&limit=8`
    let response = await fetch(url);
    let json = await response.json();
    const index = Math.floor(Math.random() * json.results.length);
    inter.followUp(json.results[index].url);
}

module.exports.help = {
    name: 'gif',
}