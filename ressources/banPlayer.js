module.exports = async function banPlayer(client, tournamentResolver, playerResolver, time, reason) {
    var statsFinder = client.statsFinder;
    if(!tournamentResolver) return;
    var tournament = await statsFinder.tournaments.fetch(tournamentResolver);
    if(!tournament) return;
    var player = await tournament.fetchPlayer(playerResolver);
    if(!player) await tournament.setElo(playerResolver, 0);
    
    var player = await tournament.fetchPlayer(playerResolver);
    if(!player) return;
    if(player.banHistory) var lastBan = player.banHistory[0];


    if(time == false) time = 0;
    if(time == undefined && lastBan && lastBan.duration && lastBan.expirationDate) {
        if(lastBan.expirationDate + 24*60*60*1000 > Date.now()) {
            time = lastBan.duration * 4;
        }
        else time = 1000*60*5;
    }

    if(time == undefined) time = 5*60*1000;
    if(isNaN(time)) throw "Time is not a number";

    if(time != undefined && tournament.roles.banned) {
        var guild = await client.guilds.fetch(tournament.guildID).catch(() => {});
        if(guild) var member = await guild.members.fetch(player.id);
        if(guild) var role = await guild.roles.fetch(tournament.roles.banned);

        if(member && role) {
            if(time == 0) member.roles.remove(role).catch(() => {});
            else member.roles.add(role).catch(() => {});
        }
    };

    return await tournament.ban(player, time, reason);
}
