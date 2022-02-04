const { Client, CommandInteraction, MessageAttachment, Interaction } = require("discord.js");
const jsh = require("discordjsh");
const Embed = require("../Util/Embed");
const { Emojis } = require("../Util/EmojiManager");
const DiscordReal = require("discord.js");
const Jimp = require("jimp");
const { errorMessage, checkPermissions } = require("../Util/util");
const { URL, GenerateInviteURL } = require("../Config/config");

module.exports = {
    data: new jsh.commandBuilder()
        .setName(`invite`)
        .setDescription(`Invite the bot`),
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        await interaction.reply({
            embeds: new Embed()
            .setTitle(`${Emojis.invite_member_dc.show} | Invite Emojicord`)
            .build(),
            components: [
                {
                    type: 1,
                    components: [
                        new DiscordReal.MessageButton()
                        .setStyle("LINK")
                        .setEmoji(Emojis.invite_member_dc.show)
                        .setLabel(`Invite via website`)
                        .setURL(URL.Invite),
                        new DiscordReal.MessageButton()
                        .setStyle("LINK")
                        .setEmoji(Emojis.discord_blurple_dc.show)
                        .setLabel(`Invite via Discord`)
                        .setURL(GenerateInviteURL(client))
                    ]
                }
            ]
        })
    }
}