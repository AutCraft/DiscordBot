module.exports.run = async (Client, inter) => {
    const text = inter.options.getString('text');
    return await inter.followUp({content: text });
}

module.exports.help = {
    name: 'echo',
}