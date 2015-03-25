var BaseClass = require('../base');

var BinaryClass = function(options) {
    BaseClass.call(this, options);
};
BinaryClass.prototype = new BaseClass();
BinaryClass.prototype.constructor = BinaryClass;

BinaryClass.prototype.init = function() {
    Logger.info('BaseClass.prototype.init');
};

BinaryClass.prototype.start = function() {
    Logger.info('BaseClass.prototype.start');
};

BinaryClass.prototype.prepareList = function() {
    Logger.info('BaseClass.prototype.prepareList');
};

BinaryClass.prototype.downloadList = function() {
    Logger.info('BaseClass.prototype.downloadList');
};

BinaryClass.prototype.downloadFile = function() {
    Logger.info('BaseClass.prototype.downloadFile');
};

BinaryClass.prototype.persistFile = function() {
    Logger.info('BaseClass.prototype.persistFile');
};

BinaryClass.prototype.end = function() {
    Logger.info('BaseClass.prototype.end');
};

module.exports = BinaryClass;