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

var localStorage = directories.localStorage;
var momentumPath = directories.momentumPath;
var lastDatePath = '/last-date';

var db = new sqlite3.Database(localStorage);

var date = buildDate();
getQuoteJSON(date, function(json) { console.log(json); });

if (getLastDate() !== date) {
  setLastDate(date);
  setWallpaper(date, function() {
    process.exit();
  });
}

function getQuoteJSON(date, callback) {
  var key = 'momentum-quote-' + date;
  db.serialize(function() {
    db.each("SELECT value FROM ItemTable WHERE key = '" + key + "'", function(err, row) {
      callback(row.value.toString().replace(/\u0000/g, ''));
    });
  });
}

function setWallpaper(date, callback) {
    var key = 'momentum-background-' + date;
    db.serialize(function() {
      db.each("SELECT value FROM ItemTable WHERE key = '" + key + "'", function(err, row) {
        var background = JSON.parse(row.value.toString().replace(/\u0000/g, '')).filename;
        var path;
        if ( background.match(/http/) ) {
          path = '/Users/Sean/Pictures/momentum/' + date + '.jpg';
          var file = fs.createWriteStream(path);
          var req = https.get(background, function(response) {
            response.pipe(file);
            response.on('end', function() {
              set(path);                         
            });           
          });
        } else {
          path = momentumPath + background;
          set(path);
        }
      });
    });
}

function set(path) {
  wallpaper.set(path, function (err) {
        console.log(err);
  });
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
  date = date % 10 == date ? '0' + date : date;
  return year + '-' + month + '-' + date;
}
