var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var Team = require('./entities/team');
var Person = require('./entities/person');
var Pairing = require('./entities/pairing');
var util = require('util');


/**
 * Generates a new Engine object (a singleton).
 * To generate one, call EngineGenerator.getInstance().
 * To kill the instance, call EngineGenerator.killInstance().
 * This class (Engine) is the engine that runs the application. It initiates the database, coordinates
 * between different entities. It also creates a pairing map.
 * @param callback function to callback when loading is finished
 */

var EngineGenerator = (function(){
	//wrapped for singleton purposes 
	var engine;
	
	function Engine(callback){
		// method : put every database sensitive operation in db.serialize because the plugin is asynchronous and that could cause some issues
		// TODO : look into copying database file and work on it and then when you close the database save on the older one to prevent data inconsistency
		var that = this;
		var databaseSchedule = [];
		/*
		 * Database name:
		 * data.db
		 * Tables :
		 * team :
		 * | id (unique, auto-increment) | name (unique, case insensitive) |
		 * person :
		 * | id (unique, auto-increment) | email (unique, case insensitive) |
		 * team_person_connection :
		 * | id (unique, auto-increment) | team_id | person_id |
		 * pairing :
		 * | id (unique, auto-increment) | person1_id | person2_id | pairing_count | team_count |
		 * 
		 */
		var db = new sqlite3.Database('./data.db');
		/**
		 * Schedules a timing statement for running in a queue when writing
		 * @param statement Statement a prepared statement from the database
		 */
		db.schedule = function(statement){
			databaseSchedule.push(statement);
		};
		/**
		 * Runs a function when all running serialize and currently running writings are over
		 * @param f Function the function to run
		 */
		db.runSynced = function(f){
			db.serialize(function(){
				db.run("",function(err){ // necessary hack
					f();
				});
			});
		};
		db.serialize(function() {
			db.exec("PRAGMA journal_mode=WAL"); // VERY IMPORTANT, PERFORMANCE PURPOSES
			db.run("CREATE TABLE IF NOT EXISTS team (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE COLLATE NOCASE)");
			db.run("CREATE TABLE IF NOT EXISTS person (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE COLLATE NOCASE)");
			db.run("CREATE TABLE IF NOT EXISTS team_person_connection (id INTEGER PRIMARY KEY AUTOINCREMENT, team_id INTEGER NOT NULL, person_id INTEGER NOT NULL)");
			db.run("CREATE TABLE IF NOT EXISTS pairing (id INTEGER PRIMARY KEY AUTOINCREMENT, person1_id INTEGER NOT NULL, person2_id INTEGER NOT NULL, pairing_count INTEGER NOT NULL, team_count INTEGER NOT NULL)");
		});
		var pairingMap = {};
		var teams = [];
		var teamsIndexedByNames = {};
		var people = [];
		var peopleIndexedByEmails = {};
		db.serialize(function(){
			// Loads teams
			db.each("SELECT * FROM team", function(err, row){
				teams[row.id] = new Team(row.id, row.name, pairingMap, db);
				if(Team.max_id < row.id ){
					Team.max_id = row.id;
				}
				teamsIndexedByNames[row.name.toLowerCase()] = teams[row.id];
			});
		});
		db.serialize(function(){
			// Loads people
			db.each("SELECT * FROM person", function(err, row){
				people[row.id] = new Person(row.id, row.email);
				if(Person.max_id < row.id ){
					Person.max_id = row.id;
				}
				peopleIndexedByEmails[row.email.toLowerCase()] = people[row.id];
			});
		});
		db.serialize(function(){
			// Assigns people to teams
			db.each("SELECT * FROM team_person_connection", function(err, row){
				teams[row.team_id].addLoad(people[row.person_id]);
			});
		});
		db.serialize(function(){
			// Generate pairings
			db.each("SELECT * FROM pairing", function(err, row){
				if(!(row.person1_id in pairingMap)){
					pairingMap[row.person1_id] = [];
				}
				pairingMap[row.person1_id][row.person2_id] = new Pairing(row.id, people[row.person1_id],
						people[row.person2_id], row.pairing_count, row.team_count, db);
				if(Pairing.max_id < row.id ){
					Pairing.max_id = row.id;
				}
			});
		});
		db.runSynced(function(){
			callback(that);
		});
		
		
		/**
		 * Loads a file to the database.
		 * The file needs to have lines that are either of the form
		 *   team team-name
		 * which adds a team to the database called team-name or
		 *   add email team-name
		 * which adds the email to the team.
		 * Empty lines are tolerated.
		 * The file is case insensitive.
		 * @param filename the path to the file to load
		 */
		this.loadFile = function(filename){
			var content = fs.readFileSync(filename).toString().split('\n');
			for(var line in content){
				line = content[line];
				var teamRegex = /^\s*team\s+(.+?)\s*$/i; // checks for team command
				var result;
				result = teamRegex.exec(line);
				if(result){ // this a command that adds a new team
					if(that.canAddTeam(result[1])){
						that.addTeam(result[1]);
					}
				}else{
					var addPersonRegex = /^\s*add\s+([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\s+(.+?)\s*$/i;
					result = addPersonRegex.exec(line);
					if(result){
						if(that.canAddPersonToTeam(result[1], result[2])){
							that.addPersonToTeam(result[1], result[2]);
						}
					}else if(!(/^\s*$/.test(line))){
						throw {message:"Invalid command : "+ line};
					}
				}
			}
		};
		
		/**
		 * adds a team called teamName to the database
		 * @param teamName a string
		 */
		this.addTeam = function(teamName){
			var team = Team.generate(teamName, pairingMap, db);
			teams[team.getId()] = team;
			teamsIndexedByNames[team.getName().toLowerCase()] = team;
		};
		
		/**
		 * @param personEmail a string
		 * @param teamName a string
		 */
		this.addPersonToTeam = function(personEmail, teamName){
			if(personEmail.toLowerCase() in peopleIndexedByEmails){
				teamsIndexedByNames[teamName.toLowerCase()].add(peopleIndexedByEmails[personEmail.toLowerCase()]);
			}else{
				var person = Person.generate(personEmail, pairingMap, people, db);
				people[person.getId()] = person;
				peopleIndexedByEmails[person.getEmail().toLowerCase()] = person;
				teamsIndexedByNames[teamName.toLowerCase()].add(person);
			}
		};
		
		/**
		 * Checks if you can add person to a team (team exists and person not part of it)
		 */
		this.canAddPersonToTeam = function(personEmail, teamName){
			personEmail = personEmail.toLowerCase();
			teamName = teamName.toLowerCase();
			return teamName in teamsIndexedByNames &&
				!((personEmail in peopleIndexedByEmails) && peopleIndexedByEmails[personEmail].inTeam(teamsIndexedByNames[teamName]));
		};
		
		/**
		 * Checks if team doesn't exists already
		 */
		this.canAddTeam = function(teamName){
			return !(teamName.toLowerCase() in teamsIndexedByNames);
		};
		
		/**
		 * removes all members from team
		 * @param teamName needs to be in the database
		 */
		this.emptyTeam = function(teamName){
			if(teamName.toLowerCase() in teamsIndexedByNames){
				var team = teamsIndexedByNames[teamName.toLowerCase()];
				team.empty();
			}else{
				throw {message: "Team "+teamName+" does not exist."};
			}
		};
		
		/**
		 * @param personEmail String
		 * @param teamName String
		 */
		this.removePersonFromTeam = function(personEmail, teamName){
			if(!(teamName.toLowerCase() in teamsIndexedByNames)){
				throw {message: "Team "+teamName+" does not exist."};
			}
			if(!(personEmail.toLowerCase() in peopleIndexedByEmails)){
				throw {message: "Person "+personEmail+" does not exist."};
			}
			teamsIndexedByNames[teamName.toLowerCase()].remove(peopleIndexedByEmails[personEmail.toLowerCase()]);
		};
		
		/**
		 * @param personEmail String
		 */
		this.removePersonFromAllTeams = function(personEmail){
			if(!(personEmail.toLowerCase() in peopleIndexedByEmails)){
				throw {message: "Person "+personEmail+" does not exist."};
			}
			peopleIndexedByEmails[personEmail.toLowerCase()].removeFromAllTeams();
		};
		
		/**
		 * Displays all the teams with their members
		 */
		this.listOrganization = function(){
			for(var teamIndex in teams){
				var team = teams[teamIndex];
				console.log(team.getName());
				var personList = team.list();
				for(var personIndex in personList){
					var person = personList[personIndex];
					console.log(" * "+person.getEmail());
				}
			}
		};
		
		/**
		 * Generates the current pairings to a file or to the console
		 * @param filename if provided the pairings are written to the file, else to the console
		 */
		this.generatePairing = function(filename){
			var out = 1;
			if(filename !== null){
				out = fs.openSync(filename, 'a');
			}
			var buffer = new Buffer("Generating new pairing :\n"+(new Date())+"\n");
			fs.writeSync(out,buffer,0,buffer.length,null);
			// Extract all used pairings in one list
			var validPairings = [];
			var pairing;
			for(var person1Index in pairingMap){
				for(var person2Index in pairingMap[person1Index]){
					pairing = pairingMap[person1Index][person2Index];
					if(pairing.isValidPairing()){
						validPairings.push(pairing);
					}
				}
			}
			validPairings.sort(function(pairing1,pairing2){
				return pairing1.getPairingCount() - pairing2.getPairingCount();
			});
			var peopleAlreadyPicked = {};
			for(var pairingIndex in validPairings){
				pairing = validPairings[pairingIndex];
				if(pairing.isAvailable(peopleAlreadyPicked)){
					pairing.incrementPairingCount();
					pairing.pickPeople(peopleAlreadyPicked);
					buffer = new Buffer(pairing.getPerson1().getEmail() + " with " + pairing.getPerson2().getEmail()+ "\n");
					fs.writeSync(out,buffer,0,buffer.length,null);
				}
			}
			buffer = new Buffer("---\n");
			fs.writeSync(out,buffer,0,buffer.length,null);
			if(filename !== null){
				fs.closeSync(out);
			}
		};
		
		/**
		 * Commits all scheduled changes to the databases
		 */
		
		this.write = function(){
			var changes = databaseSchedule;
			databaseSchedule = [];
			db.serialize(function(){
				//db.exec("BEGIN");
				for(var changeIndex in changes){
					var change = changes[changeIndex];
					change.run();
					change.finalize();
				}
				//db.exec("COMMIT");
			});
		};
		
		/**
		 * Reset all data.
		 * BE VERY CAREFUL WITH IT.
		 */
		this.reset = function(){
			db.serialize(function(){
				db.exec("DELETE FROM team");
				db.exec("DELETE FROM person");
				db.exec("DELETE FROM team_person_connection");
				db.exec("DELETE FROM pairing");
			});
			// handeled by garbage collector
			databaseSchedule = [];
			pairingMap = {};
			teams = [];
			teamsIndexedByNames = {};
			people = [];
			peopleIndexedByEmails = {};
			Pairing.max_id=0;
			Person.max_id=0;
			Team.max_id=0;
		};
		
		/**
		 * Close the engine
		 */
		this.close = function(filename){
			db.close();
		};
		
		/**
		 * Exit the app
		 */
		this.exit = function(filename){
			db.close(function(err){
				process.exit(0);
			});
		};
	}
	
	return {
		/**
		 * 
		 * @param callback function to callback when instance is loaded
		 */
		getInstance: function (callback) {
			if (!engine) {
				engine = new Engine(callback);
			}
		},
		killInstance: function () {
			if(engine){
				engine.close();
				engine = undefined;
			}
		}
	};
})();

module.exports = EngineGenerator;