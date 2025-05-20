const Team = require("./Team");
var LocalStorage = require('node-localstorage').LocalStorage;
var localStorage = new LocalStorage('./ressources/localStorage');

class TeamManager {
    constructor(client) {
        this.client = client;
        this.teams = [];
    }

    create(teamData) {
        var team = new Team(this.client, teamData)
        this.teams.push(team);
        return team;
    }

    get(teamResolver) {
        if(teamResolver.id) teamResolver = teamResolver.id;
        return this.teams.find(team => team.id === teamResolver);
    }

    getByPlayer(playerResolver) {
        if(playerResolver.id) playerResolver = playerResolver.id;
        return this.teams.find(team => team.players.find(player => player === playerResolver));
    }

    remove(teamResolver) {
        if(teamResolver.id) teamResolver = teamResolver.id;
        var temp = this.teams.filter(team => team.id !== teamResolver );
        this.teams = temp
    }

    _load() {
        var data = JSON.parse(localStorage.getItem("teams"));
        if(data) {
            for(var tempTeam of data) {
                console.log("Reloading team " + tempTeam.id);
                this.create(tempTeam);
            }
        }
    }

    _reset() {
        this.teams = [];
        this._save();
    }
    
    _save() {
        var data = [];
        for(var tempTeam of this.teams) {
            data.push({
                id: tempTeam.id,
                leader: tempTeam.leader,
                players: tempTeam.players,
                queue: tempTeam.queue,
                queuing: tempTeam.queuing,
                lastUpdate: tempTeam.lastUpdate
            })
        }
        
        localStorage.setItem("teams", JSON.stringify(data));
    }

}

module.exports = TeamManager;