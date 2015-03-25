var BaseClass = require('../base');

var VideoClass = function(options) {
    BaseClass.call(this, options);
};
VideoClass.prototype = new BaseClass();
VideoClass.prototype.constructor = VideoClass;

VideoClass.prototype.init = function() {
    Logger.info('VideoClass.prototype.init');
};

VideoClass.prototype.start = function() {
    Logger.info('VideoClass.prototype.start');
};

VideoClass.prototype.prepareList = function() {
    Logger.info('VideoClass.prototype.prepareList');
};

VideoClass.prototype.downloadList = function() {
    Logger.info('VideoClass.prototype.downloadList');
};

VideoClass.prototype.downloadFile = function() {
    Logger.info('VideoClass.prototype.downloadFile');
};

VideoClass.prototype.persistFile = function() {
    Logger.info('VideoClass.prototype.persistFile');
};

VideoClass.prototype.end = function() {
    Logger.info('VideoClass.prototype.end');
};

module.exports = VideoClass;