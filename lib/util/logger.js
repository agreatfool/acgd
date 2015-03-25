var winston = require('winston');
var moment = require('moment');

var fileDate = moment().format('YYYY-MM-DD_HH-mm-SSS');
var logTime = function() { return moment().format('YYYY-MM-DD HH:mm:SSS'); };

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: logTime
        }),
        new (winston.transports.File)({
            timestamp: logTime,
            filename: './log/acgd_' + fileDate + '.log'
        })
    ]
});

module.exports = logger;