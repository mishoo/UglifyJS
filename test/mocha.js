var Mocha = require('mocha'),
    fs = require('fs'),
    path = require('path');

// Instantiate a Mocha instance.
var mocha = new Mocha({});

var testDir = __dirname + '/mocha/';

// Add each .js file to the mocha instance
fs.readdirSync(testDir).filter(function(file){
    // Only keep the .js files
    return file.substr(-3) === '.js';

}).forEach(function(file){
    mocha.addFile(
        path.join(testDir, file)
    );
});

module.exports = function() {
    mocha.run(function(failures) {
        if (failures !== 0) {
            process.on('exit', function () {
                process.exit(failures);
            });
        }
    });
};