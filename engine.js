
/**
 * Creates a new Engine object (a singleton).
 * This class is the engine that runs the application. It initiates the database, coordinates
 * between different entities. It also creates a pairing map.
 */
function Engine(){
	var that = this;
	// TODO : implement singleton : Engine.static_variable
	// TODO : load database
	var db = null;
	// TODO : load teams
	var teams = [];
	// TODO : load people
	var people = [];
	// TODO : generate pairings
	var pairingMap = [];
	
	/**
	 * Loads a file to the database.
	 * The file needs to have lines that are either of the form
	 *   team team-name
	 * which adds a team to the database called team-name or
	 *   add email team-name
	 * which adds the email to the team.
	 * The file is case insensitive.
	 * @param filename the path to the file to load
	 */
	this.loadFile = function(filename){
		throw "Not implemented yet";
	};
	
	/**
	 * adds a team called teamName to the database
	 * @param teamName a string
	 */
	this.addTeam = function(teamName){
		throw "Not implemented yet";
	};
	
	/**
	 * @param personName a string
	 * @param teamName a string
	 */
	this.addPersonToTeam = function(personName, teamName){
		throw "Not implemented yet";
	};
	
	/**
	 * removes a team from the database
	 * @param teamName needs to be in the database
	 */
	this.removeTeam = function(teamName){
		throw "Not implemented yet";
	};
	
	/**
	 * @param personName a string
	 * @param teamName a string
	 */
	this.removePersonFromTeam = function(personName, teamName){
		throw "Not implemented yet";
	};
	
	/**
	 * @param personName a string
	 */
	this.removePersonFromAllTeams = function(personName){
		throw "Not implemented yet";
	};
	
	/**
	 * Displays all the teams with their members
	 */
	this.listOrganization = function(){
		throw "Not implemented yet";
	};
	
	/**
	 * Generates the current pairings to a file or to the console
	 * @param filename if provided the pairings are written to the file, else to the console
	 */
	this.generatePairing = function(filename){
		throw "Not implemented yet";
	};
	
	/**
	 * Close the engine
	 */
	this.close = function(filename){
		throw "Not implemented yet";
	};
	
	throw "Not implemented yet";
}

module.exports = Engine;