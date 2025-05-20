const AUTHOR_NOT_REGISTERED = "Tu n'es pas inscrit !";
const ERROR_UNKONWN = "Erreur inconnue";
const SUCCESSFULLY_UPDATED = "Compte mis à jour !";
const ROLE_DEFAULT_ID = "908890814594306121";

module.exports = async function updateEloGuild(client, guildID, id) {
  return await new Promise(async (resolve, reject) => {
    var statsFinder = client.statsFinder;
    var guild = await client.guilds.fetch(guildID).catch(() => {});
    if (!guild) return reject(AUTHOR_NOT_REGISTERED);
    var member = await guild.members.fetch(id).catch(() => {});
    if (!member) return reject(ERROR_UNKONWN);
    var sfMember = await statsFinder.users.fetch(member.id);
    if (!sfMember) return reject(ERROR_UNKONWN);
    statsFinder.users.updateMCUsername(sfMember.id);
    var tUser = await statsFinder.tournaments.fetchPlayer(
      "rush_ranked",
      member.id
    );
    var score = 0;
    if (tUser) score = tUser.score;
    var funcraft = await statsFinder.getStats(
      sfMember.link.funcraft
        ? { id: sfMember.link.funcraft }
        : { username: sfMember.link.minecraft }
    );
    if (!funcraft) return reject(ERROR_UNKONWN);
    var role = await guild.roles.fetch(ROLE_DEFAULT_ID).catch(() => {});
    var name =
      sfMember.link && funcraft.username
        ? funcraft.username
        : member.user.username;
    name = `(${score}) - ${name}`;
    var uselessRankRoles = [];
    if (tUser) {
      var rankRole = await guild.roles.cache.find((r) =>
        r.name.includes(tUser.rank.rankName)
      );

      var tempRank;
      for (var uselessRank of tUser.uselessRanks) {
        tempRank = await guild.roles.cache.find((r) =>
          r.name.includes(uselessRank.rankName)
        );
        if (tempRank) uselessRankRoles.push(tempRank);
      }
    }

    member.setNickname(name).catch(() => {});
    if (uselessRankRoles.length != 0)
      await member.roles.remove(uselessRankRoles).catch(() => {});
    if (rankRole)
      await member.roles.add(rankRole).catch((err) => {
        console.log(err);
      });
    else if (role) await member.roles.add(role).catch(() => {});
    resolve(SUCCESSFULLY_UPDATED);
  });
};
