var fs = require('fs');

var username = process.env.LOGNAME;

// The name of the momentum directory may change over time due to updates, 
// so it's better not to hard code it.

var directory = fs.readdirSync('/Users/Sean/Library/Application\ Support/Google/Chrome/Default/Extensions/laookkfknpbbblfpciffpaejjkokdgca')[0];

var momentumPath = '/Users/Sean/Library/Application\ Support/Google/Chrome/Default/Extensions/laookkfknpbbblfpciffpaejjkokdgca/' + directory + '/';
var localStorage = '/Users/Sean/Library/Application\ Support/Google/Chrome/Default/Local\ Storage/chrome-extension_laookkfknpbbblfpciffpaejjkokdgca_0.localstorage';

module.exports = {
  momentumPath: momentumPath, 
  localStorage: localStorage
};
