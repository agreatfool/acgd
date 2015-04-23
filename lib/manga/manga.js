/**
 * Class Definition
 */
var BaseClass = require('../base');
var MangaClass = function(options) {
    BaseClass.call(this, options);
};
MangaClass.prototype = new BaseClass();
MangaClass.prototype.constructor = MangaClass;

/**
 * Libraries
 */
var fs = require("fs");
var async = require('async');
var cheerio = require('cheerio');
var needle = require('needle');
var liburl = require('url');
var Logger = require('../util/logger');

/**
 * Implementations
 */
MangaClass.prototype.init = function() {
    Logger.info('MangaClass.prototype.init');
};

MangaClass.prototype.start = function() {
    Logger.info('MangaClass.prototype.start');
};

MangaClass.prototype.prepareList = function() {
    Logger.info('MangaClass.prototype.prepareList');
};

MangaClass.prototype.downloadList = function() {
    Logger.info('MangaClass.prototype.downloadList');
};

MangaClass.prototype.downloadFile = function() {
    Logger.info('MangaClass.prototype.downloadFile');
};

MangaClass.prototype.persistFile = function() {
    Logger.info('MangaClass.prototype.persistFile');
};

MangaClass.prototype.end = function() {
    Logger.info('MangaClass.prototype.end');
};

module.exports = MangaClass;