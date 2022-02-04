const { Client } = require("discord.js");
const Discord = require("discord.js");
const { Colors } = require("discordjsh");

const WebsiteURL = module.exports.WebsiteURL = `https://emojis.trtle.xyz/`;
module.exports.InviteURL = WebsiteURL != null ? WebsiteURL + "invite" : ``;
module.exports.Color = Colors.BLURPLE;
module.exports.SupportURL = WebsiteURL != null ? WebsiteURL + "support" : ``;
module.exports.TestGuildID = `842575277249921074`;
/**
 * @type {Discord.InviteScope[]}
 */
module.exports.scopes = ["bot", "applications.commands"];
/**
 * @type {Discord.PermissionString[]}
 */
module.exports.permissions = ["MANAGE_EMOJIS_AND_STICKERS", "EMBED_LINKS", "USE_EXTERNAL_EMOJIS", "CREATE_INSTANT_INVITE"];
/**
 * Creates an InviteURL
 * @param {Client} client 
 */
module.exports.GenerateInviteURL = (client) => {
    return client.generateInvite({
        permissions: this.permissions,
        scopes: this.scopes
    });
};
module.exports.URL = {
    Invite: WebsiteURL + "invite"
};