var fs = require("fs");
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
        require(url.slice(0, url.indexOf(":"))).get(url, function(res) {
            if (res.statusCode !== 200) return callback(res);
            res.pipe(fs.createWriteStream(local(url)).on("close", function() {
                callback(null, read(url));
            }));
        });
    }).on("open", function() {
        callback(null, result);
    });
};
