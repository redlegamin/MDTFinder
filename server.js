const config = require("./config");
const reload = require("./ressources/loader");
const prefix = require("./config.json").prefix;

const randomCode = require("./ressources/randomCode");
const StatsFinder = require("./StatsFinderV2/");
const statsFinder = new StatsFinder.Client(config);
const teamManager = require("./ressources/TeamManager");
const isAdmin = require("./ressources/isAdmin");
const Discord = require("discord.js");
const client = statsFinder.discord;
const teams = new teamManager(client);

client.reload = reload;
client.reload();
client.isAdmin = isAdmin;
client.connectedTime = new Map();
client.lastSlashCommandId;
client.lastCommandId;
client.statsFinder = statsFinder;
client.teams = teams;
client.teams._load();

if (client.config.autoUnban == true)
  client.autoBan = require("./ressources/autoUnban")(client);
const delays = class delays {
  constructor() {
    this.channels = new Object();
    this.users = new Object();
  }
  setDelay(discordID, delay) {
    if (discordID.channel) this.channels[discordID.channel] = delay;
    else if (discordID.user) this.users[discordID.user] = delay;
    else throw new Error("discordID is not a channel or a user");
    if (delay) console.log("Delaying " + (discordID.channel || discordID.user));
    else console.log("Un-delaying " + (discordID.channel || discordID.user));
  }
};
client.delays = new delays();
client.codes = new Map();

client.newCode = function (user) {
  var id;
  if (user.id) id = user.id;
  else id = user;
  code = randomCode(6);
  var codeData = {
    code: code,
    id: id,
    date: Date.now(),
  };

  client.codes.set(code.toLowerCase(), codeData);
  return codeData;
};

client.removeCode = function (code) {
  return client.codes.delete(code);
};

client.findCode = (potentialCode) => {
  return client.codes.get(potentialCode.toLowerCase());
};

client.delay = function (user, command, time) {
  if (user.id) user = user.id;
  if (!time) client.commandsDelay.get(command).delete(user);
  client.commandsDelay.get(command).set(user, Date.now() + time);
};

client.isDelaied = function (user, command) {
  if (user.id) user = user.id;

  if (!client.commandsDelay.has(command))
    client.commandsDelay.set(command, new Map());
  if (client.commandsDelay.get(command).has(user)) {
    if (client.commandsDelay.get(command).get(user) > Date.now()) return true;
    else {
      client.delay(user, command, null);
      return false;
    }
  }
  return false;
};

client.isWhitelisted = function (user, command) {
  if (user.id) user = user.id;

  var commandData = client.config.commands.find((c) => c.name == command);
  if (!commandData) return false;
  if (commandData.whitelist) return commandData.whitelist.includes(user);
  return false;
};

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.reload(client);
});

client.on("guildMemberAdd", (member) => {
  try {
    let commandFile = require(`./events/persistBan.js`);
    commandFile.run(client, member);
  } catch (e) {
    console.log(e.message);
  }
});

statsFinder.on("DMMessage", (message) => {
  try {
    let commandFile = require(`./events/codeHandler.js`);
    commandFile.run(client, message);
  } catch (e) {
    console.log(e.message);
  }

  if (message.author.toLowerCase() != "redlegamin") return;
  var player = message.bot.mcbot.players[message.author];
  if (!player) return;
  message.bot.follow(message.author);
});

statsFinder.on("GroupeMessage", (message) => {
  console.log(message);
  var args = message.args;
  var command = args[2];
  if (!args[3]) return;
  if (command.includes("&say")) {
    var messageSay = args.slice(3).join(" ");
    message.bot.chat(messageSay);
  }
});

statsFinder.on("groupeInvite", async (groupeInvite) => {
  return;
  console.log(await groupeInvite.accept("redlegamin"));
});

