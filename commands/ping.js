exports.run = async (client, message, args, tools) => {
  const m = await message.reply("Pinging...");
  m.edit(
    `⌛**MDTFinder** ${m.createdTimestamp -
      message.createdTimestamp}ms\n💗**Discord** ${Math.round(client.ping)}ms`
  );
}

exports.slash = {
  "name": "ping",
  "description": "Affiche le ping du bot"
}