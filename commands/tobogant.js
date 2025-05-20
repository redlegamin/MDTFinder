exports.run = async (client, message, args, tools) => {
    var statsFinder = client.statsFinder;
    client.delay(message.author, "tobogant", 1000);
    var tournament = await statsFinder.tournaments.fetchByGuild(message.guild.id);
    if(!client.isAdmin(message.author) && !tournament.isAdmin(message.author)) return message.channel.send(this.data.NOT_MODERATOR_OF_TOURNAMENT);
    
    var member = message.mentions.members.first();
    if (!member) return message.reply(tools.syntaxe);
    if(!member.voice) return;
    var channel = member.voice.channel;
    var guild = message.guild;
    if(!channel || !channel.parent || !channel.parent.children) return message.reply(this.data.UNKNOWN_ERROR);
    message.reply(this.data.WOOSH);
    channel.parent.children.each(async (tempChannel) => {
        tempChannel = await tempChannel.fetch();
        if (!tempChannel) return;
        if(tempChannel.type != this.data.CHANNEL_TYPE_VOICE) return;
        member.voice.setChannel(tempChannel.id).catch(() => {})
    })
}

exports.data = {
    syntaxe: "toboggan @someone",
    NOT_MODERATOR_OF_TOURNAMENT: "nop, dumb dumb",
    WOOSH: "woosh :dash:",
    UNKNOWN_ERROR: "??",
    CHANNEL_TYPE_VOICE: "GUILD_VOICE",
}
