var vertx = require('vertx');
var container = require('vertx/container');
var console = require('vertx/console');

var config = container.config;

container.deployModule('oanda~stream~1.0', config.stream, function(err) {
  if (!err) {
    console.log('deployed oanda stream 1.0');
  } else {
    console.log(err.getMessage());
  }
});

container.deployModule('web~server~1.0', config.web, function(err) {
  if (!err) {
    console.log('deployed web server 1.0');
  } else {
    console.log(err.getMessage());
  }
});
