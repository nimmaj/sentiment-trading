var vertx = require('vertx');
var console = require('vertx/console');
var container = require('vertx/container');
var moment = require('./lib/moment.js');

var eb = vertx.eventBus;
var config = container.config;

var sentimentMode = config.mode;

console.log('starting sentiment repository in ' + sentimentMode + ' mode...');

// { "timestamp": { $gt: "2015-05-15T15:57:50.000Z", $lt: "2015-05-15T15:57:59.000Z" } }

if (sentimentMode === 'store') {
  eb.registerHandler('sentiment.event', function(message) {
    console.log('storing: '+JSON.stringify(message));

    var mm = {
      "action": "save",
      "collection": "event",
      "document": message
    }

    eb.send(config.address, mm);
  });
} else {
  var looped = false;
  var previousTick = "";
  eb.registerHandler('timer.tick', function(event) {
    if (looped) {
      var search = {
        "timestamp": {
          "$gt": convDate(previousTick),
          "$lte": convDate(event)
        }
      };

      var sm = {
        "action": "find",
        "collection": "event",
        "matcher": search
      }

      eb.send(config.address, sm, function(reply) {
        if (reply.number > 0) {
          reply.results.forEach(function(result) {
            eb.publish('sentiment.event', result);
          });
        }
      });
    }
    previousTick = event;
    looped = true;
  });
}

function convDate(dt) {
  return moment(dt).format('YYYY-MM-DD HH:mm:ss');
}
