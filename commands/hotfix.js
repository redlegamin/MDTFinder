var fs = require("fs");
exports.run = (client, message, args, tools) => {
    var config = client.config;
    
    if(!args[0]) {
      var keys = "";
      for (var key in config) {
        if (config.hasOwnProperty(key)) {
          if(typeof config[key] == "object") continue;
          keys = keys + `- ${key} (${typeof config[key]})\n`;
        }
      }
      return message.reply(`**Available Configs:**\n\`\`\`\n${keys}\n\`\`\``).catch(() => {message.reply("Too many configs to list!");});
    
    }
    var hf = `config.${args[0]}`
    var eva = eval(hf)
    var value = args.slice(1).join(" ");
    if(!args[1]) return message.channel.send("```> " + `config.${args[0]} = ${eva}` + "```")

    console.log(eva)

    if(/^\d+$/.test(value)) value = parseInt(value)

    value == "true" ? value = true : value == "false" ? value = false : undefined; 
    if(eva == undefined) return message.channel.send("`(ERROR) Unknown option`");
    else if(typeof eva != typeof value) return message.channel.send(`\`(ERROR) Value require ${typeof eva}\``)

    if(typeof eva == "object") return message.channel.send("`(ERROR) Cant change object`")
    value != "undefined" ? hf = hf + `= ${typeof value == "string ?" ? `"${value}"` : value}` : delete config[args[0]];
    if(value != "undefined") eval(hf)
    
    fs.readFile("./config.json", "utf8", function (err, data) {
      fs.writeFile("./config.json", JSON.stringify(config), function (
        err,
        result
      ) {
        if (err) return console.log("error", err);
        return message.channel.send("```\n> " + `config.${args[0]} = ${args.slice(1).join(" ")}`+"\n```")
      });
    });
  
    console.log(config)
}

exports.data = {
    syntaxe: "eval option value",
}