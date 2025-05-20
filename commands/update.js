const updateEloGuild = require("../ressources/updateEloGuild.js")

exports.run = async (client, message, args, tools) => {
  updateEloGuild(client, message.guild.id, message.author.id)
  .then((msg) => message.reply(msg))
  .catch((err)=> message.reply(err))
}