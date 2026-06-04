const Discord = require("discord.js")
const { get } = require("request-promise-native")

module.exports.run = async (Client, inter) => {
    //await interaction.deferReply();
    const CardName = inter.options.getString("card");

    let option = {
        url: `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${CardName}`,
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
                    .setTitle(mat.data[0].name)
                    .setThumbnail(`https://storage.googleapis.com/ygoprodeck.com/pics/${mat.data[0].id}.jpg`)
                    .setDescription(mat.data[0].desc ? mat.data[0].desc : "N/A")
                    .setColor("#FFCC33")
                    .addField("ID", `${mat.data[0].id ? mat.data[0].id : "N/A"}`, true)
                    .addField("ประเภท", `${mat.data[0].type ? mat.data[0].type : "N/A"}`, true)
                    .addField("พลังโจมตี", `${mat.data[0].atk ? mat.data[0].atk : "N/A"}`, true)
                    .addField("พลังป้องกัน", `${mat.data[0].def ? mat.data[0].def : "N/A"}`, true)
                    .addField("เลเวล", `${mat.data[0].level ? mat.data[0].level : "N/A"}`, true)
                    .addField("เผ่า", `${mat.data[0].race ? mat.data[0].race : "N/A"}`, true)
                    .addField("ธาตุ", `${mat.data[0].attribute ? mat.data[0].attribute : "N/A"}`, true)
                    .addField("ต้นแบบ", `${mat.data[0].archetype ? mat.data[0].archetype : "N/A"}`, true)
                    .addField("ค่าลิงค์", `${mat.data[0].linkval ? mat.data[0].linkval : "N/A"}`, true)
                
                inter.editReply({ embeds: [Embed] })
                
            } catch (err) {
                inter.editReply({
                    embeds: [
                        {
                            color: "RED",
                            description: "❌ ไม่มี Card นี้"
                        }
                    ],
                });
            }
        })
    })
}

module.exports.help = {
    name: 'searchyugioh',
}