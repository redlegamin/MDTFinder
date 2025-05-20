const { MessageEmbed } = require('discord.js');

const FIRST_TEAM_NAME = "red"
const EMBED_FIRST_TEAM_NAME = "Equipe #1"
const SECOND_TEAM_NAME = "blue"
const EMBED_SECOND_TEAM_NAME = "Equipe #2"
var EMBED_COLOR = "#ffffff"
var REVERSED_EMBED_COLOR = "#FFFF00"

module.exports = function matchEmbed (client, match) {
    
    if(client.config.embedColor) EMBED_COLOR = client.config.embedColor;
    if(!match) return;
    var players = match.players;
    var superMentionFirstTeam = "";
    var superMentionSecondTeam = "";
    var tempMember;
    var cara;
    var eloWon = "";
    for(i = 0; i < players.length; i++) {
        tempMember = players[i];
        cara = tempMember.eloWon > 0 ? "+" : "";
        eloWon = tempMember.eloWon ? tempMember.eloWon : "0"
        eloWon = cara + eloWon;
        if(tempMember.team == FIRST_TEAM_NAME) superMentionFirstTeam += `**(${eloWon})** ${tempMember.minecraft} **${tempMember.kd.broken ? "-/-" : `${tempMember.kd.kills}/${tempMember.kd.deaths}`}**\n`;
        else if(tempMember.team == SECOND_TEAM_NAME) superMentionSecondTeam += `**(${eloWon})** ${tempMember.minecraft} **${tempMember.kd.broken ? "-/-" : `${tempMember.kd.kills}/${tempMember.kd.deaths}`}**\n`;
    }

    var embed = new MessageEmbed()
    .setTitle("Match Ended" + `${match.reverted == true ? " (Reversed)" : ""}`)
    .setDescription(`[Informations du match en ligne](https://mdtfinder.fr/match/${match.id})`)
    .setFooter(`ID ${match.id} - ${match.timeText || "0m"}`)
    if(match.image) {
        embed.setImage(match.image);
    }
    else {
        embed.addField(EMBED_FIRST_TEAM_NAME, superMentionFirstTeam, true)
        embed.addField(EMBED_SECOND_TEAM_NAME, superMentionSecondTeam, true)
    }
    if(match.reverted == true) embed.setColor(REVERSED_EMBED_COLOR);
    else embed.setColor(EMBED_COLOR);
    return embed;
}