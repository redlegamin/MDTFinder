const MATCH_SUCCESSFULLY_DELETED = "Match supprimé avec succès";    
const MATCH_ERROR_DELETED = "Erreur lors de la suppression du match";

exports.run = async (client, message, args) => {
    var statsFinder = client.statsFinder;
    var tournament = await statsFinder.tournaments.fetchByGuild(message.guild.id);
    if (!tournament) return message.channel.send(NOT_TOURNAMENT_RUNNING);
    if(!client.isAdmin(message.author) && !tournament.isModerator(message.author)) return message.channel.send(NOT_MODERATOR_OF_TOURNAMENT);
    var matchID = args[0];
    if(!matchID) return message.channel.send("Veuillez indiquer un matchID");
    var match = await statsFinder.matchs.fetch(matchID);
    if(!match) return message.channel.send("Match introuvable");

    await match.delete();

    var misc = match.misc;
    if(misc) {
        var textChannel = await client.channels.fetch(misc.textChannel);
        var firstTeamVoiceChannel = await client.channels.fetch(misc.firstTeamVoiceChannel);
        var secondTeamVoiceChannel = await client.channels.fetch(misc.secondTeamVoiceChannel);
        if(textChannel) textChannel.delete();
        if(firstTeamVoiceChannel) firstTeamVoiceChannel.delete();
        if(secondTeamVoiceChannel) secondTeamVoiceChannel.delete();
    }
    match = await statsFinder.matchs.fetch(matchID);
    if(!match) message.reply(MATCH_SUCCESSFULLY_DELETED);
    else message.reply(MATCH_ERROR_DELETED);
}