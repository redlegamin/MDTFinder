const CANT_REVERSE_RUNNING_MATCH = "Le match est en cours : Impossible de d'inverser un match en cours";
var MATCH_SUCCESSFULLY_REVERSED = `Inversement des elo du match en cours...`;
const UNKNOWN_MATCH = `Match introuvable`;
const COMMAND_SYNTAX = `revert <matchID> <reason>`;
const NOT_ADMIN_OF_TOURNAMENT = "Vous n'êtes pas administrateur du tournoi";
const MATCH_HAS_ALREADY_BEEN_REVERSED = "Le match a déjà été inversé";

exports.run = async (client, message, args, tools) => {
    var statsFinder = client.statsFinder;
    var tournament = await statsFinder.tournaments.fetchByGuild(message.guild.id);
    if(!client.isAdmin(message.author) && !tournament.isModerator(message.author)) return message.channel.send(NOT_ADMIN_OF_TOURNAMENT);
    var matchID = args[0];
    var reason = args.slice(1).join(" ");
    if(!matchID || !reason) return message.reply(tools.syntaxe);
    var statsFinder = client.statsFinder;
    var match = await statsFinder.matchs.fetch(matchID);
    if(!match) return message.reply(UNKNOWN_MATCH);
    if(match.status != "ended") return message.reply(CANT_REVERSE_RUNNING_MATCH);
    if(match.reverted) return message.reply(MATCH_HAS_ALREADY_BEEN_REVERSED);
    var reversedMatch = await match.reverse(`${message.author.tag} reverted ${matchID} (${reason})`);
    message.reply(MATCH_SUCCESSFULLY_REVERSED);
}

exports.data = {
    syntaxe: "revert matchID reason",
}