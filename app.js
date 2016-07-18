#!/usr/bin/env node

/* 
 * Setting the current background in the Momentum dash extension as the desktop wallpaper
 * Works only in Mac (right now)
*/

var fs = require('fs');

if (process.argv[2] == 'stop') {
  var pid = Number(fs.readFileSync(__dirname + '/pid').toString());
  console.log('Stopping the momentum-wallpapers daemon.');
  try {
    process.kill(pid, 'SIGUSR1');
  }
  catch (err) {
    console.log('Error: Daemon already stopped or was never launched.');
  }
  process.exit();
}

console.log('momentum-wallpapers now running in the background.');
console.log('Type "momentum-wallpapers stop" to stop it.');
require('daemon')();

process.on('SIGUSR1', function() {
  process.exit();
});

fs.writeFileSync(__dirname + '/pid', process.pid);

var wallpaper = require('wallpaper');
var sqlite3 = require("sqlite3").verbose();
var directories = require('./directories');

var date = 0;

function setWallpaper() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  month = month % 10 == month ? '0' + month : month; 
  var newDate = now.getDate();

  if (date != newDate) {
    date = newDate;
    date = date % 10 == date ? '0' + date : date;
    var key = 'momentum-background-' + year + '-' + month + '-' + date;

    var localStorage = directories.localStorage;
    var momentumPath = directories.momentumPath;

    var db = new sqlite3.Database(localStorage);

    db.serialize(function() {
      db.each("SELECT value FROM ItemTable WHERE key = '" + key + "'", function(err, row) {
        var background = JSON.parse(row.value.toString().replace(/\u0000/g, '')).filename;
        var path = momentumPath + background;
        wallpaper.set(path, function (err) {
          if (!err)
            console.log('Wallpaper set.');
        });

      });
    });

    db.close();
  }
}

setWallpaper();
setInterval(setWallpaper, 1000 * 60);
