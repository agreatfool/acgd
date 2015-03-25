var Logger = require('./lib/util/logger');

var config = require('./config/config.json');
var options = require('./options.json');

Logger.info('System start ...');
Logger.info('config: ' + JSON.stringify(config));
Logger.info('options: ' + JSON.stringify(options));

Logger.info('Load implementation class: ' + options.type);

var typeStr = options.type.toLowerCase();
var Implementation = require('./lib/' + typeStr + '/' + typeStr);

var impl = new Implementation(options);

impl.init(); // start to run