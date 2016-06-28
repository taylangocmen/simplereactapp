var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var port = 8080;

var tweets_file = path.join(__dirname, 'tweets.json');

app.set('port', port);

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function (req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');

  next();
});


app.get('/api/tweets', function (req, res) {
  fs.readFile(tweets_file, function (err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    } else {
      // console.log('No error: get api tweets');
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/tweets', function (req, res) {
  fs.readFile(tweets_file, function (err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    } else {
      // console.log('No error: post api tweets');
    }
    var tweets = JSON.parse(data);
    var newtweet = {
      id: Date.now(),
      text: req.body.text,
      favs: req.body.favs,
      reps: req.body.reps,
      rets: req.body.rets
    };
    tweets.push(newtweet);
    fs.writeFile(tweets_file, JSON.stringify(tweets, null, 4), function (err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json(tweets);
    });
  });
});

app
  .listen(app.get('port'), () => {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
  })
;
