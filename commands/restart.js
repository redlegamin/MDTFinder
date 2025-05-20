exports.run = async (client, message, args, tools) => {
  await message.channel.send("<a:Chargement:433610655023759360> Redémarrage du bot en cours (ce message ne se supprimera pas)")
  await client.user.setActivity(
    "Redémarrage du bot en cours"
  );
  process.exit(0)
}
