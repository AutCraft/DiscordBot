module.exports.run = async (Client, inter) => {

    //await inter.deferReply();
    const volume = inter.options.getNumber("volume");
    const queue = Client.player.getQueue(inter.guild);

    if (
        inter.guild.me.voice.channelId &&
        inter.member.voice.channelId !==
        inter.guild.me.voice.channelId
    )
        return await inter.followUp({
            embeds: [
                {  
                    color: "RED",
                    description: `❌ คุณต้องอยู่ในห้องพูดคุยเพื่อเปลี่ยนระดับเสียง!`
                },
            ],
        });

    if (!queue) {
        return await inter.followUp({
            embeds: [
                {
                    color:"RED",
                    description: `❌ ${inter.member.toString()}, ไม่มีการคิวเพลงสำหรับเซิร์ฟเวอร์นี้!`
                },
            ],
        });
    }

    if (typeof volume === "string")
        return await inter.followUp({
            embeds: [
                {
                    color: "RED",
                    description: `❌ กรุณาพิมพ์ตัวเลขเพื่อปรับเสียง!`
                }],
        });

    try {
        if (volume < 0 || volume > 100)
            return await inter.followUp({
                embeds: [
                    {
                        color: "RED",
                        description:`💢 ระดับเสียงต้องอยู่ระหว่าง 1 - 100!`
                    }],
            });

        queue.setVolume(volume);
        return await inter.followUp({ content: `👍 ตั้งค่าระดับเสียงของบอทเป็น ${volume}` });
    } catch (err) {
        Client.logger(err.message, "error");
        return await inter.followUp({
            embeds: [
                {
                    color: "RED",
                    description: `เกิดข้อผิดพลาดในการตั้งค่าระดับเสียงของบอท! \nError: ${err.message}`
                }
            ],
        });
    }
}

module.exports.help = {
    name: 'volume',
}