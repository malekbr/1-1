
var EngineGenerator = require('./engine');
var console = require('./console');

EngineGenerator.getInstance(function(engine){
	// TODO : test generateToFile
	console.run(engine);
	//engine.close();
});