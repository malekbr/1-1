
/**
 * Creates a new Pairing object.
 * This class specifies a pairing. It allows to check if a pairing is valid given other pairings
 * (no two pairings can contain the same person). It also counts the number of times this pairing
 * has been chosen, and how many teams allow it. Updates the database at every change.
 * @param id the id of the pairing
 * @param pairedPerson1
 * @param pairedPerson2 must have a strictly higher id than pairedPerson1
 * @param mPairingCount number of time this 1+1 has been used
 * @param mTeamCount number of teams using it
 * @param database the database
 */
function Pairing(pairingId, pairedPerson1, pairedPerson2, mPairingCount, mTeamCount, database){
	if(pairedPerson1.id >= pairedPerson2.id){
		throw {message: "pairing ids should be in increasing order"};
	}
	var that = this;
	var person1 = pairedPerson1,
		person2 = pairedPerson2;
	var db = database;
	var id = pairingId;
	var pairingCount = mPairingCount;
	var teamCount = mTeamCount;
	
	var pairingCountUpdateStatementPrepare = function(pairingCount,id){
		return db.prepare("UPDATE pairing SET pairing_count = ? WHERE id = ?",pairingCount,id, function(err){
			if(err !== null){
				console.log(err);
				throw {message: "Unable to update pairing "+id};
			}
		});
	};
	
	var teamCountUpdateStatementPrepare = function(teamCount,id){
		return db.prepare("UPDATE pairing SET team_count = ? WHERE id = ?",teamCount,id, function(err){
			if(err !== null){
				console.log(err);
				throw {message: "Unable to update pairing "+id};
			}
		});
	};
	
	this.incrementPairingCount = function(){
		pairingCount++;
		db.schedule(pairingCountUpdateStatementPrepare(pairingCount, id));
	};
	
	this.getPairingCount = function(){
		return pairingCount;
	};
	
	this.incrementTeamCount = function(){
		teamCount++;
		db.schedule(teamCountUpdateStatementPrepare(teamCount, id));
	};
	
	
	/**
	 * Throws an exception if the team count is 0
	 */
	this.decrementTeamCount = function(){
		if(teamCount === 0){
			throw {message: "Team count is 0"};
		}
		teamCount--;
		db.schedule(teamCountUpdateStatementPrepare(teamCount, id));
	};
	
	/**
	 * Checks if pairing is available given other people chosen in other pairings
	 * @param peopleAlreadyPicked an associative array where every key is 
	 *        an id of a person already chosen.
	 * @return boolean True if pairing is available. False otherwise.
	 */
	this.isAvailable = function(peopleAlreadyPicked){
		return !(person1.getId() in peopleAlreadyPicked || person2.getId() in peopleAlreadyPicked);
	};
	
	/**
	 * Adds pairing to people already picked
	 * @param peopleAlreadyPicked an associative array where every key is 
	 *        an id of a person already chosen.
	 */
	this.pickPeople = function(peopleAlreadyPicked){
		peopleAlreadyPicked[person1.getId()] = true;
		peopleAlreadyPicked[person2.getId()] = true;
	};
	
	/**
	 * Checks if there exists a team that contains both people.
	 * @return boolean True if pairing is valid. False otherwise.
	 */
	this.isValidPairing = function(){
		return teamCount > 0;
	};
	
	/**
	 * @return int the id of the pairing
	 */
	this.getId = function(){
		return id;
	};
	
	/**
	 * @return Person the object representing person1
	 */
	this.getPerson1 = function(){
		return person1;
	};
	
	/**
	 * @return Person the object representing person2
	 */
	this.getPerson2 = function(){
		return person2;
	};
}

/**
 * Keeps track of the ids and generates the next id (separation between id and database for speed and sync reasons)
 * @returns {Number} the next id
 */
Pairing.max_id = 0;
Pairing.generateId = function(){
	Pairing.max_id++;
	return Pairing.max_id;
};

/**
 * Creates a new pairing and puts it in the database
 * @param email email of the person. Needs to be unique (case insensitive).
 * @param db the database
 * @param callback function to call after creation of the person, takes the person
 * @return Pairing the pairing
 */
Pairing.generate = function(person1, person2, db){
	if(person1.getId()>= person2.getId()){
		throw {message: "Ids not in increasing order"};
	}
	var pairing = new Pairing(Pairing.generateId(), person1, person2, 0, 0, db);
	var statement = db.prepare("INSERT INTO pairing(id, person1_id,person2_id,pairing_count,team_count) VALUES(?,?,?,0,0)", pairing.getId(), person1.getId(), person2.getId(), function(err){
		if(err !== null){
			console.log(err);
			throw {message: "Unable to establish a connection between "+person1.getEmail()+" and "+person2.getEmail()};
		}
	});
	db.schedule(statement);
	return pairing;
};

module.exports = Pairing;