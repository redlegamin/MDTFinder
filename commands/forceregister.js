const USER_MENTIONNED_NOT_REGISTERED = "L'utilisateur n'est pas inscrit !";
const ERROR_CANT_UNREGISTER_WHILE_PLAYING =
  "Impossible de désinscrire pendant qu'une partie est en cours";
const NOT_MODERATOR_OF_TOURNAMENT = "Tu n'es pas modérateur de ce tournoi !";
const USER_SUCCESSFULLY_UNREGISTERED = "L'utilisateur a bien été désinscrit !";
const USER_ERROR_UNREGISTERING =
  "Une erreur est survenue lors de la désinscription de l'utilisateur";
const updateEloGuild = require("../ressources/updateEloGuild");
const DISCORD_ELO_SERVER_ID = "1039895288992772126";

exports.run = async (client, message, args, tools) => {
  var statsFinder = client.statsFinder;
  var tournament = await statsFinder.tournaments.fetchByGuild(message.guild.id);
  if (
    !client.isAdmin(message.author) &&
    !tournament.isModerator(message.author)
  )
    return message.channel.send(NOT_MODERATOR_OF_TOURNAMENT);

  var user = message.mentions.users.first();
  if (!args[1]) return message.reply(tools.syntaxe);

  var minecraftName = args[1];
  var user = message.mentions.users.first();
  if (!user) return message.reply(tools.syntaxe);

  var sfUser = await statsFinder.getUser(user.id);
  if(sfUser) return message.reply(`L'utilisateur ${user} est déjà inscrit !`);

  if(!statsFinder.getStats({ username: minecraftName })) return message.reply(`Le joueur ${minecraftName} n'est pas inscrit sur Funcraft !`)

  var sfUser = await client.statsFinder.users.create({
    user: user,
    minecraft: message.author,
  });

  if (!sfUser) {
    return message.channel.send("Un utilisateur avec ce pseudo existe! (déjà flm de coder un unregister auto, dites moi si necessaire mais flm là)");
  }

  updateEloGuild(client, DISCORD_ELO_SERVER_ID, user.id).catch((err) =>
    console.log(err)
  );

  return message.channel.send("L'utilisateur a bien été inscrit !");
};

exports.data = {
  syntaxe: "forceregister @someone <minecraftName>",
};
