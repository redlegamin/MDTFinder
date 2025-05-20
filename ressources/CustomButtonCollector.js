 module.exports = async function CustomCollector (options = { time : 5000, deleteAfter : false}) {

    var channel = options.channel;
    var list = options.list;
    var deleteAfter = options.deleteAfter;
    var time = options.time;
    var clickedMessage = options.clickedMessage;
    var message = options.message;
    if(!channel) throw new Error("Channel is required");
    if(!message) throw new Error("Message is required");
    if(!message.components) throw new Error("Message components is required");
    
    var customId = options.customId;
    const filter = i => i.customId == id;
    const _options = { ...options, max: 1 };
    var filteredInteraction = [];

    var listAquired = [];
    var numRequired = options.numRequired ? options.numRequired : list ? list.length : undefined;

    return new Promise(async (resolve, reject) => {
        var msg = await channel.send(message);
        const collector = channel.createMessageComponentCollector(filter, time);
        collector.on('collect', async i => {
            if (!customId || i.customId === customId) {
                
                if(list) {
                    if(list.find(u => u.id == i.user.id) && !listAquired.find(u => u.id == i.user.id)) {
                        filteredInteraction.push(i);
                        console.log(i.user.id + " clicked")
                        listAquired.push(i.user);
                        if(clickedMessage) {
                            var tempMessage = clickedMessage;
                            tempMessage=tempMessage.replaceAll("{{@user}}", i.user);
                            tempMessage=tempMessage.replaceAll("{{user}}", i.user.username);
                            tempMessage=tempMessage.replaceAll("{{list}}", listAquired.length);
                            tempMessage=tempMessage.replaceAll("{{maxList}}", numRequired);
                            await msg.channel.send(tempMessage).catch(() => {});
                            i.deferUpdate().catch(() => {});
                        }
                        else i.deferUpdate().catch(() => {});
                    }
                    else i.deferUpdate().catch(() => {});
                    if(listAquired.length < numRequired) return;
                    collector.stop();
                }
                else i.deferUpdate().catch(() => {});
                
            }
        });

        collector.on('end', (interactions, reason) => {
            var interaction = interactions.first();
            filteredInteraction = filteredInteraction[0]
            if(!list) {
                resolve({interaction: interaction});
            }
            else {
                var notAquired = list.filter(u => !listAquired.find(u2 => u2.id == u.id));
                if(listAquired.length < numRequired) resolve({filteredInteraction: filteredInteraction, listAquired: listAquired, notAquired: notAquired});
                else resolve({filteredInteraction: filteredInteraction, interaction: interaction, listAquired: listAquired, notAquired: notAquired});
            }
            if(deleteAfter) msg.delete().catch(() => {});
        
        });

        setTimeout(() => {
            collector.stop();
        }, time);

    })
}
