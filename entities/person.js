var Pairing = require("./pairing");

/**
 * Creates a new Person object.
 * This class specifies a person. Updates the database at every change.
 * @param personId
 * @param personEmail email of the person. Needs to be a valid email and be unique (case insensitive).
 */

function Person(personId, personEmail){
	var that = this;
	
	/**
	 * @param email a string
	 * @return True if the email is valid. False otherwise.
	 */
	function isValidEmail(email){
		return (/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/).test(email);
	}
	
	
	personEmail = personEmail.trim();
	if(!isValidEmail(personEmail)){
		throw "Invalid email "+personEmail;
	}
	var email = personEmail;
	var id = personId;
	var teams = [];
	
	/**
	 * removes the person from all the teams.
	 */
	this.removeFromAllTeams = function(){
		var teamsCopy = this.listTeams(); // so that we can iterate over it without fear of change
		for(var team in teamsCopy){
			teamsCopy[team].remove(this);
		}
	};
	
	
	/**
	 * Adds team to team list.
	 * @param team a Team object.
	 */
	this.addTeam = function(team){
		if(!(team in teams)){
			teams.push(teams);
		}
	};
	
	/**
	 * @return returns a list of the teams of which this person is a member.
	 */
	this.listTeams = function(){
		// Defensive copying
		var result = [];
		for(var team in teams){
			result[team] = teams[team];
		}
		return result;
	};
	
	/**
	 * @return the id of the person
	 */
	this.getId = function(){
		return id;
	};
	
	/**
	 * @return the email of the person
	 */
	this.getEmail = function(){
		return email;
	};
}

/**
 * Creates a new team and puts it in the database
 * @param email email of the person. Needs to be unique (case insensitive).
 * @param db the database
 * @param callback function to call after creation of the person, takes the person
 */
Person.generate = function(email, pairingMap, db, callback){
	db.serialize(function(){
		var statement = db.prepare("INSERT INTO person(email) VALUES(?)", email, function(err, data){
			if(err === null){
				throw "Unable to add person "+email;
			}
			var person = new Person(data.lastID, email);
			// create a pairing to every other person
			var mappedPairingsForPerson = [];
			// callback when pairing created
			function makeCallback(list, id){
				return function(pairing){
					list[id] = pairing;
				};
			}
			for(var key in pairingMap){
				if (key < person.getId()){
					// TODO : change generate keys to Person objects
					Pairing.generate(key, person.getId(), db, makeCallback(pairingMap[key], person.getId()));
				}else{
					Pairing.generate(person.getId(), key, db, makeCallback(mappedPairingsForPerson, key));
				}
			}
			pairingMap[person.getId()] = mappedPairingsForPerson;
			//callback when everything loads
			db.serialize(function(){
				callback(person);
			});
		});
	});
	throw "Faulty implementation, fix todo";
};

module.exports = Person;