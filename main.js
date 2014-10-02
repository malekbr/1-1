var EngineGenerator = require('./engine');
var terminal = require('./terminal');

EngineGenerator.getInstance(function(engine){
	terminal.run(engine);
});