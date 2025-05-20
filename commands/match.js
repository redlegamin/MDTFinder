const matchEmbed = require("../ressources/matchEmbed.js")
const EMBED_CREATION_ERROR = "Il y a eu une erreur lors de la création du message";
const MATCH_NOT_FOUND = "Match introuvable";
exports.run = async (client, message, args, tools) => {
    var statsFinder = client.statsFinder;
    var matchID = args[0];
    if(!matchID) return message.reply(tools.syntaxe);
    var match = await statsFinder.matchs.fetch(matchID);
    if(!match) return message.reply(MATCH_NOT_FOUND);
    var embed = await matchEmbed(client, match);
    if(embed) message.reply({embeds: [embed]});
    else message.reply(EMBED_CREATION_ERROR);
}

exports.data = {
    syntaxe: "match matchID",
}