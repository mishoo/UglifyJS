var fs = require("fs");

var config = {
    timeout: function(limit) {
        this.limit = limit + lag;
    },
};
var lag = +process.env["UGLIFY_GITHUB_LAG"] || 0;
var tasks = [];
var titles = [];
config.timeout(10000);
describe = function(title, fn) {
    config = Object.create(config);
    titles.push(title);
    fn.call(config);
    titles.pop();
    config = Object.getPrototypeOf(config);
};
it = function(title, fn) {
    fn.limit = config.limit;
    fn.titles = titles.slice();
    fn.titles.push(title);
    tasks.push(fn);
};
(function(arg) {
    return arg ? [ arg ] : fs.readdirSync("test/mocha").filter(function(file) {
        return /\.js$/.test(file);
    });
})(process.argv[2]).forEach(function(file) {
    require("./mocha/" + file);
});

function log_titles(log, current, marker) {
    var indent = "";
    var writing = false;
    for (var i = 0; i < current.length; i++, indent += "  ") {
        if (titles[i] != current[i]) writing = true;
        if (writing) log(indent + (i == current.length - 1 && marker || "") + current[i]);
    }
    titles = current;
}

function red(text) {
    return "\u001B[31m" + text + "\u001B[39m";
}

function green(text) {
    return "\u001B[32m" + text + "\u001B[39m";
}

var errors = [];
var total = tasks.length;
titles = [];
process.nextTick(function run() {
    var task = tasks.shift();
    if (task) try {
        var elapsed = Date.now();
        var timer;
        var done = function() {
            elapsed = Date.now() - elapsed;
            if (elapsed > task.limit) {
                throw new Error("Timed out: " + elapsed + "ms > " + task.limit + "ms");
            }
            reset();
            log_titles(console.log, task.titles, green('\u221A '));
            process.nextTick(run);
        };
        if (task.length) {
            task.timeout = function(limit) {
                clearTimeout(timer);
                limit += lag;
                task.limit = limit;
                timer = setTimeout(function() {
                    raise(new Error("Timed out: exceeds " + limit + "ms"));
                }, limit);
            };
            task.timeout(task.limit - lag);
            process.on("uncaughtException", raise);
            task.call(task, done);
        } else {
            task.timeout = config.timeout;
            task.call(task);
            done();
        }
    } catch (err) {
        raise(err);
    } else if (errors.length) {
        console.error();
        console.log(red(errors.length + " test(s) failed!"));
        titles = [];
        errors.forEach(function(titles, index) {
            console.error();
            log_titles(console.error, titles, (index + 1) + ") ");
            var lines = titles.error.stack.split('\n');
            console.error(red(lines[0]));
            console.error(lines.slice(1).join("\n"));
        });
        process.exit(1);
    } else {
        console.log();
        console.log(green(total + " test(s) passed."));
    }

    function raise(err) {
        reset();
        task.titles.error = err;
        errors.push(task.titles);
        log_titles(console.log, task.titles, red('\u00D7 '));
        process.nextTick(run);
    }

    function reset() {
        clearTimeout(timer);
        done = function() {};
        process.removeListener("uncaughtException", raise);
    }
});
