var express = require('express');
var app = express();
const path = require('path');
const fs = require('fs');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
require("dotenv").config();
var request = require('request');

app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser());

var port = 5000;
// With this:
var redirect_uri = 'http://localhost:5000/callback';

var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';
var acc_token = process.env.acctoken;

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/landing.html'))
});

app.get('/game.html', (req, res) => {
  res.render('/public/game.html');
});

app.get("/authenticate", function (req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.clientId,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function (req, res) {

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(process.env.clientId + ':' + process.env.clientSecret).toString('base64'))
      },
      json: true
    };
    console.log(authOptions);
    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          json: true
        };

        request.get(options, function (error, response, body) {
          console.log(body);
          acc_token = access_token;
          console.log(access_token);
          
          // First song analysis
          var fetchOptions = {
            url: 'https://api.spotify.com/v1/audio-analysis/11dFghVXANMlKmJXsNCbNl',
            headers: {
              'Authorization': 'Bearer ' + access_token
            },
            json: true
          };
          
          request.get(fetchOptions, function (error, response, body) {
            var beat_times = [];
            if (error) {
              console.error('Error fetching audio analysis for song 1:', error);
            } else if (body && body.beats && Array.isArray(body.beats)) {
              for (var i = 0; i < body.beats.length; i++) {
                beat_times.push(body.beats[i].start);
              }
              console.log('Successfully processed beats data for song 1');
            } else {
              console.log('Invalid or missing beats data for song 1. Using dummy data.');
              // Generate some dummy beat times if the API doesn't return the expected data
              for (var i = 0; i < 200; i++) {
                beat_times.push(i * 0.5); // Generate beats every 0.5 seconds
              }
            }

            var tempo = 120; // Default tempo if not available
            if (body && body.track && body.track.tempo) {
              tempo = parseFloat(body.track.tempo);
            }
            
            // Second song analysis
            var fetchOptions1 = {
              url: 'https://api.spotify.com/v1/audio-analysis/6F5c58TMEs1byxUstkzVeM',
              headers: {
                'Authorization': 'Bearer ' + access_token
              },
              json: true
            };
            
            request.get(fetchOptions1, function (error, response, body) {
              var beat_times1 = [];
              if (error) {
                console.error('Error fetching audio analysis for song 2:', error);
              } else if (body && body.beats && Array.isArray(body.beats)) {
                for (var i = 0; i < body.beats.length; i++) {
                  beat_times1.push(body.beats[i].start);
                }
                console.log('Successfully processed beats data for song 2');
              } else {
                console.log('Invalid or missing beats data for song 2. Using dummy data.');
                // Generate some dummy beat times if the API doesn't return the expected data
                for (var i = 0; i < 200; i++) {
                  beat_times1.push(i * 0.3); // Generate beats every 0.3 seconds
                }
              }
              
              var tempo1 = 180; // Default tempo if not available
              if (body && body.track && body.track.tempo) {
                tempo1 = parseFloat(body.track.tempo);
              }
              
              // Third song analysis
              var fetchOptions2 = {
                url: 'https://api.spotify.com/v1/audio-analysis/2nLtzopw4rPReszdYBJU6h',
                headers: {
                  'Authorization': 'Bearer ' + access_token
                },
                json: true
              };
              
              request.get(fetchOptions2, function (error, response, body) {
                var beat_times2 = [];
                if (error) {
                  console.error('Error fetching audio analysis for song 3:', error);
                } else if (body && body.beats && Array.isArray(body.beats)) {
                  for (var i = 0; i < body.beats.length; i++) {
                    beat_times2.push(body.beats[i].start);
                  }
                  console.log('Successfully processed beats data for song 3');
                } else {
                  console.log('Invalid or missing beats data for song 3. Using dummy data.');
                  // Generate some dummy beat times if the API doesn't return the expected data
                  for (var i = 0; i < 200; i++) {
                    beat_times2.push(i * 0.4); // Generate beats every 0.4 seconds
                  }
                }
                
                var tempo2 = 110; // Default tempo if not available
                if (body && body.track && body.track.tempo) {
                  tempo2 = parseFloat(body.track.tempo);
                }
                
                // Prepare data to write to file
                var write_data = {
                  "tempo": tempo,
                  "tempo1": tempo1,
                  "tempo2": tempo2,
                  "beats": beat_times,
                  "beats1": beat_times1,
                  "beats2": beat_times2
                };
                
                // Make sure the directory exists
                const dataDir = 'public/assets/data';
                if (!fs.existsSync(dataDir)) {
                  console.log('Creating data directory...');
                  fs.mkdirSync(dataDir, { recursive: true });
                }
                
                // Write the data to file
                fs.writeFile('public/assets/data/info.json', JSON.stringify(write_data), (err) => {
                  if (err) {
                    console.error('Error writing info.json:', err);
                  } else {
                    console.log('Successfully wrote beats data to info.json');
                  }
                  
                  // Redirect to game page
                  res.redirect('/game.html');
                });
              });
            });
          });
        });
      } else {
        console.log(error);
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/fetch', (req, res) => {
  var fetchOptions = {
    url: 'https://api.spotify.com/v1/audio-analysis/11dFghVXANMlKmJXsNCbNl',
    headers: {
      'Authorization': 'Bearer ' + acc_token
    },
    json: true
  };
  
  request.get(fetchOptions, function (error, response, body) {
    if (error) {
      console.error('Error fetching audio analysis:', error);
      res.status(500).json({ error: 'Failed to fetch audio analysis' });
    } else if (body && body.track && body.track.tempo) {
      console.log(body.track.tempo);
      tempo = parseFloat(body.track.tempo);
      res.status(200).json(body.track.tempo);
    } else {
      console.log('Invalid response format from Spotify API');
      res.status(500).json({ error: 'Invalid response format from Spotify API' });
    }
  });
});

app.listen(port);
console.log('server on ' + port);