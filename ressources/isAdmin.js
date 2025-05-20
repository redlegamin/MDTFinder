module.exports = function isAdmin(admin) {
    if(!admin) return false;
    if(admin.id) admin = admin.id;
    var admins = this.config.adminCommand;
    if(admins.includes(admin)) return true;
    return false;
}