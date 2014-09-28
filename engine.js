var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var Team = require('./entities/team');
var Person = require('./entities/person');
var Pairing = require('./entities/pairing');
var readline = require('readline');

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
		// method : put every database sensitive operation in db.serialize
		// TODO : copy database file and work on it and then when you close the database save on the older one
		var that = this;
		/*
		 * Database name:
		 * data.db
		 * Tables :
		 * team :
		 * | id (unique, auto-increment) | name (unique, case insensitive) |
		 * person :
		 * | id (unique, auto-increment) | email (unique, case insensitive) |
		 * team-person-connection :
		 * | id (unique, auto-increment) | team_id | person_id |
		 * pairing :
		 * | id (unique, auto-increment) | person1_id | person2_id | pairing_count | team_count |
		 * 
		 */
		var db = null;
		db = new sqlite3.Database('./data.db');
		db.serialize(function() {
			db.run("CREATE TABLE IF NOT EXISTS team (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE COLLATE NOCASE)");
			db.run("CREATE TABLE IF NOT EXISTS person (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE COLLATE NOCASE)");
			db.run("CREATE TABLE IF NOT EXISTS team_person_connection (id INTEGER PRIMARY KEY AUTOINCREMENT, team_id INTEGER NOT NULL, person_id INTEGER NOT NULL)");
			db.run("CREATE TABLE IF NOT EXISTS pairing (id INTEGER PRIMARY KEY AUTOINCREMENT, person1_id INTEGER NOT NULL, person2_id INTEGER NOT NULL, pairing_count INTEGER NOT NULL, team_count INTEGER NOT NULL)");
		});
		var pairingMap = [];
		var teams = [];
		var teamsIndexedByNames = [];
		var people = [];
		var peopleIndexedByEmails = [];
		db.serialize(function(){
			// Loads teams
			db.each("SELECT * FROM team", function(err, row){
				teams[row.id] = new Team(row.id, row.name, pairingMap, db);
				teamsIndexedByNames[row.name.toLowerCase()] = teams[row.id];
			});
		});
		db.serialize(function(){
			// Loads people
			db.each("SELECT * FROM person", function(err, row){
				people[row.id] = new Person(row.id, row.name);
				peopleIndexedByEmails[row.name.toLowerCase()] = teams[row.id];
			});
		});
		db.serialize(function(){
			// Assigns people to teams
			db.each("SELECT * FROM team_person_connection", function(err, row){
				teams[row.team_id].add(people[row.person_id]);
			});
		});
		db.serialize(function(){
			// Generate pairings
			db.each("SELECT * FROM pairing", function(err, row){
				if(pairingMap[row.person1_id] === undefined){
					pairingMap[row.person1_id] = [];
				}
				pairingMap[row.person1_id][row.person2_id] = new Pairing(people[row.person1_id],
						people[row.person2_id], db);
			});
		});
		db.serialize(function(){
			// Done loading
			callback(that);
		});
		
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
		this.loadFile = function(filename, callback){
			var rd = readline.createInterface({
				input: fs.createReadStream(filename),
				output: process.stdout,
				terminal: false
			});
			rd.on("line", function(line){
				var teamRegex = /^\s*team\s+(.+)\s*$/; // checks for team command
				var result;
				result = teamRegex.exec(line);
				if(result){ // this a command that adds a new team
					this.addTeam(result[1]);
				}else{
					var addPersonRegex = /^\s*add\s+([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\s+(.+)\s*$/;
					result = addPersonRegex.exec(line);
					if(result){
						this.addPersonToTeam(result[1], result[2]);
					}else{
						throw "Invalid command";
					}
				}
				//done loading
				db.serialize(callback);
			});
		};
		
		/**
		 * adds a team called teamName to the database
		 * @param teamName a string
		 */
		this.addTeam = function(teamName){
			Team.generate(teamName, pairingMap, db, function(team){
				teams[team.getId()] = team;
				teamsIndexedByNames[team.getName().toLowerCase()] = team;
			});
		};
		
		/**
		 * @param personEmail a string
		 * @param teamName a string
		 */
		this.addPersonToTeam = function(personEmail, teamName){
			if(teamsIndexedByNames[teamName.toLowerCase()]){
				throw "Team "+teamName+" not found";
			}
			db.serialize(function(){
				Person.generate(personEmail, pairingMap, people, db, function(person){
					people[person.getId()] = person;
					peopleIndexedByEmails[person.getName().toLowerCase()] = person;
					teamsIndexedByNames[teamName.toLowerCase()].add(person);
				});
			});
		};
		
		/**
		 * removes a team from the database
		 * @param teamName needs to be in the database
		 */
		this.removeTeam = function(teamName){
			// TODO
			throw "Not implemented yet";
		};
		
		/**
		 * @param personName a string
		 * @param teamName a string
		 */
		this.removePersonFromTeam = function(personName, teamName){
			// TODO
			throw "Not implemented yet";
		};
		
		/**
		 * @param personName a string
		 */
		this.removePersonFromAllTeams = function(personName){
			// TODO
			throw "Not implemented yet";
		};
		
		/**
		 * Displays all the teams with their members
		 */
		this.listOrganization = function(){
			// TODO
			throw "Not implemented yet";
		};
		
		/**
		 * Generates the current pairings to a file or to the console
		 * @param filename if provided the pairings are written to the file, else to the console
		 */
		this.generatePairing = function(filename){
			// TODO
			throw "Not implemented yet";
		};
		
		/**
		 * Reset all data.
		 * BE VERY CAREFUL WITH IT.
		 */
		this.reset = function(){
			// TODO
			throw "Not implemented yet";
		};
		
		/**
		 * Close the engine
		 */
		this.close = function(filename){
			db.close();
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