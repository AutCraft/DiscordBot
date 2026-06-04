const { QueueRepeatMode } = require('discord-player');

async function createCmd(Client) {
    const data = [
        //echo cmd
        {
            name: 'echo',
            description: 'Echo your text!',
            options: [{
                name: 'text',
                type: 'STRING',
                description: 'บอทจะพิมพ์คำของคุณ',
                required: true,
            }],
            
        },

        //ping
        {
            name: 'ping',
            description: "ค่าความlag",
        },

        //play
        {
            name: 'play',
            description: "เล่นเพลงในห้องพูดคุย",
            options: [{
                name: "song",
                type: "STRING",
                description: "เพลงที่คุณต้องการเล่นทั้งลิงค์ หรือ ชื่อเพลง",
                required: true
            }],
        },

        //queue
        {
            name: 'queue',
            description: "แสดงคิวเพลง",
        },

        //skip
        {
            name: 'skip',
            description: "ข้ามเพลง",
        },

        //stop
        {
            name: 'stop',
            description: "หยุดเพลง",
        },

        //loop
        {
            name: 'loop',
            description: "ตั้งค่าโหมดวนซ้ำ",
            options: [
                {
                    name: 'mode',
                    type: "INTEGER",
                    description: 'ประเภทลูป',
                    required: true,
                    choices: [
                        {
                            name: 'ปิด',
                            value: QueueRepeatMode.OFF
                        },
                        {
                            name: 'เพลงเดียว',
                            value: QueueRepeatMode.TRACK
                        },
                        {
                            name: 'ทั้งคิว',
                            value: QueueRepeatMode.QUEUE
                        },
                        {
                            name: 'เล่นอัตโนมัติ',
                            value: QueueRepeatMode.AUTOPLAY
                        }
                    ]
                }
            ]
        },

        //volume
        {
            name: 'volume',
            description: "เปลี่ยนระดับเสียงบอท",
            options: [{
                name: "volume",
                type: "NUMBER",
                description: "ระดับเสียง 1 - 100",
                required: true
            }],
        },

        //clear
        {
            name: 'clear',
            description: "เคลียร์คิวเพลง",
        },

        //leave
        {
            name: 'leave',
            description: "ออกจากห้อง",
        },

        //searchAnime
        {
            name: 'searchanime',
            description: "ค้นหาอนิเมะ",
            options: [{
                name: "anime",
                type: "STRING",
                description: "ชื่ออนิเมะ",
                required: true
            }],
        },

        //gif
        {
            name: 'gif',
            description: "หาภาพ gif",
            options: [{
                name: "search",
                type: "STRING",
                description: "ค้นหาชื่อภาพ gif",
                required: true
            }],
        },

        //searchYugioh
        {
            name: 'searchyugioh',
            description: "ค้นหาการ์ดยูกิ",
            options: [{
                name: "card",
                type: "STRING",
                description: "ชื่อการ์ดยูกิ",
                required: true
            }],
        },
    ]

    await Client.application?.commands.set(data);
}

module.exports = { createCmd }
