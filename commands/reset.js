const USER_MENTIONNED_NOT_REGISTERED =
  "L'utilisateur n'est pas enregistré dans le tournoi";
const DEFAULT_TOURNAMENT_ID = "rush_ranked";
const DEFAULT_ERROR_MESSAGE = "Erreur inconnue";
const CustomButtonCollector = require("../ressources/CustomButtonCollector");
const { MessageButton, MessageActionRow } = require("discord.js");

exports.run = async (client, message, args, tools) => {
  var statsFinder = client.statsFinder;
  var member = message.mentions.users.first();
  if (!member) return message.reply(tools.syntaxe);
  var tournament = await statsFinder.tournaments.fetchByGuild(message.guild.id);
  if (!tournament)
    tournament = await statsFinder.tournaments.fetch(DEFAULT_TOURNAMENT_ID);
  if (!tournament) return message.reply(DEFAULT_ERROR_MESSAGE);

  var tUser = await tournament.fetchPlayer(member.id);
  if (!tUser) return message.reply(USER_MENTIONNED_NOT_REGISTERED);

  var id = `id${Date.now()}`;
  var button = new MessageButton()
    .setCustomId(id)
    .setLabel("CONFIRMER")
    .setStyle("SUCCESS");

  var row = new MessageActionRow().addComponents(button);

  var msgData = {
    content: `Es-tu sur de vouloir reset les stats de ${member} ?\`\`\`\n${JSON.stringify(
      {
        kills: tUser.kills,
        deaths: tUser.deaths,
        wins: tUser.wins,
        matchs: tUser.matchs,
      }
    )}\n\`\`\``,
    components: [row],
  };

  var buttonReply = await CustomButtonCollector({
    channel: message.channel,
    time: 15000,
    list: [message.member],
    message: msgData,
    customId: id,
  });

  if (!buttonReply || !buttonReply.interaction)
    return message.reply("Stats non reset !");
  await tournament.addStats(tUser, {
    kills: -tUser.kills,
    deaths: -tUser.deaths,
    matchs: -tUser.matchs,
    wins: -tUser.wins,
  });

  return message.reply("Stats reset !");
};

exports.data = {
  syntaxe: "reset @someone",
};
