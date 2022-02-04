const Discord = require("discord.js");
const JSH = require("discordjsh");
const {
    clientID,
    token
} = require("./Config/config.json");
const Config = require("./Config/config");
const Embed = require("./Util/Embed");
const { Emojis } = require("./Util/EmojiManager");
const {
    TestGuildID: testGuildID,
    Color
} = Config;

const ClientBuilder = new JSH.Client({
    testGuildID,
    token,
    clientID
})
.setCommandsDir("./Commands");
const whitelist = [];

const client = ClientBuilder.create({
    intents: [
        "GUILDS",
        "GUILD_EMOJIS_AND_STICKERS",
        "GUILD_MESSAGES",
    ],
    partials: [
        "MESSAGE"
    ]
});

client.Color = Color;
client.Config = Config;

client.on("ready", async () => {
    setTimeout(async () => {
        await require("./Util/EmojiManager")(client);
    }, 4000);
});

client.on("guildCreate", async guild => {
    const owner = await client.users.fetch("820465204411236362");

    const clean = text => {
        if (typeof (text) === "string")
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        else
            return text;
    }

    let evaled = eval(`guild`);
        
    if (typeof evaled !== "string")
        evaled = require("util").inspect(evaled);

    await owner.send({
        embeds: new Embed()
        .setTitle(`${Emojis.add_dc.show} | New server`)
        .setDescription(`I was added to \`${guild.name}\`\n\n**${Emojis.bot_2_dc.show} Raw:**\n\n\`\`\`\nxl\n${clean(evaled)}\n\`\`\``)
        .build(),
        components: [
            {
                type: 1,
                components: [
                    new Discord.MessageButton()
                    .setLabel(`Leave guild`)
                    .setEmoji(Emojis.leave_dc.show)
                    .setCustomId(`leaveguild_${guild.id}`)
                    .setStyle("SECONDARY")
                ]
            }
        ]
    });
});

client.on("interactionCreate", async i => {
    if(!i.isButton()) return;
    
    const startTest = i.customId.slice(0, 11);
    const guildId = i.customId.slice(11, i.customId.length);

    if(startTest == "leaveguild_"){
        const guild = await client.guilds.fetch(guildId);

        await guild.leave();

        i.reply(`Left guild!`)
    }
});