module.exports.run = async (Client, inter) => {

    const queue = Client.player.getQueue(inter.guildId);
        if (!queue?.playing)
            return inter.followUp({
                content: "❌ ไม่มีเพลงกำลังเล่นอยู่ในคณะนี้",
            });

        const currentTrack = queue.current;
        const tracks = queue.tracks.slice(0, 10).map((m, i) => {
            return `${i + 1}. [**${m.title}**](${m.url}) - ${
                m.requestedBy.tag
            }`;
        });

        return inter.followUp({
            embeds: [
                {
                    title: "Song Queue",
                    description: `${tracks.join("\n")}${
                        queue.tracks.length > tracks.length
                            ? `\n...${
                                  queue.tracks.length - tracks.length === 1
                                      ? `${
                                            queue.tracks.length - tracks.length
                                        } more track`
                                      : `${
                                            queue.tracks.length - tracks.length
                                        } more tracks`
                              }`
                            : ""
                    }`,
                    color: 0x0099ff,
                    fields: [
                        {
                            name: "เพลงที่กำลังเล่นอยู่ในขณะนี้",
                            value: `🎶 | [**${currentTrack.title}**](${currentTrack.url}) - ${currentTrack.requestedBy.tag}`,
                        },
                    ],
                },
            ],
        });
} 

module.exports.help = {
    name: "queue",
}