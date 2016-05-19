const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const logger = require('morgan');
const path = require('path');
const PORT = 3000;
const events = require('../db/events.json');
const times = require('../db/times.json');

app.use(logger());

app.use(bodyParser.json());

app.use(express.static('static'));

app.get('/event', function(req, res) {
  res.send(events);
});

app.get('/timeLine', function(req, res) {
  res.send(times);
});

const server = app.listen(PORT, function() {
  console.log('Server is running at http://localhost:' + server.address().port);
});
