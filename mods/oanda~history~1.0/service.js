var vertx = require('vertx');
var console = require('vertx/console');
var container = require('vertx/container');
var moment = require('./lib/moment.js');

var eb = vertx.eventBus;
var config = container.config;

var ticks = {};

console.log('starting oanda history...');

var client = vertx.createHttpClient()
                 .host(config.url)
                 .port(config.port)
                 .ssl(true)
                 .trustAll(true);

vertx.fileSystem.readFile(config.secretFile, function(err, res) {
  if (err) {
    console.log(err);
  } else {
    var secret = JSON.parse(res.getString(0, res.length()).trim());
    var auth = 'Bearer '+secret.apiKey;

    eb.registerHandler('timer.tick', function(event) {
      var start = encodeURIComponent(moment(event).format('YYYY-MM-DDTHH:mm:ss')+'Z');
      var path = '/v1/candles?accountId='+secret.accountId+'&instrument=GBP_USD&count=1&start='+start;
      // var encodedPath = encodeURIComponent(path);
      console.log(path);
      var request = client.get(path, function(resp) {

        resp.dataHandler(function(buffer) {
          console.log('[' + buffer.toString().trim() + ']');
          // var data = buffer.toString().split('\n');
          // data.forEach(function(message) {
          //   if (message.trim().length > 0) {
          //     var jm = JSON.parse(message);
          //     if (jm.tick) {
          //       ticks[jm.tick.instrument] = jm.tick;
          //     }
          //   }
          // });
        });

      }).putHeader("Authorization", auth).end();

    });




    //
    //
    //
    // console.log('about to create request...');
  //
  //
  //   // var streamTimer = vertx.setPeriodic(1000, function(timerId) {
  //   //   for (var key in ticks) {
  //   //     eb.publish('fx.tick', ticks[key]);
  //   //   }
  //   // });
  //
  }
});
