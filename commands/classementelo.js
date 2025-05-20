const DEFAULT_TOURNAMENT_ID = "rush_ranked";
const { MessageEmbed } = require("discord.js");
const EMOJI_INVISIBLE = "<:Liste:410856444813115393>";
const PLAYER_NUMBER = 14;
const LINK_BASE_TOURNAMENT = "https://mdtfinder.fr/tournament/";
const LINK_BASE_USER = "https://mdtfinder.fr/user/";

exports.run = async (client, message, args, tools) => {
  var statsFinder = client.statsFinder;
  var tournament = await statsFinder.tournaments.fetchByGuild(message.guild.id);
  if (!tournament)
    tournament = await statsFinder.tournaments.fetch(DEFAULT_TOURNAMENT_ID);
  if (!tournament) return;
  var classementList = await tournament.getLeaderboard(PLAYER_NUMBER);
  var embedContent = "";
  var embedContent2 = "";
  for (i = 0; i < classementList.length && i < PLAYER_NUMBER; i++) {
    var player = classementList[i];
    var user = await statsFinder.users.fetch(player.id);
    var leaderboardSlot = i + 1;
    var score = player.score;
    var wins = player.wins || 0;
    var matchs = player.matchs || 0;
    var username = user && user.link ? user.link.minecraft : `<@${player.id}>`;
    var kills = player.kills || 0;
    var deaths = player.deaths || 0;

    var ratio = (kills / (deaths || 1)).toFixed(2);
    var winrate = ((wins / (matchs || 1)) * 100).toFixed(1);
    var content = `**#${leaderboardSlot} [${username}](${LINK_BASE_USER}${player.id})** (${score}) ${winrate}% - ${ratio} KD\n\n`;
    if (i < PLAYER_NUMBER / 2) embedContent += content;
    else embedContent2 += content;
  }

  var embed = new MessageEmbed().setAuthor(
    `Classement ${tournament.name}`,
    tournament.brand.logo,
    `${LINK_BASE_TOURNAMENT}${tournament.id}`
  );
  //.setDescription(`[Classement en ligne](${LINK_BASE_TOURNAMENT}${tournament.id})`)
  if (embedContent != "") embed.addField(EMOJI_INVISIBLE, embedContent, true);
  if (embedContent2 != "") embed.addField(EMOJI_INVISIBLE, embedContent2, true);
  if (embedContent == "" && embedContent2 == "")
    embed.setDescription("Aucun joueur n'est enregistré dans le classement.");
  return message.channel.send({
    embeds: [embed],
  });
};
