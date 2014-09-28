
/**
 * Creates a new Pairing object.
 * This class specifies a pairing. It allows to check if a pairing is valid given other pairings
 * (no two pairings can contain the same person). It also counts the number of times this pairing
 * has been chosen, and how many teams allow it. Updates the database at every change.
 * @param pairedPerson1
 * @param pairedPerson2 must have a strictly higher id than pairedPerson1
 * @param database the database
 */
function Pairing(pairedPerson1, pairedPerson2, database){
	if(pairedPerson1.id >= pairedPerson2.id){
		throw "pairing ids should be in increasing order";
	}
	var that = this;
	var person1 = pairedPerson1,
		person2 = pairedPerson2;
	var db = database;
	// TODO : set id based on database
	var id = 0;
	// TODO : set pairingCount based on database
	var pairingCount = 0;
	// TODO : update team count
	var teamCount = 0;
	
	this.incrementPairingCount = function(){
		pairingCount++;
		// TODO : update database
		throw "Not implemented yet";
	};
	
	this.getPairingCount = function(){
		return pairingCount;
		// TODO : update database
		throw "Not implemented yet";
	};
	
	this.incrementTeamCount = function(){
		teamCount++;
		// TODO : update database
		throw "Not implemented yet";
	};
	
	
	/**
	 * Throws an exception if the team count is 0
	 */
	this.decrementTeamCount = function(){
		if(teamCount === 0){
			throw "Team count is 0";
		}
		teamCount--;
		// TODO : update database
		throw "Not implemented yet";
	};
	
	/**
	 * Checks if pairing is available given other people chosen in other pairings
	 * @param peopleAlreadyPicked an associative array where every key is 
	 *        an id of a person already chosen.
	 * @return True if pairing is available. False otherwise.
	 */
	this.isAvailable = function(peopleAlreadyPicked){
		// TODO
		throw "Not implemented yet";
	};
	
	/**
	 * Checks if there exists a team that contains both people.
	 * @return True if pairing is valid. False otherwise.
	 */
	this.isAValidPairing = function(){
		return teamCount > 0;
	};
	
	/**
	 * @return the id of the pairing
	 */
	this.getId = function(){
		return id;
	};
	
	/**
	 * @return the object representing person1
	 */
	this.getPerson1 = function(){
		return person1;
	};
	
	/**
	 * @return the object representing person2
	 */
	this.getPerson2 = function(){
		return person2;
	};
	
	throw "Not implemented yet";
}

module.exports = Pairing;