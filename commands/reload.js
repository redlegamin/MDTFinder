const RELOAD_DONE = "Reload done!";
const RELOAD_FAILED = "Reload failed!";
const RELOAD_IN_PROGRESS = "Reloading...";

exports.run = async (client, message, args, tools) => {
    console.log(RELOAD_IN_PROGRESS);
    await client.reload(client);
    console.log(RELOAD_DONE);
    message.reply(RELOAD_DONE);
}

exports.slash = {
    "name": "reload",
    "description": "Recharge le bot"
}