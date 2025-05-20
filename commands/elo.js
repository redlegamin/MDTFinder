const { MessageEmbed } = require("discord.js");
const DEFAULT_ELO_COMMAND_TITLE = "Elo de";
var AUTHOR_NOT_REGISTERED = "Tu n'es pas inscrit !";
const USER_MENTIONNED_NOT_REGISTERED = "L'utilisateur n'est pas inscrit !";
const EMBED_TITLE_USERNAME = "Pseudo Minecraft";
const EMBED_TITLE_ELO = "Elo Rosters Ranked";
const EMBED_TITLE_RATIO = "Ratio en match (K/D)";
const EMBED_TITLE_WINS = "Victoires par match";
const EMBED_TITLE_RANK = "Rang";
const LINK_BASE_USER = "https://mdtfinder.fr/user/";
var EMBED_COLOR = "#777";

exports.run = async (client, message, args, tools) => {
  var statsFinder = client.statsFinder;
  var user = message.author;
  var command = args[0];

  if (statsFinder.config.embedColor)
    EMBED_COLOR = statsFinder.config.embedColor;

  var mention = message.mentions.users.first();
  if (mention) {
    user = mention;
  }
  var sfUser = await statsFinder.getUser(user.id);
  if (!sfUser)
    return message.channel.send(
      mention ? USER_MENTIONNED_NOT_REGISTERED : AUTHOR_NOT_REGISTERED
    );
  var tUser = await statsFinder.tournaments.fetchPlayer("rush_ranked", user.id);
  var funcraft = statsFinder.getUser(sfUser.link.minecraft);
  var embed = new MessageEmbed()
    .setAuthor(
      `${DEFAULT_ELO_COMMAND_TITLE} ${user.username}`,
      user.avatarURL(),
      LINK_BASE_USER + user.id
    )
    .addField(
      EMBED_TITLE_USERNAME,
      funcraft.username ? funcraft.username : sfUser.link.minecraft,
      true
    )
    .setColor(EMBED_COLOR);
  if (tUser) {
    var score = tUser.score || 0;
    var topScore = tUser.topScore || score || 0;
    var kills = tUser.kills || 0;
    var deaths = tUser.deaths || 0;
    var wins = tUser.wins || 0;
    var matchs = tUser.matchs || 0;
    var ratio = (kills / (deaths || 1)).toFixed(2);
    var winrate = ((wins / (matchs || 1)) * 100).toFixed(1);
    var rank = tUser.rank.rankName || "?";
    var rankImage =
      message.guild.emojis.cache.find(
        (emoji) => emoji.name === rank.toLowerCase()
      ) || "";

    embed.addField(EMBED_TITLE_ELO, `${score} (Best: ${topScore})`, true);
    embed.addField(EMBED_TITLE_RANK, `${rank} ${rankImage}`, true);
    embed.addField(EMBED_TITLE_RATIO, `${kills}/${deaths} (${ratio})`, true);
    embed
      .addField(
        EMBED_TITLE_WINS,
        `${wins} wins / ${matchs} matchs (${winrate}%)`,
        true
      )
      .addField("\u200B", "\u200B", true);
  }
  if (tUser && tUser.isBanned)
    embed.addField(
      "Ban",
      `Jusqu'au <t:${tUser.ban.toString().slice(0, -3)}> ${
        tUser.banHistory && tUser.banHistory[0].reason
          ? `pour : ${tUser.banHistory[0].reason}`
          : ""
      }`,
      true
    );
  return message.reply({
    embeds: [embed],
  });
};
/*
exports.slash = {
    "name": "elo",
    "description": "Affiche son elo ou celui d'un utilisateur",
    "options": [
        {
            "type": 6,
            "name": OPTION_NAME_USER,
            "description": "L'utilisateur à qui afficher son elo",
            "required": false
        },
    ]
}*/
