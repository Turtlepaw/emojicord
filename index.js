const Discord = require("discord.js");
const JSH = require("discordjsh");
const {
    clientID,
    token
} = require("./Config/config.json");
const Config = require("./Config/config");
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