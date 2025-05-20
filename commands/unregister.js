const USER_MENTIONNED_NOT_REGISTERED = "L'utilisateur n'est pas inscrit !"
const ERROR_CANT_UNREGISTER_WHILE_PLAYING = "Impossible de désinscrire pendant qu'une partie est en cours"
const NOT_MODERATOR_OF_TOURNAMENT = "Tu n'es pas modérateur de ce tournoi !"
const USER_SUCCESSFULLY_UNREGISTERED = "L'utilisateur a bien été désinscrit !"
const USER_ERROR_UNREGISTERING = "Une erreur est survenue lors de la désinscription de l'utilisateur"

exports.run = async (client, message, args, tools) => {

    var statsFinder = client.statsFinder;
    var tournament = await statsFinder.tournaments.fetchByGuild(message.guild.id);
    if(!client.isAdmin(message.author) && !tournament.isModerator(message.author)) return message.channel.send(NOT_MODERATOR_OF_TOURNAMENT);
    
    var user = message.mentions.users.first();
    if (!args[0]) return message.reply(tools.syntaxe);
    var userID = user ? user.id : args[0];

    var sfUser = await statsFinder.getUser(userID);
    if (!sfUser) return message.reply(USER_MENTIONNED_NOT_REGISTERED);
    var force;
    if (args[1] && args[1] == "force") force = true;

    var unregisterLogs = await statsFinder.logs.fetch(sfUser);
    var unregistersCount = 0;
    if(unregisterLogs) {
        var unregisters = unregisterLogs.unregister || [];
        unregistersCount = unregisters.length || 0;
    }

    message.channel.send("`NOTE : L'utilisateur a déjà été unregister " + unregistersCount + " fois`");

    if (await sfUser.isInMatch() && !force) return message.reply(ERROR_CANT_UNREGISTER_WHILE_PLAYING);

    var reason = "Unregistered by " + message.author.tag;

    if(tournament) await tournament.setElo(userID, 0, reason);
    await sfUser.delete(reason);
    sfUser = await statsFinder.getUser(userID);
    if(!sfUser) message.reply(USER_SUCCESSFULLY_UNREGISTERED);
    else message.reply(USER_ERROR_UNREGISTERING);
}


exports.data = {
    syntaxe: "unregister @someone [force]",
}