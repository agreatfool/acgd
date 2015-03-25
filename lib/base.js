var Logger = require('./util/logger');

var BaseClass = function() {};

BaseClass.prototype.init = function() {
    Logger.info('BaseClass.prototype.init');
};

BaseClass.prototype.start = function() {
    Logger.info('BaseClass.prototype.start');
};

BaseClass.prototype.prepareList = function() {
    Logger.info('BaseClass.prototype.prepareList');
};

BaseClass.prototype.downloadList = function() {
    Logger.info('BaseClass.prototype.downloadList');
};

BaseClass.prototype.downloadFile = function() {
    Logger.info('BaseClass.prototype.downloadFile');
};

BaseClass.prototype.persistFile = function() {
    Logger.info('BaseClass.prototype.persistFile');
};

BaseClass.prototype.end = function() {
    Logger.info('BaseClass.prototype.end');
};

module.exports = BaseClass;