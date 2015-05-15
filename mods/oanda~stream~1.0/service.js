var vertx = require('vertx');
var console = require('vertx/console');
var container = require('vertx/container');

var eb = vertx.eventBus;
var config = container.config;

var ticks = {};

console.log('starting oanda streaming...');

vertx.fileSystem.readFile(config.secretFile, function(err, res) {
  if (err) {
    console.log(err);
  } else {
    var secret = JSON.parse(res.getString(0, res.length()).trim());

    var path = '/v1/prices?accountId='+secret.accountId+'&instruments=EUR_USD%2CGBP_USD%2CEUR_GBP';
    var auth = 'Bearer '+secret.apiKey;

    var client = vertx.createHttpClient()
                     .host(config.url)
                     .port(config.port)
                     .ssl(true)
                     .trustAll(true);

    console.log('about to create request...');

    var request = client.get(path, function(resp) {

      resp.dataHandler(function(buffer) {
        console.log('[' + buffer.toString().trim() + ']');
        var data = buffer.toString().split('\n');
        data.forEach(function(message) {
          if (message.trim().length > 0) {
            var jm = JSON.parse(message);
            if (jm.tick) {
              ticks[jm.tick.instrument] = jm.tick;
            }
          }
        });
      });

    }).putHeader("Authorization", auth).end();

    var streamTimer = vertx.setPeriodic(1000, function(timerId) {
      for (var key in ticks) {
        eb.publish('fx.tick', ticks[key]);
      }
    });

  }
});
