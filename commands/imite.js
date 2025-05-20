const hook = require("../ressources/hook")

exports.run = async (client, message, args, tools) => {
    
    var memberImited = message.mentions.members.first();
    var text = args.slice(1).join(" ");

    if (!memberImited || !text) return channel.send(tools.syntaxe);
    message.delete();

    var msg = await hook(client, message.channel, memberImited.nickname || memberImited.user.username, text, undefined, memberImited.user.avatarURL());
    msg.author = memberImited.user;
    msg.member = memberImited;
    msg.isImite = true;
    client.emit("messageCreate", msg)
}


exports.data = {
    syntaxe: "imite @someone",
}
