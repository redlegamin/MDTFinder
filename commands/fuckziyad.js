exports.run = async (client, message, args, tools) => {
  client.teams._reset();
  message.channel.send("Teams reset!");
}