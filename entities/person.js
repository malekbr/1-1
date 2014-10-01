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
		throw {message: "Invalid email "+personEmail};
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
		if(teams.indexOf(team)>-1){
			teams.push(teams);
		}
	};
	
	/**
	 * Checks if a person is in a team.
	 * @param team a Team object.
	 */
	this.inTeam = function(team){
		return team in teams;
	};
	
	/**
	 * Remove team from team list.
	 * @param team a Team object.
	 */
	this.removeTeam = function(team){
		var index = teams.indexOf(team);
		if(index < 0){
			throw {message: "team does not exist"};
		}
		teams.splice(index, 1);
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
 * Keeps track of the ids and generates the next id (separation between id and database for speed and sync reasons)
 * @returns {Number} the next id
 */
Person.max_id = 0;
Person.generateId = function(){
	Person.max_id++;
	return Person.max_id;
};

/**
 * Creates a new team and puts it in the database
 * @param email email of the person. Needs to be unique (case insensitive).
 * @param pairingMap, modified
 * @param peopleList, not modified
 * @param db the database
 * @param callback function to call after creation of the person, takes the person
 */
Person.generate = function(email, pairingMap, peopleList, db){
	var person = new Person(Person.generateId(), email);
	var statement = db.prepare("INSERT INTO person(id, email) VALUES(?, ?)", person.getId(), email, function(err){
		if(err !== null){
			console.log(err);
			throw {message: "Unable to add person "+email};
		}
	});
	// create a pairing to every other person (not necessarily available)
	pairingMap[person.getId()] = [];
	for(var otherPersonIndex in peopleList){
		var otherPerson = peopleList[otherPersonIndex];
		if (otherPerson.getId() < person.getId()){
			pairingMap[otherPerson.getId()][person.getId()]=
				Pairing.generate(otherPerson, person, db);
		}else{
			pairingMap[person.getId()][otherPerson.getId()]=
				Pairing.generate(otherPerson, person, db);
		}
	}
	db.schedule(statement);
	return person;
};

module.exports = Person;