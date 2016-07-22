#!/usr/bin/env node

/* 
 * Setting the current background in the Momentum dash extension as the desktop wallpaper
 * Works only in Mac (right now)
*/

var fs = require('fs');
var wallpaper = require('wallpaper');
var sqlite3 = require("sqlite3").verbose();
var directories = require('./directories');
var https = require('https');
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');

var localStorage = directories.localStorage;
var momentumPath = directories.momentumPath;
var lastDatePath = '/last-date';

var db = new sqlite3.Database(localStorage);

var date = buildDate();
var data = {};
getQuoteJSON(date, function(json) {
  data.quote = JSON.parse(json);
  getWallpaperJSON(date, function(json) {
    data.bg = JSON.parse(json);
    if (getLastDate() !== date) {
      setWallpaper(data.bg, function() {
        setLastDate(date);
      });
    }
    console.log(JSON.stringify(data));
  });
});





function getQuoteJSON(date, callback) {
  var key = 'momentum-quote-' + date;
  db.serialize(function() {
    db.each("SELECT value FROM ItemTable WHERE key = '" + key + "'", function(err, row) {
      callback(row.value.toString().replace(/[^\w\s",\-\%:\/\?\.\}\{\=\&]/g, ''));
    });
  });
}

function getWallpaperJSON(date, callback) {
  var key = 'momentum-background-' + date;
  db.serialize(function() {
    db.each("SELECT value FROM ItemTable WHERE key = '" + key + "'", function(err, row) {
      callback(row.value.toString().replace(/[^\w\s",\-\%:\/\?\.\}\{\=\&]/g, ''));
    });
  });
}

function setWallpaper(background, callback) {
  var wallpaper = background.filename;
  var path;
  if ( wallpaper.match(/http/) ) {
    path = '/Users/Sean/Pictures/momentum/' + date + '.jpg';
    var file = fs.createWriteStream(path);
    var req = https.get(wallpaper, function(response) {
      response.pipe(file);
      response.on('end', function() {
        set(path); 
        callback();                        
      });           
    });
  } else {
    path = momentumPath + wallpaper;
    set(path);
    callback();
  }
}

function set(path) {
  wallpaper.set(path, function (err) {});
}

function getLastDate() {
  try {
   return fs.readFileSync(__dirname + lastDatePath).toString();
 } catch (e) {
    return null;
  }
}

function setLastDate(date) {
  fs.writeFileSync(__dirname + lastDatePath, date);
}

function buildDate() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  month = month % 10 == month ? '0' + month : month; 
  var date = now.getDate();
  if (now.getHours() <= 4) {
    date = date - 1;
  }
  date = date % 10 == date ? '0' + date : date;
  return year + '-' + month + '-' + date;
}
