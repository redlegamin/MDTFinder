module.exports = async function deleteMatchChannels(client, channelResolver = {time : 0}) {
    if(typeof channelResolver === "object") {
        var textChannel = await client.channels.fetch(channelResolver.textChannel).catch(() => {});
        var firstTeamVoiceChannel = await client.channels.fetch(channelResolver.firstTeamVoiceChannel).catch(() => {});
        var secondTeamVoiceChannel = await client.channels.fetch(channelResolver.secondTeamVoiceChannel).catch(() => {});

        var time = channelResolver.time;
        var text = channelResolver.text;

        setTimeout(function () {
            if(time && time > 0 && text) textChannel.send(text);
            if(textChannel) textChannel.delete();
            if(firstTeamVoiceChannel) firstTeamVoiceChannel.delete();
            if(secondTeamVoiceChannel) secondTeamVoiceChannel.delete();
        }, time);
    }
}