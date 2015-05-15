var vertx = require('vertx');
var container = require('vertx/container');
var console = require('vertx/console');

var config = container.config;

depMod('oanda~stream~1.0', config.stream);
depMod('web~server~1.0', config.web);

// container.deployModule('io.vertx~mod-mongo-persistor~2.1.0', config.mongo(err) {
//
// });

function depMod(name, conf) {
  container.deployModule(name, conf, function(err) {
    if (err) {
      console.log(err.getMessage());
    } else {
      console.log('deployed module: ' + name);
    }
  });
}
