var vertx = require('vertx');
var console = require('vertx/console');
var container = require('vertx/container');
var moment = require('./lib/moment.js');

var eb = vertx.eventBus;
var config = container.config;

console.log('starting sentiment tester...');

var client = vertx.createHttpClient()
                 .host(config.host)
                 .port(config.port);


var thingToSend = {
  "author": "richard",
  "source": "someone",
  "type": "buy",
  "confidence": 66,
  "description": "BBC reports factory closure in Utah",
  "timestamp": moment()
}

var streamTimer = vertx.setPeriodic(3000, function(timerId) {
  thingToSend.timestamp = moment().subtract(Math.random() * 100, 'd').format('YYYY-MM-DD HH:mm:ss');
  thingToSend.type = (Math.random() < 0.5) ? "buy" : "sell";
  thingToSend.confidence = Math.random() * 100;
  client.post("/postSentiment", function(resp) {
    console.log('posted: '+resp.statusCode() + ' ' + resp.statusMessage());
  }).end(JSON.stringify(thingToSend));
});
