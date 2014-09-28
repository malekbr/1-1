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
	 * Destroys the team : removes all the members and updates pairings affected.
	 */
	this.destroy = function(){
		// TODO
		throw "Not implemented yet";
	};
	
	
	/**
	 * Adds a person to the team as a member and updates pairings affected.
	 * @param member a Person object, element to add to the team.
	 */
	this.add = function(member){
		// TODO
		throw "Not implemented yet";
	};
	
	/**
	 * Removes a person from the member list and updates the member and pairings affected.
	 * @param member a Person object, element to remove to the team.
	 */
	this.remove = function(member){
		// TODO
		throw "Not implemented yet";
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
	
	throw "Not implemented yet";
}

/**
 * Creates a new team and puts it in the database
 * @param name name of the team. Needs to be unique (case insensitive).
 * @param pairingMap
 * @param db the database
 * @param callback function to call after creation of the team, takes the team
 */
Team.generate = function(name, pairingMap, db, callback){
	db.serialize(function(){
		var statement = db.prepare("INSERT INTO team(name) VALUES(?)", name, function(err, data){
			if(err === null){
				throw "Unable to add team "+name;
			}
			callback(new Team(data.lastID, name, pairingMap, db));
		});
	});
};
module.exports = Team;