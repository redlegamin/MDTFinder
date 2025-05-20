module.exports = async function hook(client, channel, title, message, color = "d9a744", avatar) {
    if (!client) throw new Error("client is undefined");
    if (!channel) throw ("Channel not specified.");
    if (!title) throw ("Title not specified.");
    if (!message) throw ("Message not specified.");
    let webhookName = "mdtfinderWebhook"
    if (!avatar) avatar = "https://media.discordapp.net/attachments/580436332069781532/915206305189347328/dNfxB36vjoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAF74BxxWqaOpfzVhAAAAAElFTkSuQmCC.png";
    var webhookAvatar = "https://cdn.discordapp.com/attachments/405780210265620480/890496053722349638/Capture.PNG";

    color = color.replace(/\s/g, "");
    avatar = avatar.replace(/\s/g, "");

    if (typeof channel == "string") channel = await client.channels.fetch(channel)
    return channel.fetchWebhooks()
        .then(webhook => {
            let foundHook = webhook.find(name => name.name == webhookName);
            if (!foundHook) {
                return channel
                    .createWebhook(
                        webhookName,
                        { avatar: webhookAvatar }
                    )
                    .then(webhook => {
                        return webhook
                            .send({
                                content: message,
                                username: title,
                                avatarURL: avatar
                            })
                            .catch(error => {
                                console.log(error);
                                return channel.send(
                                    "**Something went wrong when sending the webhook.**"
                                );
                            });
                    });
            } else {
                return foundHook
                    .send({
                        content: message,
                        username: title,
                        avatarURL: avatar
                    })
                    .catch(error => {
                        console.log(error);
                        return channel.send(
                            "**Something went wrong when sending the webhook.**"
                        );
                    });
            }
        });
}