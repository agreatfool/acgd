var ProgressBar = require('progress');

var Progress = function() {};

Progress.prototype.buildProgressBar = function(name, totalLength) {
    return new ProgressBar('Downloading "' + name + '" [:bar] :percent :etas', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: totalLength
    });
};

module.exports = new Progress();