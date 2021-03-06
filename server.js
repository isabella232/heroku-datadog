const express = require('express');
const auth = require('basic-auth');

const app = express();

app.use(function(req, res, next) {
  const user = auth(req);

  if (user === undefined || user['name'] !== process.env.BASIC_AUTH_USERNAME || user['pass'] !== process.env.BASIC_AUTH_PASSWORD) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="AuthRealm"');
    res.end('Unauthorized');
  } else {
    next();
  }
});

app.use(function(req, res, next) {
  let data = '';
  req.on('data', function(chunk) {
    data += chunk
  })
  req.on('end', function() {
    req.body = data;
    next();
  });
});

app.get('/', function(request, response) {
  response.send('OK');
});

const Parser = require("./app/Parser");
const parser = new Parser();

app.post('/logs', function(request, response) {
  response.sendStatus(200);
  if (request.get('content-type') == 'application/logplex-1') {

    const hostname = request.hostname;
    const logArray = request.body.split("\n");
    logArray.forEach(function(log) {
      parser.parse(log, hostname);
    });

  } else {
    console.log('Not Logplex');
  }
});

console.log('Starting the log monitoring server');
const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Listening on port: ' + port);
});