statsFinder.on("groupeJoigned", async (groupe) => {
  return;
  var game = await statsFinder.bot.gTp().catch(() => {});
  var players = game.mcbot.players;
  game = game.mcbot.game;
  groupe.leave();
  if (game.dimension.includes("end")) {
    console.log("Playing rush gamemode");
  } else console.log("Playing unknown gamemode");
  console.log(players);
  var player;
  var color;
  var matchPlayers = [];
  var teamCode;

  var teams = {
    red: "red",
    dark_aqua: "blue",
    light_purple: "red",
    gold: "blue",
    white: "red",
    dark_gray: "blue",
  };
  var i = 0;
  var ii = 0;
  setTimeout(async () => {
    for (i in players) {
      player = players[i];
      color = player.displayName.extra[1];
      if (!color) continue;
      color = color.color;
      if (!color) continue;
      teamCode = teams[color];
      if (!teamCode) continue;
      matchPlayers.push({
        id: undefined,
        username: player.username,
        minecraft: player.player,
        funcraft: undefined,
        number: ii,
        eloWon: undefined,
        matchResult: undefined,
        kd: {
          kills: 0,
          deaths: 0,
        },
        team: teamCode,
        leader: ii == 0 || ii == 1 ? true : false,
      });
      ii++;
    }

    await statsFinder.matchs.create({
      tournament: "rush_ranked",
      misc: {},
      players: matchPlayers,
    });
    statsFinder.bot.hub();
  }, 5000);
});

statsFinder.on("matchEnded", (message) => {
  try {
    let commandFile = require(`./events/gameEnd.js`);
    commandFile.run(client, message);
  } catch (e) {
    console.log(e.message);
  }
});

