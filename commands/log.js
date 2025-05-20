const { MessageEmbed } = require("discord.js");

const COMMAND_SYNTAX = "log @someone";
const USER_MENTIONNED_NOT_REGISTERED =
  "L'utilisateur n'est pas enregistré dans le tournoi";
const DEFAULT_TOURNAMENT_ID = "rush_ranked";
const DEFAULT_ERROR_MESSAGE = "Erreur inconnue";
const USER_LOG_SCORE_EMPTY = "L'utilisateur n'a pas de log";
const LOG_AMOUNT = 7;

exports.run = async (client, message, args, tools) => {
  var statsFinder = client.statsFinder;
  var member = message.mentions.users.first();
  if (!member && args[0]) return message.reply(tools.syntaxe);
  if (!member) member = message.author;
  var tournament = await statsFinder.tournaments.fetchByGuild(message.guild.id);
  if (!tournament)
    tournament = await statsFinder.tournaments.fetch(DEFAULT_TOURNAMENT_ID);
  if (!tournament) return message.reply(DEFAULT_ERROR_MESSAGE);

  const embed = new MessageEmbed().setAuthor(
    "Log de " + member.tag,
    member.avatarURL()
  );

  var unregisterLogs = await statsFinder.logs.fetch(member);

  if (unregisterLogs) {
    var unregisters = unregisterLogs.unregister || [];
    var lastUnregister = unregisters.length > 0 ? unregisters[0] : null;
  }

  if (unregisters) {
    embed
      .addField(
        "Dernier unregister",
        lastUnregister ? lastUnregister.reason : "*Aucun*",
        true
      )
      .addField("\u200B", "\u200B", true)
      .addField("Nombre d'unregisters", unregisters.length.toString(), true);
  }

  var tUser = await tournament.fetchPlayer(member.id);

  var logs = tUser ? tUser.scoreLog : null;
  if (!tUser || !logs || logs.length == 0)
    return message.reply({
      embeds: [embed.setDescription(USER_LOG_SCORE_EMPTY)],
    });
  var logsText = "";
  var log;
  var banTime;
  var eloWon;
  for (i in logs) {
    if (i > LOG_AMOUNT) break;
    log = logs[i];
    log.time
      ? (banTime = `<t:${log.time.toString().slice(0, -3)}> | `)
      : (banTime = "");
    if (log.oldScore == undefined || !log.newScore == undefined) continue;
    eloWon = log.newScore - log.oldScore;
    if (eloWon > 0) eloWon = `+${eloWon}`;
    logsText =
      logsText + `**${log.newScore} (${eloWon})** | ${banTime}${log.reason} \n`;
  }

  if (logsText == "") logsText = USER_LOG_SCORE_EMPTY;

  embed.addField("\u200B", logsText);

  message.reply({ embeds: [embed] });
};

exports.data = {
  syntaxe: "logs @someone",
};
