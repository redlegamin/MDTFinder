const COMMAND_SYNTAX = "setelo @someone nombre";
const INVALID_NUMBER = "Merci de saisir un nombre valide";
const USER_MENTIONNED_NOT_REGISTERED =
  "L'utilisateur n'est pas enregistré dans le tournoi";
const DEFAULT_TOURNAMENT_ID = "rush_ranked";
const SET_USER_TO = "Elo mis à";
const DEFAULT_ERROR_MESSAGE = "Erreur inconnue";
const updateEloGuild = require("../ressources/updateEloGuild");
const NOT_MODERATOR_OF_TOURNAMENT = "Vous n'êtes pas modérateur du tournoi";

exports.run = async (client, message, args, tools) => {
  var statsFinder = client.statsFinder;
  var member = message.mentions.users.first();
  var numberText = args[1];
  if (!member || !numberText)
    return message.reply(`${client.PREFIX}${COMMAND_SYNTAX}`);
  number = parseInt(numberText);
  if (isNaN(number)) return message.reply(INVALID_NUMBER);
  var tournament = await statsFinder.tournaments.fetchByGuild(message.guild.id);
  if (!tournament)
    tournament = await statsFinder.tournaments.fetch(DEFAULT_TOURNAMENT_ID);
  if (!tournament) return message.reply(DEFAULT_ERROR_MESSAGE);
  if (!client.isAdmin(message.author) && !tournament.isAdmin(message.author))
    return message.channel.send(NOT_MODERATOR_OF_TOURNAMENT);

  var tUser = await tournament.fetchPlayer(member.id);
  if (!tUser) return message.reply(USER_MENTIONNED_NOT_REGISTERED);
  var previousScore = tUser.score;

  var elo;
  if (numberText.startsWith("+") || numberText.startsWith("-"))
    elo = await tournament.addElo(
      member.id,
      number,
      "Request by " + message.author.tag
    );
  else
    elo = await tournament.setElo(
      member.id,
      number,
      "Request by " + message.author.tag
    );
  if (elo == undefined) return message.reply(DEFAULT_ERROR_MESSAGE);
  updateEloGuild(client, tournament.guildID || message.guild.id, member.id)
    //.then((msg) => message.reply(msg))
    .catch((err) => message.reply(err));

  message.reply(`(${previousScore}) ${SET_USER_TO} ${elo} !`);
};

exports.data = {
  syntaxe: "setelo @someone amount",
};
