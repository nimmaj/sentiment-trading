var vertx = require('vertx');
var console = require('vertx/console');
var container = require('vertx/container');
var moment = require('./lib/moment.js');

var eb = vertx.eventBus;
var config = container.config;

console.log('starting sentiment repository...');

eb.registerHandler('sentiment.event', function(message) {
  console.log(JSON.stringify(message));

  var mm = {
    "action": "save",
    "collection": "event",
    "document": message
  }

  eb.send(config.address, mm);
});
