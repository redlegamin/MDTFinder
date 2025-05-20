const CustomButtonCollector = require("../ressources/CustomButtonCollector");
const { MessageActionRow, MessageButton } = require("discord.js");

exports.data = {
        commands: true,
        ephemeral: true,
}

exports.run = async (client, interaction, args, tools) => {
    var statsFinder = client.statsFinder;
    var channel = interaction.channel;
    var member = interaction.member;

    if(member) sfUser = await statsFinder.getUser(member.user.id);
    if (!sfUser) {
        return interaction.reply("Tu n'êtes pas enregistré sur le serveur");
    };
    var match = await sfUser.isInMatch();
    if(!match) return interaction.reply("Tu n'es pas dans un match");

    var players = match.players;
    var team = players.find(player => player.id == member.id);
    var supposedChannelID;
    match.misc && match.misc.textChannel ? supposedChannelID = match.misc.textChannel : null;
    if(supposedChannelID && supposedChannelID != channel.id) return interaction.reply(`Réalise cette commande dans le salon du match (<#${supposedChannelID}>`);
    if(!team) return interaction.reply("Erreur");
    team = team.team;
    teamList = players.filter(player => player.team == team && player.id != member.id);
    console.log(team)
    console.log(teamList)
    if(!teamList) return interaction.reply("Erreur");
    if(teamList.length > 0) {
        var id = `id${Date.now()}`;
        var button = new MessageButton()
        .setCustomId(id)
        .setLabel('ABANDONNER')
        .setStyle('SUCCESS')
    
        var row = new MessageActionRow().addComponents(button);
        var superMention = teamList.map(p => "<@" + p.id + ">").join(", ");
    
        var  msgData = {content: `${superMention}\n\n**(0/${teamList.length + 1})** ${member} souhaite abandonner le match`, components: [row]}
    
        var buttonReply = await CustomButtonCollector({
            channel: interaction.channel, time: 30000, list: teamList, message: msgData, customId: id,
            clickedMessage: "**({{list}}/{{maxList}})** {{@user}} souhaite abandonner le match !",
        })
    
        if(!buttonReply || !buttonReply.interaction) return channel.send("Abandon annulé !");
    }
    var forceResult = {}
    forceResult[team] = "lose";
    team == "red" ? forceResult["blue"] = "win" : forceResult["red"] = "win";
    channel.send("Abandon du match en cours...").catch((err) => {});
    statsFinder.matchs.stop({id: match.id}, true, forceResult);
};


exports.slash = {
    "name": "abandon",
    "description": "Pour abandonner un match",
}