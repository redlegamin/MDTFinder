const isAdmin = require("../ressources/isAdmin");

const NOT_MODERATOR_OF_TOURNAMENT = "Vous n'êtes pas modérateur de ce tournoi.";
const NOT_TOURNAMENT_RUNNING = "Il n'y a pas de tournoi en cours sur ce serveur Discord."

exports.run = async (client, message, args, tools) => {
    var statsFinder = client.statsFinder;
    var tournament = await statsFinder.tournaments.fetchByGuild(message.guild.id);
    if (!client.isAdmin(message.author)  && !tournament) return message.channel.send(NOT_TOURNAMENT_RUNNING);
    if(!client.isAdmin(message.author) && !tournament.isModerator(message.author)) return message.channel.send(NOT_MODERATOR_OF_TOURNAMENT);
    var matchID = args[0];
    if(!matchID) return message.reply(tools.syntaxe);
    var match = await statsFinder.matchs.fetch(matchID);
    if(!match) return message.channel.send("Match introuvable");
    else statsFinder.matchs.stop(matchID, true)
    message.channel.send("Arrêt du match en cours... (Si ce message est encore là après 1 minutes, merci de mentio @redlegamin)");
}

exports.data = {
    syntaxe: "stopmdt matchID",
}