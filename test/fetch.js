var fs = require("fs");
var parse = require("url").parse;
var path = require("path");

try {
    fs.mkdirSync("./tmp");
} catch (e) {
    if (e.code != "EEXIST") throw e;
}

function local(url) {
    return path.join("./tmp", encodeURIComponent(url));
}

function read(url) {
    return fs.createReadStream(local(url));
}

module.exports = function(url, callback) {
    var result = read(url);
    result.on("error", function(e) {
        if (e.code != "ENOENT") return callback(e);
        var options = parse(url);
        options.rejectUnauthorized = false;
        require(options.protocol.slice(0, -1)).get(options, function(res) {
            if (res.statusCode !== 200) return callback(res.statusCode);
            res.pipe(fs.createWriteStream(local(url)));
            callback(null, res);
        });
    }).on("open", function() {
        callback(null, result);
    });
};
