const { Client, CommandInteraction, MessageAttachment, Interaction } = require("discord.js");
const {
    Discord,
    DiscordUtil,
    jsh
} = require("../Config/imports");
const Embed = require("../Util/Embed");
const { Emojis } = require("../Util/EmojiManager");
const DiscordReal = require("discord.js");
const Jimp = require("jimp");
const { checkPermissions } = require("../Util/util");

module.exports = {
    data: new jsh.commandBuilder()
        .setName(`create`)
        .setDescription(`Create/upload an emoji!`)
        .addStringOption(e => {
            return e.setName("name")
                .setDescription(`The name of the emoji`)
                .setRequired(true)
        })
        .addStringOption(e => {
            return e.setName("url")
                .setDescription(`The URL of the emoji`)
        })
        .addBooleanOption(e => e.setName(`round`).setDescription(`If the image should be round`)),
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

        //Get the EmojiURL
        let EmojiURL = interaction.options.getString("url");
        //Check if its supposed to be round
        const RoundImage = interaction.options.getBoolean("round") || false;

        /**
         * This verifies that the file is a `png`, `jpg`, `jpeg`, or `gif`.
         * @param {MessageAttachment | String} attachmentOrURL
         * @param {CommandInteraction} int
         */
        function verifyFile(attachmentOrURL, int) {
            //Check to see if its a URL
            if (typeof attachmentOrURL == "string") {

                if (!attachmentOrURL.endsWith(".png") && !attachmentOrURL.endsWith(".jpg") && !attachmentOrURL.endsWith(".jpeg") && !attachmentOrURL.endsWith(".gif")) {
                    //This executes if its not a valid emoji fileAZ
                    int.followUp({
                        embeds: new Embed()
                            .setTitle(`${Emojis.xmark_dc.show} | Invalid attachment`)
                            .setDescription(`The attachment/image you provided is invalid. It must be a \`.png\`, \`.jpg\`, \`.jpeg\`, or \`.gif\`!`)
                            .build()
                    });

                    //Make sure that it cancels
                    return "ERR";
                }
            } else if (attachmentOrURL?.contentType != null) { //Check to see if its a MessageAttachement
                //Check file type
                if (!attachmentOrURL.url.endsWith(".png") && !attachmentOrURL.url.endsWith(".jpg") && !attachmentOrURL.url.endsWith(".jpeg") && !attachmentOrURL.url.endsWith(".gif")) {
                    //This executes if its not a valid emoji fileAZ
                    int.followUp({
                        embeds: new Embed()
                            .setTitle(`${Emojis.xmark_dc.show} | Invalid attachment`)
                            .setDescription(`The attachment/image you provided is invalid. It must be a \`.png\`, \`.jpg\`, \`.jpeg\`, or \`.gif\`!`)
                            .build()
                    });

                    //Make sure that it cancels
                    return "ERR";
                }
            }
        }

        //Check if the user provided the URL already
        if (EmojiURL == null) {
            //Reply to them asking for their file
            await interaction.reply({
                embeds: new Embed()
                    .setTitle(`${Emojis.message_dc.show} | Awaiting files`)
                    .setDescription(`Please send the emoji as a file to upload!`)
                    .build()
            });

            //Create collector
            const Message = await interaction.channel.awaitMessages({
                max: 1,
                filter: i => i.author.id == interaction.user.id
            });

            //Check if they said `cancel`.
            if (Message.first().content == "cancel") return;

            //Verify the file to make sure its valid
            const verify = verifyFile(Message.first().attachments.first(), interaction);

            //Return if bad
            if (verify == "ERR") return;
            //Or then make the EmojiURL this
            else EmojiURL = Message.first().attachments.first();
        };

        //Check to make sure the image provided is valid
        const verify = verifyFile(EmojiURL, interaction);

        //Return if bad
        if (verify == "ERR") return;

        //Resize image
        const Image = await Jimp.read(EmojiURL);
        Image.resize(512, 512);
        EmojiURL = await Image.getBufferAsync(Jimp.MIME_PNG);

        //Get mask
        const mask = await Jimp.read("./Images/circle-mask.png");

        //Round image if wanted
        if (RoundImage) {
            Image.mask(mask, 0, 0);
            EmojiURL = await Image.getBufferAsync(Jimp.MIME_PNG);
        }

        //Upload emoji to their server
        const Emoji = await interaction.guild.emojis.create(EmojiURL, interaction.options.getString("name"));

        //Create a payload
        /**
         * @type {DiscordReal.InteractionReplyOptions}
         */
        const payload = {
            embeds: new Embed()
                .setTitle(`${Emojis.check_2_dc.show} | Uploaded Emoji!`)
                .setDescription(`The emoji has been uploaded to this server.`)
                .addField(`${Emojis.gif_dc.show} Emoji:`, `${Emoji.toString()} - \`${Emoji}\` (ID: \`${Emoji.id}\`)`)
                .build(),
        };

        //If no emoji URL provided the interaction will be replied to.
        //So we check if it was replied to.
        interaction.replied ? await interaction.editReply(payload) : await interaction.reply(payload);
    }
}