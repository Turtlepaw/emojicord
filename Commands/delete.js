const { Client, CommandInteraction, MessageAttachment, Interaction } = require("discord.js");
const jsh = require("discordjsh");
const Embed = require("../Util/Embed");
const { Emojis } = require("../Util/EmojiManager");
const DiscordReal = require("discord.js");
const Jimp = require("jimp");
const { errorMessage, checkPermissions, fixText } = require("../Util/util");
const { generateDefualtFilter, FilterTypes } = require("../Config/config");

module.exports = {
    devOnly: true,
    data: new jsh.commandBuilder()
        .setName(`delete`)
        .setDescription(`Delete an emoji`)
        .addStringOption(e => {
            return e.setName("emoji")
            .setDescription(`The emoji to edit (search by name)`)
            .setAutocomplete(true)
            .setRequired(true);
        }),
    /**
     * Executes the autocomplete interaction.
     * @param {DiscordReal.AutocompleteInteraction} interaction 
     * @param {DiscordReal.Client} client 
     * @param {jsh.TestAutocomplete} test
     */
    async executeAutocomplete(interaction, client, test){
        const array = [];
        for(const emoji of interaction.guild.emojis.cache.values()){
            array.push(emoji.name);
        }

        await interaction.respond(test(interaction.options.getFocused(), array));
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        //Check perms
        const Perms = await checkPermissions("MANAGE_EMOJIS_AND_STICKERS", interaction);
        //Make sure it does not execute the command
        if(!Perms) return;

        //Get emojis
        const RawEmoji = interaction.options.getString("emoji");
        const Emoji = interaction.guild.emojis.cache.find(e => e.name == RawEmoji);

        //Check to make sure they used the autocomplete
        if(!Emoji) return errorMessage(`Emoji not found`, interaction);

        const JimpFile = await Jimp.read(Emoji.url);
        const attachMe = await JimpFile.getBufferAsync(Jimp.MIME_PNG);

        await Emoji.delete(`${interaction.user.tag} (${interaction.user.id}) deleted ${Emoji.name}`);

        await interaction.reply({
            embeds: new Embed()
            .setTitle(`${Emojis.trash_dc.show} | Deleted`)
            .setDescription(`The emoji has been deleted!`)
            .setFooter({
                text: `${Emoji.name}`,
                iconURL: `attachment://deleted.png`
            })
            .build(),
            files: [
                new MessageAttachment(attachMe, `deleted.png`)
            ]
        });
    }
}