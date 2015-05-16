var vertx = require('vertx');
var console = require('vertx/console');
var container = require('vertx/container');
var moment = require('./lib/moment.js');

var eb = vertx.eventBus;
var config = container.config;

// just going to work historically for the moment - need a global

console.log('starting sentiment trader...');

var gbp = 1000;
var usd = 1000;
var leverage = config.confidenceMultiplier;

eb.registerHandler('sentiment.event', function(message) {

  console.log('trade: '+ message.type + ' confidence: ' + message.confidence);

  if (message.type === 'buy') {
    console.log('buy: '+message.confidence * leverage);
  } else {
    console.log('sell: ' + message.confidence * leverage);
  }
  // console.log(JSON.stringify(message));
  //
  // var mm = {
  //   "action": "save",
  //   "collection": "event",
  //   "document": message
  // }
  //
  // eb.send(config.address, mm);
});
