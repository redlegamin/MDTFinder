const DEFAULT_GUILD_ID = "1039895288992772126";
const DEFAULT_TOURNAMENT_ID = "rush_ranked";

module.exports = function autoUnban(client) {
  var statsFinder = client.statsFinder;
  setInterval(async function () {
    var tournament = await statsFinder.tournaments.dbTournament.findOne(
      { id: DEFAULT_TOURNAMENT_ID },
      {
        players: {
          $elemMatch: {
            $and: [
              {
                ban: {
                  $lt: Date.now(),
                },
              },
              {
                ban: {
                  $gt: Date.now() - 24 * 60 * 60 * 1000,
                },
              },
            ],
          },
        },
      }
    );
    if (tournament) var playerBanned = tournament.players[0];
    if (tournament && playerBanned) {
      var t = await statsFinder.tournaments.fetchByGuild(DEFAULT_GUILD_ID);
      if (!t) t = await statsFinder.tournaments.fetch(DEFAULT_TOURNAMENT_ID);
      console.log("unbanning " + playerBanned.id);
      console.log("ban time " + playerBanned.ban);
      if (
        playerBanned.ban < Date.now() - 24 * 60 * 60 * 1000 ||
        playerBanned.ban > Date.now()
      )
        return;
      var isRed = playerBanned.id == "219380115602145280";
      var guild = await client.guilds.cache.get(t.guildID);
      if (guild)
        var role = await guild.roles.fetch(t.roles.banned).catch(() => {});
      if (guild)
        var member = await guild.members.fetch(playerBanned.id).catch(() => {});
      if (role && member) await member.roles.remove(role).catch(() => {});
      await statsFinder.tournaments.dbTournament.updateOne(
        {
          id: t.id,
          "players.id": playerBanned.id,
        },
        {
          $set: {
            "players.$.ban": 0,
          },
        }
      );
    }
  }, 5000);
};
