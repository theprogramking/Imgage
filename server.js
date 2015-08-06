var express = require('express');
var app = module.exports = express.createServer();
var port = 8080;

app.configure(function() {
  
  // App Config.
  
  app.use(express.logger());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: "I am the king." }));
  app.use(express.static(__dirname + '/public'));
  
});

require('./socket');
require('./main');

app.listen(port);

console.log('Imgage is runnung on port: ' + port );