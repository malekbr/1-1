var readlineSync = require('readline-sync');
var readline = require('readline');

function run(engine){
//	var line;
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
	// TODO : help and atomic additions and wrong inputs
	rl.on('line', function(line){
		line = line.trim();
		var lineWords = line.split(/\s+/);
		switch(lineWords[0]){
		case '':
			rl.prompt();
			break;
		case 'list':
			engine.listOrganization();
			rl.prompt();
			break;
		case 'toggleSave':
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