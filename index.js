var Logger = require('./ES6/util/logger');

var config = require('./config/config.json');
var options = require('./options.js');

Logger.info('System start ...');
Logger.info('config: ' + JSON.stringify(config));

var type = options.TYPE;
var typeOptions = options[options.TYPE];
Logger.info('options: ' + JSON.stringify(typeOptions));

Logger.info('Load implementation class: ' + options.TYPE);

var Implementation = require('./' + type.toLowerCase() + '/' + type.toLowerCase());

var impl = new Implementation(typeOptions);

impl.init(); // start to run

//==========

var fs = require("fs");
var async = require('async');
var cheerio = require('cheerio');
var needle = require('needle');
var liburl = require('url');

var url = 'http://www.xindm.cn/mh/HOLIDAY-LOVE/';

var urlparts = liburl.parse(url);

var host = urlparts.protocol + '//' + urlparts.host;

needle.get(url, function(error, response) {
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(response.body);

        $('#mhlist ul li a').each(function() {
            var match = $(this).attr('onclick').toString().match(/^window.open\('(.+)'\)$/);
            if (match !== null) {
                console.log($(this).attr('title') + ' : ' + host + match[1]);
            }
        });
    }
});



