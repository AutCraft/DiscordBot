module.exports.run = async (Client, inter) => {
    const queue = Client.player.getQueue(inter.guildId);
    if (!queue || !queue.playing) return void inter.followUp({ content: '❌ ไม่มีการเล่นเพลงในคณะนี้!' });
    queue.destroy();
    return void inter.followUp({ content: '👍 หยุดเล่นเพลงสำเร็จแล้ว' });

} 

module.exports.help = {
    name: 'stop',
}