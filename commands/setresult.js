const isAdmin = require("../ressources/isAdmin");
const matchEmbed = require("../ressources/matchEmbed");

const NOT_MODERATOR_OF_TOURNAMENT = "Vous n'êtes pas modérateur de ce tournoi.";
const NOT_TOURNAMENT_RUNNING = "Il n'y a pas de tournoi en cours sur ce serveur Discord."
const COMMAND_SYNTAXE = "`.setresult <matchID> <team1||team2> <win||lose> <reason>`";
const CANT_MODIFY_RUNNING_MATCH = "Impossible de modifier le résultat d'une partie en cours.";

exports.run = async (client, message, args) => {
    var statsFinder = client.statsFinder;
    var tournament = await statsFinder.tournaments.fetchByGuild(message.guild.id);
    if (!tournament) return message.channel.send(NOT_TOURNAMENT_RUNNING);
    if(!client.isAdmin(message.author) && !tournament.isModerator(message.author)) return message.channel.send(NOT_MODERATOR_OF_TOURNAMENT);
    var matchID = args[0];
    var team = args[1];
    var result = args[2];
    var reason = args.slice(3).join(" ");
    if(!result || !["team1", "team2"].includes(team) || !["win","lose","draw"].includes(result) || !args[3] || !reason) return message.channel.send(COMMAND_SYNTAXE);
    var match = await statsFinder.matchs.fetch(matchID);
    if(!match) return message.channel.send("Match introuvable");
    if(match.status != "ended") return message.reply(CANT_MODIFY_RUNNING_MATCH);

    var teamColor = team == "team1" ? "red" : "blue";
    if(!match.reverted) await match.reverse(`${message.author.tag} reverted (setresult) ${matchID} (${reason})`);
    var newMatch = await statsFinder.matchs.changeWin(match.id, {[teamColor]: "win", revert: true}, `${message.author.tag} changed result of ${matchID} (${reason})`);
    
    if(newMatch) await newMatch.generateImage();
    newMatch = await statsFinder.matchs.fetch(newMatch);

    var embed = await matchEmbed(client, newMatch);
    message.reply({content: `Le résultat de la partie \`${match.id}\` a été changé.`, embeds: [embed]});
}


exports.data = {
    syntaxe: ".setresult matchID team1||team2 win||lose reason",
}