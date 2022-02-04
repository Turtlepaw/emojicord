const { Client, CommandInteraction, MessageAttachment, Interaction } = require("discord.js");
const jsh = require("discordjsh");
const Embed = require("../Util/Embed");
const { Emojis } = require("../Util/EmojiManager");
const DiscordReal = require("discord.js");
const Jimp = require("jimp");
const { errorMessage, checkPermissions, fixText } = require("../Util/util");
const { generateDefualtFilter, FilterTypes } = require("../Config/config");

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

        //Get emojis
        const RawEmoji = interaction.options.getString("emoji");
        const Emoji = interaction.guild.emojis.cache.find(e => e.name == RawEmoji);

        //Check to make sure they used the autocomplete
        if(!Emoji) return errorMessage(`Emoji not found`, interaction);

        //Create embeds and componenets
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

        const EmojiFilters = {
            "ROLES": "ROLES",
            "ROUND": "ROUND",
            "RECOLOR": "RECOLOR",
            "NAME": "NAME"
        };
        const EmojiFilterDef = "ROLES" || "ROUND" || "RECOLOR" || "NAME";

        /**
         * Builds the default embed.
         * @param {EmojiFilterDef[]} filters The filters applied to the emoji
         * @returns {Embed}
         */
        function buildDefualtEmbed(filters=[]){
            const MappedFilters = [];
            let i;
            for(const filter of filters){
                MappedFilters.push(`${i == filters.length ? Emojis.reply_1.show : Emojis.stem_1.show} \`${filter}\``);
            };

            return new Embed()
            .setTitle(`${Emojis.update_dc.show} | Editing an emoji`)
            .setDescription(`Your editing the emoji \`${Emoji.name}\`!`)
            .setThumbnail(Emoji.url)
            .addField(`${Emojis.search_dc.show} Name`, `\`${Emoji.name}\``)
            .addField(`${Emojis.dev_dc.show} ID & Emoji`, `${Emojis.stem_1.show} \`${Emoji}\`\n${Emojis.reply_1.show} \`${Emoji.id}\``)
            .addField(`${Emojis.star_dc.show} Filters`, `${filters.length >= 1 ? MappedFilters.join(`\n`) : "\`No filters applied\`"}`)
        }
        
        const EndEmbed = new Embed()
        .setTitle(`${Emojis.delete_dc.show} | Edit emoji menu closed`);

        //Send the message
        /**
         * @type {DiscordReal.Message}
         */
        const Message = await interaction.reply({
            embeds: buildDefualtEmbed().build(),
            components: Rows,
            fetchReply: true
        });

        //Create a `collect()` function to make it easier
        /**
         * An easy shortcut to `channel.awaitMessages`
         * @param {DiscordReal.TextChannel} TextChannel The channel to await messages
         * @param {Function} cb The callback
         * @returns {Promise<DiscordReal.Message> | "CANCEL"}
         */
        async function collect(TextChannel, cb=null){
            const message = await TextChannel.awaitMessages({
                filter: generateDefualtFilter(FilterTypes.MESSAGE, interaction.user.id),
                max: 1
            });

            if(cb != null) await cb(message);
            if(message.first().content.toLowerCase().startsWith("cancel")) return "CANCEL";
            return message.first();
        }

        //Create the collector
        const collector = Message.createMessageComponentCollector({
            filter: generateDefualtFilter(FilterTypes.INTERACTION, interaction.user.id)
        });

        const Filters = [];

        collector.on("collect", async i => {
            async function cancel(){
                return await update();
            }

            async function update(Embed=BaseEmbed, componenets=Rows, forceNoBuild=false, fetchReply=true){
                if(i.replied) return interaction.editReply({
                    embeds: forceNoBuild == true ? Embed : Embed.build(),
                    components: componenets,
                    fetchReply
                });

                return await i.update({
                    embeds: forceNoBuild == true ? Embed : Embed.build(),
                    components: componenets,
                    fetchReply
                });
            }
            const val = i.values[0];

            if(val == "EXIT"){
                await i.update({
                    embeds: EndEmbed.build(),
                    components: RowsDisabled
                });
            } if(val == "NAME"){
                await update(new Embed().setTitle(`${Emojis.clock_dc.show} | Awaiting text`).setDescription(`Send the new Emoji name!`))
                const Message = await collect(i.channel);

                if(Message == "CANCEL") return await cancel();

                await Emoji.setName(Message.content, `This action has been done by ${i.user.tag} (${i.user.id})`);

                Filters.push(EmojiFilters.NAME);

                await update(buildDefualtEmbed(Filters));
            }
        });
    }
}