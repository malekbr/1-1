var readline = require('readline');

function run(engine){
	var save = true;
	console.log("Welcome to 1 + 1 (beta).\n" +
			"Data will be saved automatically at each command. To undo that for\n" +
			"performance reasons, please type in toggleSave.\n" +
			"For help, type help.");
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	function saveChanges(){
		console.log("Saving...");
		engine.write();
	}
	function exit(){
		if(save){
			saveChanges();
			console.log("Exiting...");
			engine.exit();
		}else{
			rl.question("Save ? (Type no to not save) : ", function(answer){
				if(answer.trim().toLowerCase() === 'no'){
					console.log("Not saving");
				}else{
					saveChanges();
				}
				console.log("Exiting...");
				engine.exit();
			});
		}
	}
	rl.on('line', function(line){
		line = line.trim();
		var lineWords = line.split(/\s+/);
		switch(lineWords[0].toLowerCase()){
		case '':
			rl.prompt();
			break;
		case 'help':
			console.log('List of commands :\n'+
					'help \t\t\t: Shows this text.\n'+
					'list \t\t\t: Lists all teams and their members.\n'+
					'toggleSave \t\t: Enables or disables autosave.\n'+
					'generate [file]\t\t: Generates the next pairing. If file is specified,\n'+
					'\t\t\t  it appends the generated data to the file.\n' +
					'\t\t\t  There shouldn\'t be quotes around the file path\n'+
					'\t\t\t  if it contains spaces.\n'+
					'load file\t\t: Loads a file to the database\n'+
					'\t\t\t  Its lines are either of the form\n'+
					'\t\t\t    team name\n'+
					'\t\t\t  which adds a team to the database called name or\n'+
					'\t\t\t    add email name\n'+
					'\t\t\t  which adds the email to the team called name.\n'+
					'\t\t\t  Empty lines are tolerated.\n'+
					'\t\t\t  The file is case insensitive.\n'+
					'addTeam team\t\t: Adds team to the database\n'+
					'addPerson email team\t: Adds person to team (needs to exist).\n'+
					'removePerson email\t: Removes person from all teams.\n'+
					'removeFromTeam email team: Removes person from team (needs to exist)\n'+
					'reset \t\t\t: Deletes all data stored and computed. IRREVERSABLE.\n'+
					'save \t\t\t: Commits unsaved changes to the database.\n'+
					'exit \t\t\t: Exits the application.');
			rl.prompt();
			break;
		case 'list':
			engine.listOrganization();
			rl.prompt();
			break;
		case 'togglesave': //toggleSave
			if(save){
				save = false;
				console.log('Now auto-save is disabled.');
			}else{
				save = true;
				console.log('Now auto-save is enabled.');
			}
			rl.prompt();
			break;
		case 'load':
			if(lineWords.length < 2){
				console.error('Please specify filename');
			}else{
				var filename = line.match(/^load\s+(.+)$/)[1];
				console.log('Loading '+filename);
				try{
					engine.loadFile(filename);
				}catch(e){
					console.error(e.message);
					rl.prompt();
					return;
				}
				console.log('Done loading');
				if(save){
					saveChanges();
				}
			}
			rl.prompt();
			break;
		case 'addteam': // addTeam
			var teamRegex = /^addTeam\s+(.+)$/i;
			var result = teamRegex.exec(line);
			if(result){ // this a command that adds a new team
				if(engine.canAddTeam(result[1])){
					try{
						engine.addTeam(result[1]);
						if(save){
							saveChanges();
						}
					}catch(e){
						console.log(e.message);
					}
				}else{
					console.error('Cannot add team '+result[1]);
				}
			}else{
				console.error('Malformed addTeam command');
			}
			rl.prompt();
			break;

		case 'addperson': // addPerson
			var personRegex = /^addPerson\s+([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\s+(.+)$/i;
			var result = personRegex.exec(line);
			if(result){
				if(engine.canAddPersonToTeam(result[1], result[2])){
					try{
						engine.addPersonToTeam(result[1], result[2]);
						if(save){
							saveChanges();
						}
					}catch(e){
						console.error(e.message());
					}
				}else{
					console.error('Cannot add person '+result[1]+' to team '+result[2]+'.\n'+
							'Maybe the team doesn\'t exist.');
				}
			}else{
				console.error('Malformed addPerson command (is the email valid?)');
			}
			rl.prompt();
			break;
		case 'removeperson': // removePerson
			var personRegex = /^removePerson\s+([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)$/i;
			var result = personRegex.exec(line);
			if(result){
				try{
					engine.removePersonFromAllTeams(result[1]);
					if(save){
						saveChanges();
					}
				}catch(e){
					console.error(e.message);
				}
			}else{
				console.error('Malformed removePerson command (is the email valid?)');
			}
			rl.prompt();
			break;
		case 'removefromteam': // removeFromTeam
			var personRegex = /^removeFromTeam\s+([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\s+(.+)$/i;
			var result = personRegex.exec(line);
			if(result){
				try{
					engine.removePersonFromTeam(result[1], result[2]);
					if(save){
						saveChanges();
					}
				}catch(e){
					console.error(e.message);
				}
			}else{
				console.error('Malformed removeFromTeam command (is the email valid?)');
			}
			rl.prompt();
			break;
		case 'generate':
			if(lineWords.length < 2){
				engine.generatePairing(null);
			}else{
				var filename = line.match(/^generate\s+(.+)$/)[1];
				try{
					engine.generatePairing(filename);
				}catch(e){
					console.error(e.message);
					rl.prompt();
					return;
				}
			}
			if(save){
				saveChanges();
			}
			rl.prompt();
			break;
		case 'reset':
			console.log("BE VERY CAREFUL. DATA IS IRRETRIEVABLE.");
			rl.question("Proceed with resetting ? (Type yes to proceed) : ", function(answer){
				if(answer.trim().toLowerCase() === 'yes'){
					engine.reset();
				}
				console.log('reset');
				rl.prompt();
			});
			break;
		case 'save':
			saveChanges();
			rl.prompt();
			break;
		case 'exit':
			exit();
			break;
		default:
			console.error("Unrecognized command");
			console.error(line);
			rl.prompt();
			break;
		}
	}).on('close',function(){
		exit();
	});
	rl.prompt();
}

module.exports.run = run;