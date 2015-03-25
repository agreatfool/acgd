var BaseClass = require('../base');

var MangaClass = function(options) {
    BaseClass.call(this, options);
};
MangaClass.prototype = new BaseClass();
MangaClass.prototype.constructor = MangaClass;

MangaClass.prototype.init = function() {
    Logger.info('BaseClass.prototype.init');
};

MangaClass.prototype.start = function() {
    Logger.info('BaseClass.prototype.start');
};

MangaClass.prototype.prepareList = function() {
    Logger.info('BaseClass.prototype.prepareList');
};

MangaClass.prototype.downloadList = function() {
    Logger.info('BaseClass.prototype.downloadList');
};

MangaClass.prototype.downloadFile = function() {
    Logger.info('BaseClass.prototype.downloadFile');
};

MangaClass.prototype.persistFile = function() {
    Logger.info('BaseClass.prototype.persistFile');
};

MangaClass.prototype.end = function() {
    Logger.info('BaseClass.prototype.end');
};

module.exports = MangaClass;