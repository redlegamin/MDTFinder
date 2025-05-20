// This is fucking retarded but i don't have time to improve it

const CustomButtonCollector = require("../ressources/CustomButtonCollector");
const deleteMatchChannels = require("../ressources/deleteMatchChannels");
const Discord = require("discord.js");
const { MessageButton, MessageActionRow, MessageEmbed, MessageSelectMenu } = require("discord.js")
const shuffle = require("../ressources/shuffle");
const banPlayer = require("../ressources/banPlayer");
var REQUIRED_MEMBERS_COUNT = 4;
var DISCORD_ELO_CHANNEL_PARENT = "910564351688200244";
var PRIVATE_LOG_CHANNEL_ID = "914237262227718164";
var CHANNEL_PREFIX = "match";

const FIRST_TEAM_NAME = "red"
const SECOND_TEAM_NAME = "blue"
const MATCH_CONFIRMATION_WAIT_TIME = 50000;
const MATCH_PICK_WAIT_TIME = 60000;
const MATCH_REROLL_WAIT_TIME = 15000;
const MAX_REROLL_COUNT = 2;
const MATCH_BAN_DEFAULT_TIME = 60000*15; // 15 Minutes
const GROUP_INACTIVE_TIME = 60000*60; // 1 heure

const AUTOBAN_AFK_WHILE_ACCEPT_BUTTON = "[AUTO] AFK pendant la confirmation de la partie";
const AUTOBAN_AFK_WHILE_PICK_BUTTON = "[AUTO] AFK pendant la selection des joueurs";

const EMBED_IMAGE_BANNER = "https://cdn.discordapp.com/attachments/580436332069781532/1040960236661526620/match_banner.png"
const EMBED_TITLE = "Match Ranked";
const EMBED_MATCH_INSTRUCTIONS_TITLE = "Instructions";
const EMBED_MATCH_INSTRUCTIONS_DESCRIPTION = `**1**. Invitez vous dans un groupe sur \`funcraft.net\` 
**2**. Allez dans le mode **MDT 5V5**
**3**. Jouez en respectant [les règles du serveur](https://docs.google.com/document/d/1b3t8eMU4YAYvysdwIrHaT6dWmsFvob06XCJ0IA_pcPI/) !`;
const EMBED_FIRST_TEAM_TITLE = "Team 1";
const EMBED_SECOND_TEAM_TITLE = "Team 2";

const MATCH_READY_TITLE = "**VOTRE MATCH EST PRÊT!**";
const MATCH_READY_RULE = "L'elo dodge ou jouer sous alt est bannissable"

