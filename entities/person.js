/**
 * Creates a new Person object.
 * This class specifies a person. Updates the database at every change.
 * @param personEmail email of the person. Needs to be a valid email and be unique (case insensitive).
 * @param database the database
 */
function Person(personEmail, database){
	var that = this;
	var email = personEmail;
	var db = database;
	// TODO : set id based on database
	var id = 0;
	// TODO : update team list
	var teams = [];
	
	/**
	 * removes the person from all the teams.
	 */
	this.removeFromAllTeams = function(){
		// TODO
		throw "Not implemented yet";
	};
	
	
	/**
	 * Adds team to team list.
	 * @param team a Team object.
	 */
	this.addTeam = function(team){
		// TODO
		throw "Not implemented yet";
	};
	
	/**
	 * Changes the email of the person.
	 * @param name the new email of the person. Needs to be a valid email and be unique (case insensitive).
	 */
	this.changeEmail = function(email){
		// TODO
		throw "Not implemented yet";
	};
	
	/**
	 * @return returns a list of the teams of which this person is a member.
	 */
	this.listTeams = function(){
		return teams.slice(0); // Defensive copying
	};
	
	/**
	 * @return the id of the person
	 */
	this.getId = function(){
		return id;
	};
	
	/**
	 * @param email a string
	 * @return True if the email is valid. False otherwise.
	 */
	function isValidEmail(email){
		
	}
	
	throw "Not implemented yet";
}

module.exports = Person;