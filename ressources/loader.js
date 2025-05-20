
const fs = require("fs")
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config()
const rest = new REST({ version: '9' }).setToken(process.env.BOT_DISCORD_TOKEN);


module.exports = function loader() {
    const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
    const commandFiles = fs
      .readdirSync("./commands")
      .filter(file => file.endsWith(".js"));
      
    this.commandsDelay = new Map();
    var commandsSlash = [];
      for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        var commandName = file.split(".")[0]
        this.commandsDelay.set(commandName, new Map());
        if(typeof command.slash == "object") commandsSlash.push(command.slash);
      }

    this.config = config;
    this.PREFIX = config.prefix;

    this.queues = new Map();
    const queues = JSON.parse(fs.readFileSync("./queues.json", "utf8"));
    var queue;

    for (queue of queues) {
        console.log(`Loading queue ${queue.name} (#${queue.channelID})`)
        this.queues.set(queue.channelID, queue)
    }

    this.embedColor = config.embedColor ? config.embedColor : "#ffffff";

    if(this.readyAt != null) {
        this.user.setActivity(
            config.game, {
              type: (this.config && this.config.gameCode) ? this.config.gameCode : 5
            }
        );
        (async () => {
            try {
              console.log('Started refreshing application (/) commands.');
                await rest.put(
                    Routes.applicationCommands(this.application.id),
                    { body: commandsSlash },
                  );
              console.log('Successfully reloaded application (/) commands.');
            } catch (error) {
              console.error(error);
            }
          })();
    }
}