exports.run = (async (client, oldMember, newMember) => {
    const config = client.config;
    var teams = client.teams;
    var teamInactiveDuration = GROUP_INACTIVE_TIME*(config.teamDuration || 1);

    if(config.queue == false || config.queue == "false") return;

    var statsFinder = client.statsFinder;
    if (statsFinder.config.ranked.guildID) DISCORD_ELO_SERVER_ID = statsFinder.config.ranked.guildID;
    if (statsFinder.config.ranked.channelID) DISCORD_ELO_CHANNEL_ID = statsFinder.config.ranked.channelID;
    if (statsFinder.config.ranked.parentID) DISCORD_ELO_CHANNEL_PARENT = statsFinder.config.ranked.parentID;
    if (statsFinder.config.ranked.privateLogChannelID) PRIVATE_LOG_CHANNEL_ID = statsFinder.config.ranked.privateLogChannelID;

    var oldChannel = oldMember.channel;
    var newChannel = newMember.channel;
    

    var guild = newMember.guild;
    if (oldChannel && newChannel && oldChannel.id == newChannel.id) return;

    if (!newChannel) return;

    var queue = client.queues.get(newChannel.id);

    if(!queue) return;

    REQUIRED_MEMBERS_COUNT = queue.slots || REQUIRED_MEMBERS_COUNT;
    CHANNEL_PREFIX = queue.channelPrefix || CHANNEL_PREFIX;

    var newQueue = queue.newQueue ?? config.newQueue ?? true;
    var reroll = queue.reroll ?? config.reroll ?? true;

    var teamsSizes = queue.teamsSizes instanceof Array ? queue.teamsSizes : [1, 2, 5];

    client.connectedTime.set(newMember.id, Date.now());

    var members = newChannel.members;
    console.log(`${members.size}/${REQUIRED_MEMBERS_COUNT}`)
    if (members.size < REQUIRED_MEMBERS_COUNT) return;
    if (client.delays.channels && client.delays.channels[newChannel.id]) return;
    client.delays.setDelay({
        channel: newChannel.id
    }, true);

    var i;
    var sfUser;
    var sfUsers = [];
    var tPlayer;
    var tPlayers = [];
    var tempMember;
    var membersJSON = members.toJSON();

    // For all voice channels in the guild, add to membersJSON 

    // Sort members by connected time
    membersJSON.sort((a, b) => {
        var aConnectedTime = client.connectedTime.get(a.id) || 0;
        var bConnectedTime = client.connectedTime.get(b.id) || 0;

        var aTeam = teams.getByPlayer(a.id);
        var bTeam = teams.getByPlayer(b.id);

        if(aTeam && bTeam) {
            var aLeader = aTeam.isLeader(a.id);
            var bLeader = bTeam.isLeader(b.id);

            if(aLeader && !bLeader) return -1;
            if(!aLeader && bLeader) return 1;
        }

        
        if (aTeam && !bTeam) return -1;
        if (bTeam && !aTeam) return 1; 

        if (aConnectedTime < bConnectedTime) {
            return -1;
        }
        if (aConnectedTime > bConnectedTime) {
            return 1;
        }  
        return 0;
    });

    var isPlaying;
    var isBanned;
    var team;
    var tournament = await statsFinder.tournaments.fetch(queue.tournament ?? "unranked");
    var teamCount = 0;

    for (i = 0; i < membersJSON.length; i++) {

        tempMember = membersJSON[i];
        team = teams.getByPlayer(tempMember.id);
        
        if(!team || team.size() == 1 || team.sinceLastUpdate() > teamInactiveDuration) {
            if(team) {
                var disbandReason = team.size() == 1 ? "Team is only one player" : "Team has been inactive for too long";
                team.disband(disbandReason);
            }
            if(!teamsSizes.includes(1)) {
                console.log(`${tempMember.displayName} isn't in a team and cannot queue`);
                continue;
            }
        }
        else {
            team.updateTime();
            if(teamCount == 2 && !sfUsers.find(u => u.id == team.leader)) {
                console.log(`${tempMember.user.username} team cannot join queue because there are already 2 teams`)
                continue;
            }
            if(!teamsSizes.includes(team.size())) {
                console.log(`${tempMember.user.username} team doesn't fit the queue size (team of ${team.size()} for ${teamsSizes.join("/")})`)
                continue;
            }
            /*
            if(team.size() + membersJSON.length - i + sfUsers.length > REQUIRED_MEMBERS_COUNT) {
                console.log(team.size() + membersJSON.length - i + sfUsers.length);
                console.log(`${tempMember.user.username} team is too big (team of ${team.size()} for ${teamsSizes.join("/")})`)
                continue;
            }*/

            var connectedTeam = membersJSON.filter(m => {var mTeam = teams.getByPlayer(m.id); if(mTeam && team.id == mTeam.id) return m;});
            if(connectedTeam.length != team.size()) {
                console.log(`${tempMember.user.username} team is not fully connected  to the queue channel (${connectedTeam.length}/${team.size()} connected))`);
                continue;
            }
            
            if(team.isLeader(tempMember.id)) teamCount++;
        }

        if(tempMember) sfUser = await statsFinder.getUser(tempMember.user.id);
        if (!sfUser) {
            console.log(tempMember.user.username + " is queing but is not registered");
            continue
        };
        isPlaying = await sfUser.isInMatch()
        if(tournament) {
            tPlayer = await tournament.fetchPlayer(sfUser)
            if(tPlayer) isBanned = tPlayer.isBanned
            else tPlayer = await tournament.createPlayer(sfUser);
            if(!tPlayer) {
                console.log("Unable to create a tournament profile for " + tempMember.user.username)
                continue;
            }
        }
        if(client.delays.users[tempMember.id]) {
            console.log(tempMember.user.username + " is queing but is in delay");
            continue
        };
        if (isPlaying) {
            console.log(tempMember.user.username + " is queing but is already in a match");
            continue
        };
        if (isBanned) {
            console.log(tempMember.user.username + " is queing but is banned from the tournament");
            continue
        };

        if (sfUser) sfUsers.push(sfUser);
        if (tPlayer) tPlayers.push(tPlayer);

        // Avoid useless loops
        if (membersJSON.length - i + sfUsers.length < REQUIRED_MEMBERS_COUNT) break;
        if (REQUIRED_MEMBERS_COUNT == sfUsers.length) break;
    };
    
    if (sfUsers.length != REQUIRED_MEMBERS_COUNT) {
        console.log(`Not enough members in queue ${sfUsers.length}/${REQUIRED_MEMBERS_COUNT}`)
        return client.delays.setDelay({
            channel: newChannel.id
        }, false)
    };

    const matchID = await statsFinder.matchs.getUniqueID();
    var logChannel = await guild.channels.fetch(PRIVATE_LOG_CHANNEL_ID).catch(() => {});

    if(teamCount == 2) [newQueue, reroll] = [false, false];

    var matchPlayer;
    var team;
    var teamColor;

    var textChannelPermissions = [{
        id: guild.id,
        deny: "VIEW_CHANNEL"
    }];

    sfUsers.forEach(sfUser => {
        textChannelPermissions.push({
            id: sfUser.id,
            allow: "VIEW_CHANNEL"
        })
    })

    var textChannel = await guild.channels.create(`${CHANNEL_PREFIX}-${matchID}`, {
        type: "GUILD_TEXT",
        parent: DISCORD_ELO_CHANNEL_PARENT,
        permissionOverwrites: textChannelPermissions
    });

    var firstTeamVoiceChannel = await guild.channels.create(`Match ${matchID}`, {
        type: "GUILD_VOICE",
        parent: DISCORD_ELO_CHANNEL_PARENT
    });

    var tempMemberDS;
    await textChannel.setRateLimitPerUser(5);
    for (const tempMember of sfUsers) {
        tempMemberDS = await members.get(tempMember.id);
        if (tempMemberDS.voice) await tempMemberDS.voice.setChannel(firstTeamVoiceChannel).catch(() => {})
    }

    var superMention = sfUsers.map(u => "<@" + u.id + ">").join(", ");
    superMention = superMention + `\n\n🔊 <#${firstTeamVoiceChannel.id}>`;

    sfUsers = shuffle(sfUsers);
    sfUsers.forEach(u => {client.delays.setDelay({ user: u.id }, true)});

    client.delays.setDelay({
        channel: newChannel.id
    }, false);

    var buttonID = matchID + "accept"
    var button = new MessageButton()
        .setCustomId(buttonID)
        .setLabel('ACCEPTER')
        .setStyle('SUCCESS')

    var embed = new MessageEmbed()
        .setTitle(MATCH_READY_TITLE)
        .setColor("#43b581")
        .setFooter(MATCH_READY_RULE)

    var row = new MessageActionRow().addComponents(button);

    msgData = {
        content: superMention,
        embeds: [embed],
        components: [row]
    };

    if(config.matchConfirmation != false) {
        var buttonReply = await CustomButtonCollector({
            channel: textChannel,
            clickedMessage: "**({{list}}/{{maxList}})** {{@user}} a accepté le match !",
            time: MATCH_CONFIRMATION_WAIT_TIME,
            list: sfUsers,
            message: msgData,
            customId: buttonID
        })
    
        var interactionReply = buttonReply.interaction;
    
        if (!interactionReply) {
            sfUsers.forEach(u => {client.delays.setDelay({ user: u.id }, false)})
            buttonReply.notAquired.forEach(u => banPlayer(client, tournament, u, MATCH_BAN_DEFAULT_TIME, AUTOBAN_AFK_WHILE_ACCEPT_BUTTON))
            var notAquired = buttonReply.notAquired.map(u => "<@" + u.id + ">").join(", ");
            textChannel.send("Match annulé, pas assez de joueurs on accepté le match\n" + notAquired);
            if(logChannel) logChannel.send(`\`${matchID}\` - Non accepté par ${notAquired}`);
            return deleteMatchChannels(client, { textChannel: textChannel.id, firstTeamVoiceChannel: firstTeamVoiceChannel.id, time: 10000});
        };
    }

    
    
    var wasPicked = false;
    var rerollAmount = 0;
    while (!wasPicked) {
        
        
        var leaders = {};
        var matchPlayers = [];
        var picks = [];
        var ii = 0;
        var preTeam;

        // Mettre en priorité les joueurs dans un groupe
        // Puis organiser par l'elo

        // Put in notTeamUsers all users not in a group
        
        if(rerollAmount == 0) {
                
            var noTeamUsers = [];
            var teamUsers = new Map();
            
            sfUsers.forEach(u => {
                var team = teams.getByPlayer(u.id);
                if(!team) noTeamUsers.push(u);
                else {
                    if(!teamUsers.has(team.id)) teamUsers.set(team.id, []);
                    teamUsers.get(team.id).push(u);
                }
            })

            for(var [id, team] of teamUsers.entries()) {
            
                team.sort((a,b) => {
                    var aScore = tPlayers.find(p => p.id == a.id);
                    var bScore = tPlayers.find(p => p.id == b.id);
                    return (aScore ? aScore.score : 0) - (bScore ? bScore.score : 0);
                })
                teamUsers.set(id, team);
            }
            
            if(newQueue) noTeamUsers.sort((a, b) => {
                var aTPlayer = tPlayers.find(p => p.id == a.id);
                var bTPlayer = tPlayers.find(p => p.id == b.id);
                var score = (bTPlayer ? bTPlayer.score : 0) - (tPlayer ? tPlayer.score : 0);
                
                            
                var aKills = aTPlayer.kills || 0;
                var aDeaths = aTPlayer.deaths || 0;
                var aRatio = (aKills/(aDeaths || 1));

                var bKills = bTPlayer.kills || 0;
                var bDeaths = bTPlayer.deaths || 0;
                var bRatio = (bKills/(bDeaths || 1));

                if(config.ratioSort) {
                    if(aRatio != bRatio) {
                        return aRatio < bRatio ? 1 : -1;
                    }
                }

                if(score == 0) {
                    return Math.floor(Math.random() * 2) ? 1 : -1;
                }
                return score;
    
            });
            else noTeamUsers = shuffle(noTeamUsers)
        }
        

        var playerNumber = 0;
        var teamNumber = 0;

        for(var [id, team] of teamUsers.entries()) {
            for(let i = 0; i < team.length; i++) {
                tempMember = team[i];
                teamColor = teamNumber % 2 == 0 ? FIRST_TEAM_NAME : SECOND_TEAM_NAME;
                matchPlayer = {
                    id: tempMember.id,
                    username: tempMember.username,
                    minecraft: tempMember.link.minecraft,
                    funcraft: tempMember.link.funcraft,
                    number: playerNumber,
                    eloWon: undefined,
                    matchResult: undefined,
                    kd: {
                        kills: 0,
                        deaths: 0
                    },
                    team: teamColor,
                    leader: false
                };
                if (i == 0 && teamNumber < 2) {
                    matchPlayer.leader = true;
                    leaders[teamColor] = matchPlayer;
                }
                matchPlayers.push(matchPlayer);
                playerNumber++;
            }
            teamNumber++;
        }

        for (i = 0; i < noTeamUsers.length; i++) {
            
            tempMember = noTeamUsers[i];
            teamColor = matchPlayers.filter(p => p.team == FIRST_TEAM_NAME) == 0 || matchPlayers.filter(p => p.team == FIRST_TEAM_NAME).length  < matchPlayers.filter(p => p.team == SECOND_TEAM_NAME).length ? FIRST_TEAM_NAME : SECOND_TEAM_NAME;
            
            matchPlayer = {
                id: tempMember.id,
                username: tempMember.username,
                minecraft: tempMember.link.minecraft,
                funcraft: tempMember.link.funcraft,
                number: playerNumber,
                eloWon: undefined,
                matchResult: undefined,
                kd: {
                    kills: 0,
                    deaths: 0
                },
                team: teamColor,
                leader: false
            };
            playerNumber++;
            
            if ((i == 0 || i == 1) && !leaders[teamColor]) {
                matchPlayer.leader = true;
                leaders[teamColor] = matchPlayer;
            } else {
                delete matchPlayer.team;
                picks.push(matchPlayer);
            }
            
            matchPlayers.push(matchPlayer);
        }
    
        // var leaders = matchPlayers.filter(p => p.leader);
        var firstLeader = leaders[FIRST_TEAM_NAME];
        var secondLeader = leaders[SECOND_TEAM_NAME];
    
        textChannel.send(`**${firstLeader.minecraft}** et **${secondLeader.minecraft}** sont leaders de la partie.`);


        if(!wasPicked && rerollAmount < MAX_REROLL_COUNT && reroll == true && REQUIRED_MEMBERS_COUNT > 2) {
            buttonID = matchID + "reroll";
            button = new MessageButton()
            .setCustomId(buttonID)
            .setLabel('REROLL')
            .setStyle('DANGER')
            var row = new MessageActionRow().addComponents(button);
            msgData = {
                content: `(${MATCH_REROLL_WAIT_TIME/1000}s) Reroll les leaders ?`,
                components: [row]
            }

            var buttonReply = await CustomButtonCollector({
                channel: textChannel,
                clickedMessage: "**({{list}}/{{maxList}})** {{@user}} souhaite reroll !",
                time: MATCH_REROLL_WAIT_TIME,
                list: sfUsers,
                message: msgData,
                customId: buttonID,
                numRequired: REQUIRED_MEMBERS_COUNT > 6 ? 6 : REQUIRED_MEMBERS_COUNT / 2 
            })

            interactionReply = buttonReply.interaction;
            if(!interactionReply) {
                await textChannel.send("Pas de reroll !");
                wasPicked = true;
            }
            else {
                await textChannel.send("Reroll !");

                //matchPlayers = [];
                i=0;

                noTeamUsers.push(noTeamUsers.splice(0, 1)[0]);
                noTeamUsers.push(noTeamUsers.splice(0, 1)[0]);
                // Move leaders to the end of the array

                rerollAmount++;
            }
        }
        else wasPicked = true;
    }

    

    var leaderNum;
    var currentLeader;
    var otherLeader;
    var filledTeam;
    var filledTeam2;
    i = 0;
    
    var lastPick = false;
    if(picks.length > 2 && queue.slots > 4) lastPick = true;

    if(picks.length == 0) {
        await textChannel.send(`Aucun joueur supplémentaire detecté, lancement de la partie`);
    }




















    else if(newQueue) {
        while (picks.length > 1 && !filledTeam) {
            i++;
            leaderNum = i % 2 == 0 ? 0 : 1;
            //FIXME : Le double pick devrait pas avoir lieu (voir salon 6bc944c4)
            // if(lastPick && picks.length == 2) leaderNum = leaderNum == 1 ? 0 : 1;
            var leaderColor = leaderNum == 0 ? FIRST_TEAM_NAME : SECOND_TEAM_NAME;
            var otherLeaderColor = leaderNum == 0 ? SECOND_TEAM_NAME : FIRST_TEAM_NAME;
            currentLeader = leaders[leaderColor];
            otherLeader = leaders[otherLeaderColor];
    
            var options = [];
    
            picks.forEach((p) => {
                if(options.length == 2) return;
                var statsPreview = tournament ? "Nouveau joueur !" : undefined;
                var emoji = "🎶";
                var tPlayer = tPlayers.find(tPlayer => tPlayer.id == p.id);
                if(tPlayer && tPlayer.rank) {
                    var rank = tPlayer.rank.rankName;
                            
                    var kills = tPlayer.kills || 0;
                    var deaths = tPlayer.deaths || 0;
                    var wins = tPlayer.wins || 0;
                    var matchs = tPlayer.matchs || 0;
                    // var ratio = (kills/(deaths || 1)).toFixed(2);
                    var winrate = (wins/(matchs || 1)*100).toFixed(1);
                    if(matchs) {
                        if(rank) emoji = newMember.guild.emojis.cache.find(emoji => emoji.name.toLowerCase() === rank.toLowerCase());
                        statsPreview = `${kills}/${deaths} KD - ${winrate}%`;
                    }
                }
                return options.push({
                    label: p.minecraft,
                    value: p.id,
                    description: statsPreview,
                    emoji: emoji
                })
            })
    
            
            buttonID = matchID + "picks";
    
            button = new MessageSelectMenu().setCustomId(buttonID).addOptions(options).setPlaceholder(`🌟 Joueurs à selectionner`);
    
            var row = new MessageActionRow().addComponents(button);
            msgData = {
                content: `<@${currentLeader.id}>, choisis un joueur`,
                components: [row]
            }
    
            buttonReply = await CustomButtonCollector({
                channel: textChannel,
                time: MATCH_PICK_WAIT_TIME,
                list: [currentLeader],
                message: msgData,
                customId: buttonID,
                deleteAfter: true
            });
    
            var interactionReply = buttonReply.filteredInteraction;
    
            if (!interactionReply || !interactionReply.values) {
                sfUsers.forEach(u => {client.delays.setDelay({ user: u.id }, false);});
                banPlayer(client, tournament, currentLeader, MATCH_BAN_DEFAULT_TIME, AUTOBAN_AFK_WHILE_PICK_BUTTON)
                textChannel.send(`Match annulé, <@${currentLeader.id}> n'a pas choisi de joueur`);
                if(logChannel) logChannel.send(`\`${matchID}\` - Annulé par inactivité de <@${currentLeader.id}>`);
                return deleteMatchChannels(client, { textChannel: textChannel.id, firstTeamVoiceChannel: firstTeamVoiceChannel.id, time: 10000});
            }
    
            var selectedPlayer = picks.find(p => p.id == interactionReply.values[0]);
            var notSelectedPlayer = picks.find(p => p.id == interactionReply.component.options.filter(o => o.value != interactionReply.values[0])[0].value);
            if (!selectedPlayer || !notSelectedPlayer) {
                sfUsers.forEach(u => {client.delays.setDelay({ user: u.id }, false)});
                textChannel.send(`Problème inconnu, annulement du match`);
                if(logChannel) logChannel.send(`\`${matchID}\` - Bug lors de la selection de joueur de <@${currentLeader.id}>`);
                return deleteMatchChannels(client, { textChannel: textChannel.id, firstTeamVoiceChannel: firstTeamVoiceChannel.id, time: 10000});
            };
    
            await textChannel.send(`**${currentLeader.minecraft}** a choisi **${selectedPlayer.minecraft}**\n**${notSelectedPlayer.minecraft}** rejoint donc l'équipe de **${otherLeader.minecraft}**`);
            picks.splice(picks.indexOf(selectedPlayer), 1);
            picks.splice(picks.indexOf(notSelectedPlayer), 1);
    
            matchPlayers[selectedPlayer.number].team = currentLeader.team;
            matchPlayers[notSelectedPlayer.number].team = otherLeader.team;

            // If team has half of the players, fill the other team
            filledTeam = matchPlayers.filter(p => p.team == FIRST_TEAM_NAME);
            filledTeam2 = matchPlayers.filter(p => p.team == SECOND_TEAM_NAME);
            filledTeam = filledTeam.length >= filledTeam2.length ? filledTeam : filledTeam2;

            if(filledTeam.length >= (REQUIRED_MEMBERS_COUNT / 2).toFixed()) {
                await textChannel.send(`Une équipe est déjà complète, lancement de la partie`);
            }
            else filledTeam = false;
        }
    }


    else while (picks.length > 1 && !filledTeam) {
        i++;
        leaderNum = matchPlayers.filter(p => p.team == FIRST_TEAM_NAME).length < matchPlayers.filter(p => p.team == SECOND_TEAM_NAME).length ? FIRST_TEAM_NAME : SECOND_TEAM_NAME;
        if(lastPick && picks.length == 2) leaderNum = leaderNum == 1 ? FIRST_TEAM_NAME : SECOND_TEAM_NAME;
        currentLeader = leaders[leaderNum];

        var options = [];

        picks.forEach((p) => {
            var statsPreview = tournament ? "Nouveau joueur !" : undefined;
            var emoji = "🎶";
            var tPlayer = tPlayers.find(tPlayer => tPlayer.id == p.id);
            if(tPlayer && tPlayer.rank) {
                var rank = tPlayer.rank.rankName;
                        
                var kills = tPlayer.kills || 0;
                var deaths = tPlayer.deaths || 0;
                var wins = tPlayer.wins || 0;
                var matchs = tPlayer.matchs || 0;
                // var ratio = (kills/(deaths || 1)).toFixed(2);
                var winrate = (wins/(matchs || 1)*100).toFixed(1);
                if(matchs) {
                    if(rank) emoji = newMember.guild.emojis.cache.find(emoji => emoji.name.toLowerCase() === rank.toLowerCase());
                    statsPreview = `${kills}/${deaths} KD - ${winrate}%`;
                }
            }
            return options.push({
                label: p.minecraft,
                value: p.id,
                description: statsPreview,
                emoji: emoji
            })
        })
        
        buttonID = matchID + "picks";

        button = new MessageSelectMenu().setCustomId(buttonID).addOptions(options).setPlaceholder(`🌟 Joueurs à selectionner`);

        var row = new MessageActionRow().addComponents(button);
        msgData = {
            content: `<@${currentLeader.id}>, choisis un joueur`,
            components: [row]
        }

        buttonReply = await CustomButtonCollector({
            channel: textChannel,
            time: MATCH_PICK_WAIT_TIME,
            list: [currentLeader],
            message: msgData,
            customId: buttonID,
            deleteAfter: true
        });

        var interactionReply = buttonReply.filteredInteraction;

        if (!interactionReply || !interactionReply.values) {
            sfUsers.forEach(u => {client.delays.setDelay({ user: u.id }, false);});
            banPlayer(client, tournament, currentLeader, MATCH_BAN_DEFAULT_TIME, AUTOBAN_AFK_WHILE_PICK_BUTTON)
            textChannel.send(`Match annulé, <@${currentLeader.id}> n'a pas choisi de joueur`);
            if(logChannel) logChannel.send(`\`${matchID}\` - Annulé par inactivité de <@${currentLeader.id}>`);
            return deleteMatchChannels(client, { textChannel: textChannel.id, firstTeamVoiceChannel: firstTeamVoiceChannel.id, time: 10000});
        }

        var selectedPlayer = picks.find(p => p.id == interactionReply.values[0]);
        if (!selectedPlayer) {
            sfUsers.forEach(u => {client.delays.setDelay({ user: u.id }, false)});
            textChannel.send(`Problème inconnu, annulement du match`);
            if(logChannel) logChannel.send(`\`${matchID}\` - Bug lors de la selection de joueur de <@${currentLeader.id}>`);
            return deleteMatchChannels(client, { textChannel: textChannel.id, firstTeamVoiceChannel: firstTeamVoiceChannel.id, time: 10000});
        };

        await textChannel.send(`**${currentLeader.minecraft}** a choisi **${selectedPlayer.minecraft}**`);
        picks.splice(picks.indexOf(selectedPlayer), 1);

        matchPlayers[selectedPlayer.number].team = currentLeader.team;

        
        filledTeam = matchPlayers.filter(p => p.team == FIRST_TEAM_NAME);
        filledTeam2 = matchPlayers.filter(p => p.team == SECOND_TEAM_NAME);
        filledTeam = filledTeam.length >= filledTeam2.length ? filledTeam : filledTeam2;

        if(filledTeam.length >= (REQUIRED_MEMBERS_COUNT / 2).toFixed()) {
            await textChannel.send(`Une équipe est déjà complète, lancement de la partie`);
        }
        else filledTeam = false;
    }















    

    if(picks.length > 1) {
        for(var pick of picks) {
            leaderNum = matchPlayers.filter(p => p.team == FIRST_TEAM_NAME).length < matchPlayers.filter(p => p.team == SECOND_TEAM_NAME).length ? FIRST_TEAM_NAME : SECOND_TEAM_NAME;
            var defaultLeader = leaders[leaderNum];
            matchPlayers[pick.number].team = defaultLeader.team;
            await textChannel.send(`**${pick.minecraft}** rejoint la team de **${defaultLeader.minecraft}**`);
            picks.shift();
        }
    }

    if (picks.length == 1) {
        console.log(matchPlayers.filter(p => p.team == FIRST_TEAM_NAME).length)
        console.log(matchPlayers.filter(p => p.team == SECOND_TEAM_NAME).length)
        leaderNum = matchPlayers.filter(p => p.team == FIRST_TEAM_NAME).length  < matchPlayers.filter(p => p.team == SECOND_TEAM_NAME).length ? FIRST_TEAM_NAME : SECOND_TEAM_NAME;
        var defaultLeader = leaders[leaderNum];
        matchPlayers[picks[0].number].team = defaultLeader.team;
        textChannel.send(`**${picks[0].minecraft}** est le seul joueur restant, il est donc dans la team de **${defaultLeader.minecraft}**`);
    }

    var firstTeamVoicePermissions = [{id: guild.id,deny: "CONNECT"}];
    var secondTeamVoicePermissions = [{id: guild.id,deny: "CONNECT"}];

    for (i in matchPlayers) {
        tempMember = matchPlayers[i];
        if (tempMember.team == FIRST_TEAM_NAME) firstTeamVoicePermissions.push({
            id: tempMember.id,
            allow: "CONNECT"
        });
        else if (tempMember.team == SECOND_TEAM_NAME) secondTeamVoicePermissions.push({
            id: tempMember.id,
            allow: "CONNECT"
        });
    };

    await firstTeamVoiceChannel.edit({
        permissionOverwrites: firstTeamVoicePermissions,
        name: `Team ${firstLeader.minecraft}`
    });

    var secondTeamVoiceChannel = await guild.channels.create(`Team ${secondLeader.minecraft}`, {
        type: "GUILD_VOICE",
        parent: DISCORD_ELO_CHANNEL_PARENT,
        permissionOverwrites: secondTeamVoicePermissions
    });

    for (const tempMember of matchPlayers) {
        tempMemberDS = await members.get(tempMember.id);
        if (!tempMemberDS.voice) continue;
        if (tempMember.team == SECOND_TEAM_NAME) await tempMemberDS.voice.setChannel(secondTeamVoiceChannel).catch(() => {});
    }

    var superMentionFirstTeam = "";
    var superMentionSecondTeam = "";
    for (const tempMember of matchPlayers) {
        if (tempMember.team == FIRST_TEAM_NAME) superMentionFirstTeam += `<@${tempMember.id}> ${tempMember.leader ? "**(Leader)**" : ""}\n `;
        else if (tempMember.team == SECOND_TEAM_NAME) superMentionSecondTeam += `<@${tempMember.id}> ${tempMember.leader ? "**(Leader)**" : ""}\n`;
    };

    var embed = new Discord.MessageEmbed()
        .setAuthor(queue.name || EMBED_TITLE)
        .addField(EMBED_FIRST_TEAM_TITLE, superMentionFirstTeam, true)
        .addField(EMBED_SECOND_TEAM_TITLE, superMentionSecondTeam, true)
        .addField(EMBED_MATCH_INSTRUCTIONS_TITLE, EMBED_MATCH_INSTRUCTIONS_DESCRIPTION)
        .setColor(client.embedColor)
        .setImage(EMBED_IMAGE_BANNER)
        .setFooter(`ID ${matchID}`)

    if (logChannel) logChannel.send(`\`${matchID}\` - Match lancé`)

    if(config.noMatch) {
        sfUsers.forEach(u => {client.delays.setDelay({ user: u.id }, false)});
        return await textChannel.send({embeds: [embed]})
    }

    await statsFinder.matchs.create({
        tournament: tournament ? tournament.id : undefined,
        id: matchID,
        gamemode: queue.gamemode,
        misc: {
            textChannel: textChannel.id,
            startVoiceChannel: undefined,
            firstTeamVoiceChannel: firstTeamVoiceChannel.id,
            secondTeamVoiceChannel: secondTeamVoiceChannel.id,
        },
        players: matchPlayers
    })
    await textChannel.send({
        embeds: [embed]
    });
    
    sfUsers.forEach(u => {client.delays.setDelay({ user: u.id }, false)});
    
    console.log(matchID + " - Starting Elo Match");
});
