const SUCCESSFULLY_REGISTERED =
  "Tu as bien synchronisé ton compte Minecraft avec ton compte Discord : ";
const CODE_TIMEOUT_TIME = 600000; // 10 minutes avant de supprimer le code
const CODE_TIMED_OUT = "Le code est expiré, veuillez recommencer .register";
const USER_MINECRAFT_ALREADY_LINKED =
  "Ce compte Minecraft est déjà lié à un Discord";
const USER_MINECRAFT_ALREADY_LINKED_TOOL =
  "Essaye de te `.register` a nouveau avec un autre compte Minecraft";
const UPDATE_INFORMATION_TIP =
  "N'hésite pas à faire `.update` sur le Roster Ranked pour mettre à jour ton compte.";

const updateEloGuild = require("../ressources/updateEloGuild");
var DISCORD_ELO_SERVER_ID = "1039895288992772126";

exports.run = async (client, message) => {
  var statsFinder = client.statsFinder;
  if (statsFinder.config.ranked.guildID)
    DISCORD_ELO_SERVER_ID = client.config.ranked.guildID;
  var code = client.findCode(message.args[4]);

  if (!code) return;

  var user = await client.users.fetch(code.id);

  // console.log(user)

  if (!user) return; // ??????? Impssobble que ca arrive noramlement suaf si

  client.removeCode(code);

  if (new Date() - code.time > 600000)
    return user.createDM().then((dm) => {
      dm.send(CODE_TIMED_OUT + message.author);
    });

  // Create the user in StatsFinder

  var sfUser = await client.statsFinder.users.create({
    user: user,
    minecraft: message.author,
  });

  if (!sfUser) {
    return user.createDM().then((dm) => {
      dm.send(
        `${USER_MINECRAFT_ALREADY_LINKED} \`\`\`${message.author}\`\`\`${USER_MINECRAFT_ALREADY_LINKED_TOOL}`
      );
    });
  }

  updateEloGuild(client, DISCORD_ELO_SERVER_ID, user.id).catch((err) =>
    console.log(err)
  );

  user.createDM().then((dm) => {
    dm.send(
      `${SUCCESSFULLY_REGISTERED} \`\`\`${message.author}\`\`\`${UPDATE_INFORMATION_TIP}`
    );
  });
};
