const { CommandInteraction, Client } = require("discord.js");
const Embed = require("../Util/Embed");
const { Emojis } = require("../Util/EmojiManager");
const jsh = require("discordjsh");
const EmojiTypes = {
    "EMOJI": "EMOJI",
    "ID": "ID"
};

module.exports = {
    data: new jsh.commandBuilder()
    .setName("steal")
    .setDescription(`Steal an emoji :))`)
    .addStringOption(e => {
        return e.setName("emoji_id_or_emoji")
        .setDescription(`The emoji ID or just the emoji`)
        .setRequired(true);
    })
    .addStringOption(e => {
        return e.setName("name")
        .setDescription(`The emoji name`)
        .setRequired(true);
    })
    .addStringOption(e => {
        return e.setName("type")
        .setDescription(`The type of emoji you entered`)
        .addChoices([
            ["Emoji", "EMOJI"],
            ["ID", "ID"]
        ])
    })
    .addBooleanOption(e => e.setName("animated").setDescription(`Required if the emoji is animated`)),
    /**
     * 
     * @param {CommandInteraction} int 
     * @param {Client} client
     */
    async execute(int, client){
        await int.deferReply();

        const Options = {
            Type: int.options.getString("type"),
            EmojiID: int.options.getString("emoji_id_or_emoji"),
            a: int.options.getBoolean("animated"),
            Name: int.options.getString("name")
        };

        function getType(){
            if(!isNaN(Number(Options.EmojiID))){
                return EmojiTypes.ID
            } else if(Options.EmojiID.startsWith("<") && Options.EmojiID.endsWith(">")){
                return EmojiTypes.EMOJI
            };
        }

        const { Type } = Options;
        let type = null;
        let EmojiURL;
        const BaseURL = "https://cdn.discordapp.com/emojis/{ID}.{type}?quality=lossless"

        if((Type || getType()) == EmojiTypes.EMOJI){
            type = EmojiTypes.EMOJI
            const EmojiID = Options.EmojiID.slice(Options.EmojiID.lastIndexOf(":")+1, Options.EmojiID.indexOf(">"));
            EmojiURL = BaseURL.replace("{ID}", EmojiID).replace(`{type}`, Options.a ? `gif` : `png`);
        } else if((Type || getType()) == EmojiTypes.ID){
            type = EmojiTypes.ID
        }

        const UploadedEmoji = await int.guild.emojis.create(EmojiURL, Options.Name, {
            reason: `${int.user.tag} (${int.user.id}) upload the emoji ${Options.Name}`
        });

        await int.editReply({
            embeds: new Embed()
            .setTitle(`${Emojis.check_2_dc.show} | Stole emoji!`)
            .setDescription(`The emoji has been stolen from that server!`)
            .build()
        });
    }
}