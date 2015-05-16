var vertx = require('vertx');
var console = require('vertx/console');
var container = require('vertx/container');

var eb = vertx.eventBus;
var config = container.config;

console.log('starting web server');

var server = vertx.createHttpServer();

var routeMatcher = new vertx.RouteMatcher();

routeMatcher.post('/postSentiment', function(req) {

  req.bodyHandler(function(body) {
    eb.publish('sentiment.event', JSON.parse(body.toString()));
    // console.log(body.toString());
  });

  req.response.end();

});

routeMatcher.noMatch(function(req) {
  var file = '';
  if (req.path() == '/') {
    file = 'index.html';
  } else {
    file = req.path();
  }
  req.response.sendFile('webroot/' + file);
});

server.websocketHandler(function(socket) {

  if (socket.path() === '/liveStream') {

    var streamHandler = function(tick) {
      var tickStr = JSON.stringify(tick);
      //console.log('ws: ' + tickStr);
      socket.writeTextFrame(tickStr);
    }

    eb.registerHandler('fx.tick', streamHandler);

    socket.closeHandler(function() {
      console.log('unregistering streaming handler');
      eb.unregisterHandler('fx.tick',streamHandler);
    });

  } else if (socket.path() === '/presentationStream') {
    console.log('presentationStream');
  }

});

server.requestHandler(routeMatcher).listen(config.port, config.host, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('listening on '+ config.host + ':' + config.port);
  }
});
