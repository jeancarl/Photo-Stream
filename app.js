// Filename: app.js

var PORT = 8080;
var MONGODB_ADDRESS = 'mongodb://127.0.0.1:27017/test';
var UPLOADS_DIR = 'uploads';

var express = require('express');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var fs = require('fs');
var url = require('url');
var mongoose = require('mongoose');

var app = express();
app.listen(PORT);

mongoose.connect(MONGODB_ADDRESS);

var PhotoModel = mongoose.model('Photos', {
  email: String,
  title: String,
  caption: String,
  image: String,
  timeCreated: Number
});

app.post('/api/incoming', function(req, res) {
  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {
    var timeNow = new Date();

    for(var attachment in files) {
      fs.readFile(files[attachment].path, function (err, data) {
        var filename = fields.sender.replace(/[^A-Za-z0-9]/g, '')+fields.token+attachment;

        fs.writeFile(__dirname+'/public/'+UPLOADS_DIR+'/'+filename, data, function (err) {
          PhotoModel.create({
            email: fields.sender,
            title: fields.subject,
            caption: fields['stripped-text'],
            image: filename,
            timeCreated: timeNow.getTime()
          }, function(err, doc) {
            console.log(doc);
          });

        });
      });
    }

    res.send('success');
  });
});

app.get('/api/uploads', function(req, res) {
  var query = url.parse(req.url, true).query;
  PhotoModel.find({email:query.email}).sort({timeCreated: -1}).exec(function(err, photos) {
    if(err) {
      res.send([]);
      return;
    }  

    var results = [];

    for(var i in photos) {
      results.push({
        title: photos[i].title,
        caption: photos[i].caption.replace(/\n/g, '<br />'),
        url: '/+'UPLOADS_DIR'+/'+photos[i].image,
        timeCreated: photos[i].timeCreated
      });
    }

    res.send(results);
  });
});

app.get('/api/users', function(req, res) {
  PhotoModel.aggregate([
      {'$sort': {'email': 1, 'timeCreated': -1}},
      {'$group': {
          '_id': '$email', 
          'email': {'$first':'$email'}, 
          'url': {'$first':'$image'},
          'title': {'$first':'$title'},
          'caption': {'$first':'$caption'}
      }}
    ], function(err, docs) {
      if(err) {
        res.send([]);
        return;
      }  

      var results = [];
      for(var i in docs) {
        results.push({
          email: docs[i].email,
          url: '/'+UPLOADS_DIR+'/'+docs[i].url,
          title: docs[i].title,
          caption: docs[i].caption.replace(/\n/g, '<br />'),
        });
      }
      res.send(results);
    });
});

app.use(express.static(__dirname + '/public'));

console.log('Application listening on port '+PORT);