var page = require('webpage').create();
var system = require('system');
var url;

page.settings.loadImages = false;

if (system.args.length === 1) { // invalid args count
  console.log('phantomjs: invalid args count: ' + system.args.length);
  phantom.exit(1);
}

url = system.args[1];

page.onError = function(msg, trace) {
  var msgStack = ['ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
    });
  }
  //console.error(msgStack); // FIXME no idea why parent process cannot got message from stderr, disabled it for now
};

page.open(url, function(status) {
  if (status !== 'success') {
    console.log('phantomjs: failed to open url: ' + url);
    phantom.exit(1);
  } else {
    console.log(page.content);
    phantom.exit(0);
  }
});