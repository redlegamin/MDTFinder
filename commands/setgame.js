const Discord = require("discord.js")
exports.run = (client, message, args, tools) => {
    if (!args[0]) return message.channel.send(".setgame <message>");
    client.user.setActivity(`${args.slice(0).join(" ")}`);
    message.channel.send("Jeu changé en : " + args.slice(0).join(" "));
}

exports.data = {
    syntaxe: "setgame message",
}