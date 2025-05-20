const Discord = require("discord.js")
exports.run = async (client, message, args, tools) => {
    const embed = new Discord.MessageEmbed()
    .setTitle("Inviter le bot")
    .setDescription(
      "Invitez le bot sur votre serveur Discord avec cette invitation : https://goo.gl/LFbyjV\nMerci d'aider les organisations de Match de Team en invitant le bot !"
    )
    .setColor(0xff8000)
    .setThumbnail(client.user.avatarURL);
  message.channel.send({embeds:[embed]});
}