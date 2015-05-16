var vertx = require('vertx');
var container = require('vertx/container');
var console = require('vertx/console');

var config = container.config;

if (config.mainStuff === true) {
  depMod('oanda~stream~1.0', config.stream);
  depMod('web~server~1.0', config.web);
  depMod('io.vertx~mod-mongo-persistor~2.1.0', config.mongo);
  depMod('sentiment~repository~1.0', config.mongo);
}

if (config.sendTestMessages === true) {
  depMod('sentiment~tester~1.0', config.web);
}

if (config.startHistory === true) {
  depMod('oanda~history~1.0', config.history);
}

// anyone else think that container.deployModule ought to do this?!!
function depMod(name, conf) {
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
