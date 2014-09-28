/**
 * Creates a new Team object.
 * This class specifies a team, and keeps track of its members. Updates the database at every change.
 * @param teamName name of the team. Needs to be unique (case insensitive).
 * @param pairingMap the map of pairings
 * @param database the database
 */
function Team(teamName, pairingMap, database){
	var that = this;
	var name = teamName;
	var pairings = pairingMap;
	var db = database;
	// TODO : set id based on database
	var id = 0;
	// TODO : update member list
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
	 * Renames the team.
	 * @param name the new name of the team. Needs to be a unique name (case insensitive).
	 */
	this.rename = function(name){
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
	 * @return the id of the person
	 */
	this.getId = function(){
		return id;
	};
	
	throw "Not implemented yet";
}

module.exports = Team;