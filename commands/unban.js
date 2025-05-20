const isAdmin = require("../ressources/isAdmin");
const banPlayer = require("../ressources/banPlayer");

var AUTHOR_NOT_REGISTERED = "Tu n'es pas inscrit !";
const USER_MENTIONNED_NOT_REGISTERED = "L'utilisateur n'est pas inscrit !";
const ERROR_CANT_UNREGISTER_WHILE_PLAYING =
  "Impossible de désinscrire pendant qu'une partie est en cours";
const DELETING_USER = "Suppression de l'utilisateur...";
const COMMAND_SYNTAX = "unban <@mention> <reason>";
const NOT_ADMIN_OF_TOURNAMENT = "Tu n'es pas administrateur de ce tournoi !";
const USER_SUCCESSFULLY_UNREGISTERED = "L'utilisateur a bien été désinscrit !";
const USER_ERROR_UNREGISTERING =
  "Une erreur est survenue lors de la désinscription de l'utilisateur";
const GUILD_HAS_NO_TOURNAMENT = "Ce serveur n'a aucun tournoi en cours";
const USER_ISNT_BANNED = "`NOTE : Cet utilisateur n'est pas banni !`";
const USER_SUCCESSFULLY_UNBANNED = "L'utilisateur a bien été débanni !";
const DEFAULT_TOURNAMENT_ID = "rush_ranked";

exports.run = async (client, message, args, tools) => {
  var statsFinder = client.statsFinder;
  var tournament = await statsFinder.tournaments.fetchByGuild(message.guild.id);
  if (!tournament)
    tournament = await statsFinder.tournaments.fetch(DEFAULT_TOURNAMENT_ID);
  if (!tournament) return message.channel.send("nop");
  if (!client.isAdmin(message.author) && !tournament.isAdmin(message.author))
    return message.channel.send(NOT_ADMIN_OF_TOURNAMENT);

  var user = message.mentions.users.first();
  var reason = args.slice(1).join(" ");
  if (!user || !reason) return message.reply(tools.syntaxe);

  var player = await tournament.fetchPlayer(user.id);
  if (!player || (player && !player.isBanned))
    message.channel.send(USER_ISNT_BANNED);
  banPlayer(
    client,
    tournament.id,
    player.id,
    0,
    `Unbanned by ${message.author.tag} (${reason})`
  );
  message.reply(USER_SUCCESSFULLY_UNBANNED);
};
exports.data = {
  syntaxe: "unban @someone reason",
};
