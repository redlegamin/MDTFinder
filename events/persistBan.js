const DEFAULT_TOURNAMENT_ID = "rush_ranked";

exports.run = async (client, member) => {
  console.log(member.id + " joined the server");
  var guild = member.guild;
  var statsFinder = client.statsFinder;
  var tournament = await statsFinder.tournaments.fetchByGuild(guild.id);
  if (!tournament)
    tournament = await statsFinder.tournaments.fetch(DEFAULT_TOURNAMENT_ID);
  if (!tournament) return;
  var player = await tournament.fetchPlayer(member.id);
  if (!player || !player.isBanned) return;
  var role = await guild.roles.fetch(tournament.roles.banned);
  if (!role) return;
  member.roles.add(role).catch(() => {});
};
