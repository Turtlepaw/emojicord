const { Client, CommandInteraction, MessageAttachment, Interaction } = require("discord.js");
const jsh = require("discordjsh");
const Embed = require("../Util/Embed");
const { Emojis } = require("../Util/EmojiManager");
const DiscordReal = require("discord.js");
const Jimp = require("jimp");
const { errorMessage, checkPermissions } = require("../Util/util");

module.exports = {
    data: new jsh.commandBuilder()
        .setName(`edit`)
        .setDescription(`Edit an emoji`)
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

        const RawEmoji = interaction.options.getString("emoji");
        const Emoji = interaction.guild.emojis.cache.find(e => e.name == RawEmoji);

        if(!Emoji) return errorMessage(`Emoji not found`, interaction);

        const BaseOptions = new DiscordReal.MessageSelectMenu()
        .setCustomId("edit_options")
        .setMaxValues(1)
        .setPlaceholder(`Select an option to edit the emoji`)
        .setOptions([
            {
                label: `Re-color Emoji`,
                value: `RECOLOR`,
                emoji: Emojis.paint_dc.show
            },
            {
                label: `Round Emoji`,
                value: `ROUND`,
                emoji: Emojis.online_dc.show
            },
            {
                label: `Change name`,
                value: `NAME`,
                emoji: Emojis.search_dc.show
            },
            {
                label: `Change roles`,
                value: `ROLES`,
                emoji: Emojis.role_dc.show
            },
            {
                label: `Exit`,
                value: `EXIT`,
                emoji: Emojis.trash_dc.show
            },
        ]);

        const Options = new DiscordReal.MessageSelectMenu(BaseOptions);
        const DisOptions = new DiscordReal.MessageSelectMenu(BaseOptions).setDisabled(true);

        const Rows = [
            new DiscordReal.MessageActionRow()
            .addComponents(Options)
        ];

        const RowsDisabled = [
            new DiscordReal.MessageActionRow()
            .addComponents(DisOptions)
        ];

        const BaseEmbed = new Embed()
        .setTitle(`${Emojis.update_dc.show} | Editing an emoji`)
        .setDescription(`Your editing the emoji \`${Emoji.name}\`!`)
        .setThumbnail(Emoji.url);
        
        const EndEmbed = new Embed()
        .setTitle(`${Emojis.delete_dc.show} | Edit emoji menu closed`);

        /**
         * @type {DiscordReal.Message}
         */
        const Message = await interaction.reply({
            embeds: BaseEmbed.build(),
            components: Rows,
            fetchReply: true
        });

        const collector = Message.createMessageComponentCollector({
            filter: i=>i.user.id==interaction.user.id
        });

        collector.on("collect", async i => {
            if(!i.isSelectMenu()) return;
            const val = i.values[0];

            if(val == "EXIT"){
                await i.update({
                    embeds: EndEmbed.build(),
                    components: RowsDisabled
                });
            }
        });
    }
}