// This is now the way I want to define commands

const CustomButtonCollector = require("../ressources/CustomButtonCollector");
const AMOUNT_REQUIRED_PLAYERS = 2;
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

exports.data = {
        commands: false,
        ephemeral: false,
        AMOUNT_REQUIRED_PLAYERS: AMOUNT_REQUIRED_PLAYERS,
        WARNING_NUMBER_PLAYERS: `Vous devez fournir ${AMOUNT_REQUIRED_PLAYERS} joueurs différents`,
        ERROR_CANT_INVITE_OWN: "Vous ne pouvez pas inviter vous même",
        DEFAULT_QUEUE_ID: "417516750264074250",
        TEAM_JOIN_TIME: 30000,
        TEAM_MAX_PLAYERS: 2,
        COMMAND_OPTIONS_PLAYER: "player",
        commandNoWhitlist: ["list", "leave"],
        commandWhileRanked: ["list"],
        whitelist: true
}

exports.run = async (client, interaction, args, tools) => {

    var member = interaction.member;
    var options = interaction.options;
    var command = options.data[0];
    var teams = client.teams;
    var team = teams.getByPlayer(member.id);

    if(this.data.whitelist && !this.data.commandNoWhitlist.includes(command.name) && (!client.isWhitelisted(member, this.slash.name) && !client.isAdmin(member))) {
        return interaction.reply("Tu n'es pas whitelist pour cette commande");
    }
    
    if(client.delays.users[interaction.user.id] && !this.data.commandWhileRanked.includes(command.name)) {
        return interaction.reply("Impossible pour le moment (Une partie ranked essaye de se former)");
    }

    if(command.name == "invite") {
        if(client.isDelaied(interaction.user, this.slash.name + "_invite")) return interaction.reply("Tu dois attendre avant d'inviter un autre joueur");
        var player = options.getMember(this.data.COMMAND_OPTIONS_PLAYER);
        if(player.user.bot) return interaction.reply("Tu ne peux pas inviter un bot");
        if(!team) team = client.teams.create({"leader": member.id, "players": [member.id]});

        if(member.id == player.id) return interaction.reply("Tu ne peux pas inviter toi même");
        if(team.leader != member.id) return interaction.reply("Tu n'es pas le chef de cette équipe"); 
        if(team.getPlayer(player)) return interaction.reply("Ce joueur est déjà dans ton équipe");
        if(team.players.length >= this.data.TEAM_MAX_PLAYERS) return interaction.reply("Ton équipe est déjà complète");
        
        if(teams.getByPlayer(player.id)) return interaction.reply("Ce joueur est déjà dans une autre équipe");

        var id = `id${Date.now()}`;
        var button = new MessageButton()
            .setCustomId(id)
            .setLabel('REJOINDRE')
            .setStyle('SUCCESS')

        var embed = new MessageEmbed()
            .setTitle("Invitation de groupe")
            .setDescription(`${member} invite ${player} à rejoindre sa team`)
            .setColor("#43b581")

        var row = new MessageActionRow().addComponents(button);

        msgData = {
            embeds: [embed],
            components: [row]
        };

        var list = [player]

        client.delay(member.id, this.slash.name + "_invite", this.data.TEAM_JOIN_TIME);
        var buttonReply = await CustomButtonCollector({
            channel: interaction.channel,
            time: this.data.TEAM_JOIN_TIME,
            list: list,
            message: msgData,
            customId: id,
            deleteAfter: true
        })
        if(buttonReply.interaction) {
            if(teams.getByPlayer(player.id)) return interaction.reply("Ce joueur est déjà dans une autre équipe");
            team.addPlayer(player.id)
            teams._save();
            interaction.reply(`${player} a rejoint le groupe!`)
        }
        else interaction.reply(`${player} n'a pas accepté l'invitation à temps`)
        
        client.delay(member.id, this.slash.name + "_invite", null);
    }

    else if(command.name == "kick") {
        var player = options.getMember(this.data.COMMAND_OPTIONS_PLAYER);
        if(!team) return interaction.reply("Tu n'es dans aucune équipe");
        if(team.leader != member.id) return interaction.reply("Tu n'es pas le chef de cette équipe"); 
        if(team.leader == player.id) return interaction.reply("Tu ne peux pas kick le chef de l'équipe");
        // if(team.leader == member.id) return interaction.reply("Tu ne peux pas te kick"); # Inutile dans cette situation
        if(!team.getPlayer(player)) return interaction.reply("Ce joueur n'est pas dans ton équipe");
        team.removePlayer(player);
        teams._save();
        interaction.reply(`${player} a été kick du groupe!`)

    }

    else if(command.name == "leave") {
        if(!team) return interaction.reply("Tu n'es pas dans une équipe");
        if(team && team.leader == member.id) {
            team.disband(`${team.leader} left the team`);
            teams._save();
            interaction.reply("L'équipe a été disband");
        } 

        else {
            team.removePlayer(member.id);
            teams._save();
            return interaction.reply(`Tu as quitté l'équipe`)
        }
    }

    else if(command.name == "list") {
        var player = options.getMember(this.data.COMMAND_OPTIONS_PLAYER);
        team = teams.getByPlayer(player ? player.id : member.id);
        if(!team) return interaction.reply(player ? "Ce joueur n'est pas dans une équipe" : "Tu n'es dans aucune équipe");
        var superMention = await team.players.map(u => "<@" + u + ">").join("\n");
        superMention = superMention.replace(`<@${team.leader}>`, `<@${team.leader}> (Leader)`);
        var embed = new MessageEmbed()
            .setTitle("Liste des joueurs")
            .setDescription(superMention)
            .setColor("#43b581")
        return interaction.reply({embeds: [embed]})
    }

    else interaction.reply("Commande inconnue")
}

exports.slash = {
    "name": "groupe",
    "description": "Commandes de groupes pour jouer à plusieurs en queue",
    "options": [
        {
            "type": 1,
            "name": "invite",
            "description": "Inviter quelqu'un dans votre groupe",
            "options": [
                {
                    "type": 6,
                    "name": this.data.COMMAND_OPTIONS_PLAYER,
                    "description": "Joueur à inviter dans le groupe",
                    "required": true           
                }
            ]
        },{
            "type": 1,
            "name": "kick",
            "description": "Kick quelqu'un de votre groupe",
            "options": [
                {
                    "type": 6,
                    "name": this.data.COMMAND_OPTIONS_PLAYER,
                    "description": "Joueur à kick du groupe",
                    "required": true                    
                }
            ]
        },

        {
            "type": 1,
            "name": "leave",
            "description": "Quitte un groupe"
        },
        {
            "type": 1,
            "name": "list",
            "description": "Voir la liste des joueurs dans votre groupe",
            "options": [
                {
                    "type": 6,
                    "name": this.data.COMMAND_OPTIONS_PLAYER,
                    "description": "Le joueur à qui vous voulez voir la liste"
                }
            ]
        },
    ]
}
