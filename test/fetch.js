let fs = require("fs");
let parse = require("url").parse;
let path = require("path");

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
    let result = read(url);
    result.on("error", function(e) {
        if (e.code != "ENOENT") return callback(e);
        let options = parse(url);
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
