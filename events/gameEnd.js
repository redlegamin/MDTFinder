var LOG_CHANNEL = "909500222911156325";
const updateEloGuild = require("../ressources/updateEloGuild")
const matchEmbed = require("../ressources/matchEmbed")
const deleteMatch = require("../ressources/deleteMatchChannels")

exports.run = async (client, match) => {
    console.log(match.id + " - Match ended")
    var statsFinder = client.statsFinder;
    if(statsFinder.config.ranked.logChanneID) LOG_CHANNEL = statsFinder.config.ranked.logChanneID;

    var misc = match.misc;
    if(misc) {
        deleteMatch(client, misc)
    }
    
    if(!match.time || match.time < 5) var reverted = true;
    if(reverted) var reversedMatch = await match.reverse(`${match.id} auto reverted`);

    await match.generateImage();
    match = await statsFinder.matchs.fetch(match);
    if(reverted) reversedMatch = match;

    var logChannel = await client.channels.fetch(LOG_CHANNEL);
    if(!logChannel) return;

    var tempPlayer;
    var players = match.players;
    for(i = 0; i < players.length; i++) {
        tempPlayer = players[i];
        await updateEloGuild(client, logChannel.guild.id, tempPlayer.id).catch((err)=> console.log(err))
    }

    
    var embed = matchEmbed(client, reversedMatch || match);
    if(embed) await logChannel.send({embeds:[embed]})
    if(reverted) logChannel.send("`Le match a été automatiquement revert`")
};
