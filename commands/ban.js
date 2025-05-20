const banPlayer = require("../ressources/banPlayer");

const NOT_ADMIN_OF_TOURNAMENT = "Tu n'es pas administrateur de ce tournoi !";
const USER_IS_BANNED = "`NOTE : L'utilisateur était déjà banni`";
const USER_SUCCESSFULLY_BANNED = "L'utilisateur a bien été banni";
const DEFAULT_TOURNAMENT_ID = "rush_ranked";
const ERROR_CANT_BAN_USER = "Erreur, merci de reessayer";
const INVALID_NUMBER = "Le nombre entré est invalide";
var notAdmin = false;

exports.run = async (client, message, args, tools) => {
  var statsFinder = client.statsFinder;
  var tournament = await statsFinder.tournaments.fetchByGuild(message.guild.id);
  if (!tournament)
    tournament = await statsFinder.tournaments.fetch(DEFAULT_TOURNAMENT_ID);
  if (!tournament) return message.channel.send("nop");
  if (tournament.channels.logBan)
    var channel = await client.channels
      .fetch(tournament.channels.logBan)
      .catch(() => {});
  if (!client.isAdmin(message.author) && !tournament.isAdmin(message.author))
    notAdmin = true;
  if (notAdmin && !client.config.avril)
    return message.channel.send(NOT_ADMIN_OF_TOURNAMENT);

  var user = message.mentions.members.first();
  if (!args[0]) return message.reply(tools.syntaxe);
  var userID = user ? user.id : args[0];

  var time = args[1];
  var reason = args.slice(2).join(" ");
  if (!userID || !reason) return message.reply(tools.syntaxe);
  time = parseInt(args[1]);
  if (isNaN(time)) return message.reply(INVALID_NUMBER);
  if (time < 1) return message.reply("Valeur de ban trop basse");

  var timeMs;
  if (time) timeMs = time * 3600000 * 24;
  var textTime = time <= 3 ? `${time * 24}H` : `${time} jours`;

  var player = await tournament.fetchPlayer(userID).catch(() => {});
  if (!player) {
    await tournament.createPlayer({ id: userID });
    player = await tournament.fetchPlayer(userID).catch(() => {});
  }

  if (!player) return message.reply(ERROR_CANT_BAN_USER);

  if (!notAdmin) {
    if (player && player.isBanned) message.channel.send(USER_IS_BANNED);
    await banPlayer(client, tournament.id, player.id, timeMs, reason);

    var reply;
    time
      ? (reply = `${USER_SUCCESSFULLY_BANNED} pour un durée de ${textTime}`)
      : (reply = USER_SUCCESSFULLY_BANNED);

    if (channel) channel.send(`<@${userID}>\n${textTime}\n${reason}`);
    message.reply(reply);
  } else {
    var fakeBanned = tournament.roles.fakeBanned;
    if (!fakeBanned) return;
    if (user.roles.cache.find((r) => r.id == fakeBanned))
      return message.reply(USER_IS_BANNED);
    try {
      await user.roles.add(fakeBanned);
    } catch (err) {
      return message.reply("Ptit bug un peu génant là");
    }

    var reply;
    time
      ? (reply = `${USER_SUCCESSFULLY_BANNED} pour un durée de ${textTime}`)
      : (reply = USER_SUCCESSFULLY_BANNED);

    message.reply(reply);
  }
};

exports.data = {
  syntaxe: "ban @someone time reason",
};
