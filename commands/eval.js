exports.data = {
    DISCORD_ID_RED: "219380115602145280",
    DISCORD_ID_BLACK: "341007140011507712"
}

exports.run = async (client, message, args, tools) => {
    if(message.isImite) return;
    if (!(message.author.id == this.data.DISCORD_ID_RED) && !(message.author.id == this.data.DISCORD_ID_BLACK)) return;
    if (!args[0]) return;
    message.channel.send("`> " + args.slice(0).join(" ") + "`")
    try {
        var output = await eval(`(async () => {${await args.slice(0).join(" ")}})()`);
        message.channel.send("`> " + output + "`")
    } catch (e) {
        message.channel.send("`> " + e + "`")
    }
    
}