const Discord = require("discord.js")
const { get } = require("request-promise-native")

module.exports.run = async (Client, inter) => {
    //await interaction.deferReply();
    const animeName = inter.options.getString("anime");

    let option = {
        url: `https://kitsu.io/api/edge/anime?filter[text]=${animeName}`,
        method: `GET`,
        headers: {
            'Content-Type': "application/vnd.api+json",
            'Accept': "application/vnd.api+json",
        },
        json: true
    }

    const EmbedCool = new Discord.MessageEmbed()
        .setTitle("Quality Search")
        .setDescription("⏱️ กำลังค้นหากรุณารอสักครู่!")

    inter.followUp({ embeds: [EmbedCool] }).then(msg => {
        get(option).then(mat => {
            try {
                //console.log(mat.data[0])
                const Embed = new Discord.MessageEmbed()
                    .setTitle(mat.data[0].attributes.titles.en_jp)
                    .setURL(`https://kitsu.io/${mat.data[0].id}`)
                    .setThumbnail(mat.data[0].attributes.posterImage.original)
                    .setDescription(mat.data[0].attributes.synopsis)
                    .setColor("#FFCC33")
                    .addField("ประเภท", `${mat.data[0].attributes.showType ? mat.data[0].attributes.showType: "N/A"}`, true)
                    .addField("ปีที่ทำ", `${mat.data[0].attributes.startDate} *ถึง* ${mat.data[0].attributes.endDate ? mat.data[0].attributes.endDate: "N/A"}`, true)
                    .addField("สถานะ", `${mat.data[0].attributes.status ? mat.data[0].attributes.status: "N/A"}`, true)
                    .addField("ภาคต่อไป", mat.data[0].attributes.nextRelase ? mat.data[0].attributes.nextRelase: "N/A", true)
                    .addField("จำนวนตอน", `${mat.data[0].attributes.episodeCount ? mat.data[0].attributes.episodeCount: "N/A"}`, true)
                    .addField("ระยะเวลา", `${mat.data[0].attributes.episodeLength ? mat.data[0].attributes.episodeLength: "N/A"} Min`, true)
                    .addField("เรทอายุ", `${mat.data[0].attributes.ageRating ? mat.data[0].attributes.ageRating: "N/A"}`, true)
                    .addField("อันดับเรตติ้ง", `${mat.data[0].attributes.ratingRank ? mat.data[0].attributes.ratingRank: "N/A"}`, true)
                    .addField("คะแนนเฉลี่ย", `${mat.data[0].attributes.averageRating ? mat.data[0].attributes.averageRating: "N/A"}`, true)
                //inter.channel.send(Embed)

                /*const NewMessage = Message.embeds
                    .setTitle(mat.data[0].attributes.titles.en_jp)
                    .setURL(`https://kitsu.io/${mat.data[0].id}`)
                    .setThumbnail(mat.data[0].attributes.posterImage.original)
                    .setDescription(mat.data[0].attributes.synopsis)
                    .setColor("0x0099ff")
                    .addField("Type", mat.data[0].attributes.showType, true)
                    .addField("Published", `${mat.data[0].attributes.startDate} **TO** ${mat.data[0].attributes.endDate ? mat.data[0].attributes.endDate : "N/A"}`, true)
                    .addField("Status", mat.data[0].attributes.status, true)
                    .addField("Next Release", mat.data[0].attributes.nextRelase ? mat.data[0].attributes.nextRelase : "N/A", true)
                    .addField("Episode Count", `${mat.data[0].attributes.episodeCount ? mat.data[0].attributes.episodeCount : "N/A"}`, true)
                    .addField("Duration", `${mat.data[0].attributes.episodeLength ? mat.data[0].attributes.episodeLength : "N/A"} Min`, true)
                    .addField("AgeRating", mat.data[0].attributes.ageRating, true)
                    .addField("RatingRank", `${mat.data[0].attributes.ratingRank}`, true)
                    .addField("Average Rating", mat.data[0].attributes.averageRating, true)*/
                //msg.edit(' ');
                inter.editReply({ embeds: [Embed] })
                //msg.cache.get(plays[interaction.member.id]).edit({ embeds: [EndEmbed] })
                //inter.delete()
            } catch (err) {
                inter.editReply({
                    embeds: [
                        {
                            color: "RED",
                            description: "❌ ไม่มี Anime เรื่องนี้"
                        }
                    ],
                });
            }
        })
    })
}

module.exports.help = {
    name: 'searchanime',
}