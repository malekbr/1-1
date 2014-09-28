
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
		throw "pairing ids should be in increasing order";
	}
	var that = this;
	var person1 = pairedPerson1,
		person2 = pairedPerson2;
	var db = database;
	var id = pairingId;
	var pairingCount = mPairingCount;
	var teamCount = mTeamCount;
	
	var pairingCountUpdateStatement = db.prepare("UPDATE team SET pairing_count = ? WHERE id = ?", function(err, data){
		if(err === null){
			throw "Unable to update pairing "+id;
		}
	});
	
	var teamCountUpdateStatement = db.prepare("UPDATE team SET team_count = ? WHERE id = ?", function(err, data){
		if(err === null){
			throw "Unable to update pairing "+id;
		}
	});
	
	this.incrementPairingCount = function(){
		pairingCount++;
		db.serialize(function(){
			pairingCountUpdateStatement.run([pairingCount, id]);
		});
	};
	
	this.getPairingCount = function(){
		return pairingCount;
	};
	
	this.incrementTeamCount = function(){
		teamCount++;
		db.serialize(function(){
			teamCountUpdateStatement.run([teamCount, id]);
		});
	};
	
	
	/**
	 * Throws an exception if the team count is 0
	 */
	this.decrementTeamCount = function(){
		if(teamCount === 0){
			throw "Team count is 0";
		}
		teamCount--;
		db.serialize(function(){
			teamCountUpdateStatement.run([teamCount, id]);
		});
	};
	
	/**
	 * Checks if pairing is available given other people chosen in other pairings
	 * @param peopleAlreadyPicked an associative array where every key is 
	 *        an id of a person already chosen.
	 * @return True if pairing is available. False otherwise.
	 */
	this.isAvailable = function(peopleAlreadyPicked){
		return peopleAlreadyPicked[person1.getId()] === undefined && peopleAlreadyPicked[person1.getId()] === undefined;
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
}

/**
 * Creates a new pairing and puts it in the database
 * @param email email of the person. Needs to be unique (case insensitive).
 * @param db the database
 * @param callback function to call after creation of the person, takes the person
 */
Pairing.generate = function(person1, person2, db, callback){
	if(person1.getId()>= person2.getId()){
		throw "Ids not in increasing order";
	}
	db.serialize(function(){
		var statement = db.prepare("INSERT INTO pairing(person1_id,person2_id,pairing_count,team_count) VALUES(?,?,0,0)", [person1.getId(), person2.getId()], function(err, data){
			if(err === null){
				throw "Unable to establish a connection between "+person1.getEmail()+" and "+person2.getEmail();
			}
			var pairing = new Pairing(data.lastID, person1, person2, 0, 0, db);
			callback(pairing);
		});
		statement.run();
	});
};

module.exports = Pairing;