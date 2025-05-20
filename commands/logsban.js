const { MessageEmbed } = require("discord.js");

const USER_MENTIONNED_NOT_REGISTERED =
  "L'utilisateur n'est pas enregistré dans le tournoi";
const DEFAULT_TOURNAMENT_ID = "rush_ranked";
const DEFAULT_ERROR_MESSAGE = "Erreur inconnue";
const USER_LOG_BAN_EMPTY = "L'utilisateur n'a pas de log de ban";
const LOG_AMOUNT = 7;

exports.run = async (client, message, args, tools) => {
  var statsFinder = client.statsFinder;
  var member = message.mentions.users.first();
  if (!member) member = message.author;
  var tournament = await statsFinder.tournaments.fetchByGuild(message.guild.id);
  if (!tournament)
    tournament = await statsFinder.tournaments.fetch(DEFAULT_TOURNAMENT_ID);
  if (!tournament) return message.reply(DEFAULT_ERROR_MESSAGE);

  var tUser = await tournament.fetchPlayer(member.id);
  if (!tUser) return message.reply(USER_MENTIONNED_NOT_REGISTERED);

  var log;
  var logs = tUser.banHistory;
  if (!logs || logs.length == 0) return message.reply(USER_LOG_BAN_EMPTY);
  var logsText = "";
  var banAmount = 0;
  var lastBan = logs[0];
  for (i in logs) {
    log = logs[i];
    if (log.duration != 0) banAmount++;
    if (i > LOG_AMOUNT) continue;
    logsText =
      logsText +
      `**${Math.round(
        (log.duration > 0 ? log.duration : 0) / 60 / 60 / 1000
      )}H** | ${log.duration == 0 ? "Unban" : "Ban"} le <t:${(
        log.expirationDate - log.duration
      )
        .toString()
        .slice(0, -3)}> | ${log.reason || "No reason"} \n`;
  }

  if (logsText == "") return message.reply(USER_LOG_SCORE_EMPTY);
  const embed = new MessageEmbed().setAuthor(
    "Log bans de " + member.tag,
    member.avatarURL()
  );

  if (tUser && logs) {
    embed
      .addField("Dernier ban", lastBan ? lastBan.reason : "*Aucun*", true)
      .addField("\u200B", "\u200B", true)
      .addField("Nombre de bans", banAmount.toString(), true);
  }

  embed.addField("\u200B", logsText);

  message.reply({ embeds: [embed] });
};

exports.data = {
  syntaxe: "logban @someone",
};
