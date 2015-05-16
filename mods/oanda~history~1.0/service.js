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

    eb.registerHandler('historic.tick.request', function(event, reply) {
      // take time and instrument and return bid/ask message
      console.log('got a historic tick request' + JSON.stringify(event));

      var inst = event.instrument;
      var start = encodeURIComponent(moment(event.date).format('YYYY-MM-DDTHH:mm:ss')+'Z');
      var path = '/v1/candles?accountId='+secret.accountId+'&instrument='+inst+'&count=1&start='+start;
      // var encodedPath = encodeURIComponent(path);
      //console.log(path);
      var request = client.get(path, function(resp) {

        resp.dataHandler(function(buffer) {
          // console.log('[' + buffer.toString().trim() + ']');
          var data = JSON.parse(buffer.toString().trim());
          // console.log(data.candles[0].openBid);

          var candle = data.candles[0];

          var message = {
            "instrument": data.instrument,
            "bid": candle.openBid,
            "ask": candle.openAsk,
            "time": candle.time
          }

          reply(message);
        });

      }).putHeader("Authorization", auth).end();

    });

    eb.registerHandler('timer.tick', function(event) {
      var req = {
        instrument: "GBP_USD",
        date: event
      };
      eb.send('historic.tick.request', req, function(reply) {
        eb.publish('fx.historic.tick', reply);
      });
    });

  }
});