client.on("voiceStateUpdate", async (oldMember, newMember) => {
  try {
    let commandFile = require(`./events/rankedHandler.js`);
    commandFile.run(client, oldMember, newMember);
  } catch (e) {
    console.log(e.message);
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Discord API is fucked
  if (client.lastCommandId == message.id) return;
  client.lastCommandId = message.id;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  var command = args.shift().toLowerCase();

  if (!message.content.startsWith(prefix)) return;

  var config = client.config;
  var alias = config.commands.find((c) => {
    if (c.alias && c.alias.includes(command)) return c;
  });
  if (alias) command = alias.name;
  var commandData = config.commands.find((c) => c.name == command);

  if (commandData) {
    if (
      !client.isAdmin(message.author) &&
      client.commandsDelay.has(commandData.name)
    ) {
      if (client.isDelaied(message.author, commandData.name)) {
        message.channel.send(
          "Merci de patienter " +
            (client.commandsDelay.get(commandData.name).get(message.author.id) -
              Date.now()) /
              1000 +
            "sec"
        );
        return;
      }
    }
    var whitelisted = false;
    if (commandData.whitelist) {
      if (commandData.whitelist.includes(message.author.id)) whitelisted = true;
    }

    if (commandData.admin && !client.isAdmin(message.author) && !whitelisted)
      return message.channel.send(
        "Cette commande est réservée aux administrateurs"
      );
    if (commandData.disable && !client.isAdmin(message.author) && !whitelisted)
      return message.channel.send(
        "Cette commande est temporairement désactivée"
      );
    if (commandData.admin)
      message.channel.send(
        "`(Commande admin-only" +
          (whitelisted ? " (whitelist bypass)" : "") +
          ")`"
      );
    if (commandData.disable)
      message.channel.send(
        "`(Commande désactivée" +
          (whitelisted ? " (whitelist bypass)" : "") +
          ")`"
      );
  } else return;
  var found = true;
  try {
    if (
      client.config.hotload == true &&
      require.cache[require.resolve(`./commands/${command}.js`)]
    )
      delete require.cache[require.resolve(`./commands/${command}.js`)];
    let commandFile = require(`./commands/${command}.js`);

    if (commandFile.data && commandFile.data.commands == false) return;

    if (commandFile.data && commandFile.data.syntaxe) {
      //var someone = message.guild.roles.cache.find(role => role.name === "someone");
      //if(!someone) someone = "@someone";
      syntaxe = commandFile.data.syntaxe; //.replace(/\@someone/g, `<@&${someone.id}>`);
      var syntaxe = `\`\`\`${client.PREFIX}${syntaxe}\`\`\``;
    }

    commandFile.run(client, message, args, {
      syntaxe: syntaxe || "Syntaxe incorrecte",
    });
  } catch (e) {
    console.log(e);
    found = false;
  }
  if (found) {
    var channel;
    var channelID = commandData.logs || "477997254834257943";
    channel = await client.channels.fetch(channelID);
    if (!channel) return;
    var embedlog = new Discord.MessageEmbed()
      .setAuthor(`[${message.guild.name}] ${message.author.tag} .${command}`)
      .setDescription(message.content)
      .setFooter(`[${message.guild.id}] ${message.author.id}`)
      .setColor(0x2f3136);
    channel
      .send({
        embeds: [embedlog],
      })
      .catch(() => {});
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (client.lastSlashCommandId == interaction.id) return;
  client.lastSlashCommandId = interaction.id;

  interaction.syntax = function (syntax, interaction) {
    //var someone = interaction.guild.roles.cache.find(role => role.name === "someone");
    if (!someone) someone = "```@someone```";
    //syntax = syntax.replace(/\@someone/g, `<@&${someone.id}>`);
    var syntaxe = `\`\`\`/${syntaxe}\`\`\``;
    return syntaxe;
  };
  var command = interaction.commandName;
  var channel = await client.channels.fetch(interaction.channelId);
  var member = interaction.member;
  var user = member.user;
  var args = [];
  console.log(`${user.tag} used /${command}`);

  if (interaction.user.bot) return;
  var config = client.config;
  var alias = config.commands.find((c) => {
    if (c.alias && c.alias.includes(command)) return c;
  });
  if (alias) command = alias.name;
  var commandData = config.commands.find((c) => c.name == command);
  if (commandData) {
    if (
      !client.isAdmin(interaction.user) &&
      client.commandsDelay.has(commandData.name)
    ) {
      if (client.isDelaied(interaction.user, commandData.name)) {
        interaction.reply(
          "Merci de patienter " +
            (client.commandsDelay
              .get(commandData.name)
              .get(interaction.user.id) -
              Date.now()) /
              1000 +
            "sec"
        );
        return;
      }
    }

    var whitelisted = false;
    if (commandData.whitelist) {
      if (commandData.whitelist.includes(member.id)) whitelisted = true;
    }

    if (commandData.admin && !client.isAdmin(member) && !whitelisted)
      return interaction
        .reply("Cette commande est réservée aux administrateurs")
        .catch(() => {});
    if (commandData.disable && !client.isAdmin(member) && !whitelisted)
      return interaction
        .reply("Cette commande est temporairement désactivée")
        .catch(() => {});
    if (commandData.admin)
      channel.send(
        "`(Commande admin-only" +
          (whitelisted ? " (whitelist bypass)" : "") +
          ")`"
      );
    if (commandData.disable)
      channel.send(
        "`(Commande désactivée" +
          (whitelisted ? " (whitelist bypass)" : "") +
          ")`"
      );
  } else return;
  var found = true;

  try {
    if (
      client.config.hotload == true &&
      require.cache[require.resolve(`./commands/${command}.js`)]
    )
      delete require.cache[require.resolve(`./commands/${command}.js`)];
    let commandFile = require(`./commands/${command}.js`);
    var data;
    if (typeof commandFile.data == "object") data = commandFile.data;
    if (data && data.reply == false) await interaction.reply("_ _");
    else
      await interaction.deferReply({
        ephemeral: data ? data.ephemeral : undefined,
      });
    interaction.reply = interaction.editReply;
    interaction.author = interaction.user;
    commandFile.run(client, interaction, args, { isInteraction: true });
  } catch (e) {
    console.log(e.message);
  }

  if (found) {
    var channel;
    var channelID = commandData.logs || "477997254834257943";

    channel = await client.channels.fetch(channelID);
    if (!channel) return;
    var embedlog = new Discord.MessageEmbed()
      .setAuthor(
        `[${interaction.guild.name}] ${interaction.user.tag} /${command}`
      )
      .setDescription("/" + interaction.commandName)
      .setFooter(`[${interaction.guild.id}] ${interaction.user.id}`)
      .setColor(0x2f3136);
    channel
      .send({
        embeds: [embedlog],
      })
      .catch(() => {});
  }
});

client.login(process.env.BOT_DISCORD_TOKEN);
