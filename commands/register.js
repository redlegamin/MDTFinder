const ALREADY_REGISTERED = "Tu es déjà enregistré !";
const REGISTER_ERROR = "Ntm ca t'as pas login";
const REGISTER_INFORMATIONS = "Check tes MP !";
const REGISTER_STEPS = "Connecte toi sur `funcraft.net` et réalise la commande suivante :";
const PRECOMMAND_HELPER = "/m MDTFinder"
const CANT_OPEN_PRIVATE_DM = "Je ne peux pas t'envoyer un message privé";
const ALREADY_HAVE_A_CODE = "Tu as déjà un code";

exports.run = async (client, message, args, tools) => {
    var statsFinder = client.statsFinder;
    var user = message.author;
    var member = message.member;
    var sfUser = await statsFinder.getUser(user.id);
    if(sfUser) return message.reply(ALREADY_REGISTERED);
    var previousCode = client.findCode(user.id);
    if(previousCode) client.removeCode(previousCode);  
    user.send(`${REGISTER_STEPS}`).then(dm => {
        var code = client.newCode(user.id); 
        user.send(`\`\`\`${PRECOMMAND_HELPER} ${code.code}\`\`\``);
    }).catch( err => {
        return message.reply(CANT_OPEN_PRIVATE_DM);
    });
    return message.reply(REGISTER_INFORMATIONS);
}
