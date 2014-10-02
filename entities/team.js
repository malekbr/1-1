/**
 * Creates a new Team object.
 * This class specifies a team, and keeps track of its members. Updates the database at every change.
 * @param teamId
 * @param teamName name of the team. Needs to be unique (case insensitive).
 * @param pairingMap the map of pairings
 * @param database the database
 */
function Team(teamId, teamName, pairingMap, database){
	var that = this;
	var name = teamName;
	var pairings = pairingMap;
	var db = database;
	var id = teamId;
	var members = [];
	
	/**
	 * Empties the team : removes all the members and updates pairings affected.
	 */
	this.empty = function(){
		var membersCopy = members.slice(0);
		for(var member in membersCopy){
			this.remove(member);
		}
	};
	
	
	/**
	 * Adds a person to the team as a member without updating pairings.
	 * @param member a Person object, element to add to the team.
	 */
	this.addLoad = function(member){
		if(member in members){
			return;
		}
		member.addTeam(this);
		members.push(member);
	};
	
	/**
	 * Adds a person to the team as a member and updates pairings affected.
	 * @param member a Person object, element to add to the team.
	 */
	this.add = function(member){
		if(members.indexOf(member)>-1){
			return;
		}
		for(var otherMemberIndex in members){
			var otherMember = members[otherMemberIndex];
			if(otherMember.getId()<member.getId()){
				pairingMap[otherMember.getId()][member.getId()].incrementTeamCount();
			}else if(otherMember.getId()>member.getId()){
				pairingMap[member.getId()][otherMember.getId()].incrementTeamCount();
			}
		}
		members.push(member);
		member.addTeam(this);
		var statement = db.prepare("INSERT INTO team_person_connection(team_id, person_id) VALUES(?, ?)", id, member.getId(), function(err){
			if(err !== null){
				console.log(err);
				throw {message: "Unable to add team "+name};
			}
			
		});
		db.schedule(statement);
	};
	
	/**
	 * Removes a person from the member list and updates the member and pairings affected.
	 * @param member a Person object, element to remove to the team.
	 */
	this.remove = function(member){
		var index = members.indexOf(member);
		if(index < 0){
			throw {message: "member does not exist in team"};
		}
		for(var otherMemberIndex in members){
			var otherMember = members[otherMemberIndex];
			if(otherMember.getId()<member.getId()){
				pairingMap[otherMember.getId()][member.getId()].decrementTeamCount();
			}else if(otherMember.getId()>member.getId()){
				pairingMap[member.getId()][otherMember.getId()].decrementTeamCount();
			}
		}
		members.splice(index, 1); //remove member
		member.removeTeam(that);
		var statement = db.prepare("DELETE FROM team_person_connection WHERE team_id=? AND person_id=?", id, member.getId(), function(err){
			if(err !== null){
				console.log(err);
				throw {message: "Unable to remove member "+member.getEmail()+" from team "+name};
			}
			
		});
		db.schedule(statement);
	};
	
	/**
	 * @return returns a list of the team members.
	 */
	this.list = function(){
		return members.slice(0); // Defensive copying
	};
	
	/**
	 * @return the id of the team
	 */
	this.getId = function(){
		return id;
	};
	
	/**
	 * @return the name of the team
	 */
	this.getName = function(){
		return name;
	};
}

/**
* Keeps track of the ids and generates the next id (separation between id and database for speed and sync reasons)
* @returns {Number} the next id
*/
Team.max_id = 0;
Team.generateId = function(){
	Team.max_id++;
	return Team.max_id;
};

/**
 * Creates a new team and puts it in the database
 * @param name name of the team. Needs to be unique (case insensitive).
 * @param pairingMap
 * @param db the database
 * @param callback function to call after creation of the team, takes the team
 */
Team.generate = function(name, pairingMap, db){
	var team = new Team(Team.generateId(), name, pairingMap, db);
	var statement = db.prepare("INSERT INTO team(id, name) VALUES(?, ?)", team.getId(), name, function(err){
		if(err !== null){
			console.log(err);
			throw {message: "Unable to add team "+name};
		}
	});
	db.schedule(statement);
	return team;
};
module.exports = Team;