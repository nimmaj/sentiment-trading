var vertx = require('vertx');
var container = require('vertx/container');
var console = require('vertx/console');

var config = container.config;

depMod('oanda~stream~1.0', config.stream, config.mainStuff);
depMod('web~server~1.0', config.web, config.mainStuff);
depMod('io.vertx~mod-mongo-persistor~2.1.0', config.mongo, config.mainStuff);
depMod('sentiment~repository~1.0', config.mongo, config.mainStuff);

depMod('sentiment~tester~1.0', config.web, config.sendTestMessages);
depMod('oanda~history~1.0', config.history, config.startHistory);

depMod('time~server~1.0', config.time, config.startTime);

// anyone else think that container.deployModule ought to do this?!!
function depMod(name, conf, shouldStart) {
  if (!shouldStart) {
    console.log('not starting '+name);
  } else {
    console.log('starting '+name+' with config: ');
    console.log(conf);
    container.deployModule(name, conf, function(err) {
      if (err) {
        console.log(err.getMessage());
      } else {
        console.log('deployed module: ' + name);
      }
    });
  }
}
