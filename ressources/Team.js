const LocalStorage = require("node-localstorage").LocalStorage;
const localStorage = new LocalStorage('./scratch');
const UUID = require("uuid")

class Team {
    constructor(client, teamData) {  
        this.client = client;
        this.leader = teamData.leader || teamData.players[0];
        this.players = teamData.players || [];
        this.queue = teamData.queue;
        this.queuing = false;
        this.manager = client.teams;
        this.id = teamData.id || UUID.v4();
        this.lastUpdate = teamData.lastUpdate || Date.now();
    }

    isLeader(player) {
        if(player.id) player = player.id;
        return this.leader == player;
    } 

    size() {
        return this.players.length;
    }

    addPlayer(player) {
        if(player.id) player = player.id;
        if(this.getPlayer(player)) return false;
        this.players.push(player);
    }

    removePlayer(player) {
        this.players = this.players.filter(p => p != player);
    }

    getPlayer(player) {
        if(player.id) player = player.id;
        return this.players.find(p => p == player);
    }

    disband(reason) {
        console.log(`Team ${this.id} has been disband${reason ? ` (${reason})` : ""}`)
        return this.manager.remove(this);
    }

    queue() {
        this.queuing = true;
    }

    unqueue() {
        this.queuing = false;
    }

    updateTime() {
        return this.lastUpdate = Date.now();
    }

    sinceLastUpdate() {
        return Date.now () - this.lastUpdate;
    }

}

module.exports = Team;