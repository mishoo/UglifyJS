var get = require("https").get;
var parse = require("url").parse;

var base, token, run_number;
var expires = Date.now() + (6 * 60 - 10) * 60 * 1000;
exports.init = function(url, auth, num) {
    base = url;
    token = auth;
    run_number = num;
};
exports.should_stop = function(callback) {
    if (Date.now() > expires) return callback();
    read(base + "/actions/runs?per_page=100", function(reply) {
        var runs = verify(reply, "workflow_runs").filter(function(workflow) {
            return workflow.status != "completed";
        }).sort(function(a, b) {
            return b.run_number - a.run_number;
        });
        var found = false, remaining = 20;
        (function next() {
            var workflow;
            do {
                workflow = runs.pop();
                if (!workflow) return;
                if (!is_cron(workflow)) break;
                if (workflow.run_number == run_number) found = true;
            } while (!found);
            read(workflow.jobs_url, function(reply) {
                verify(reply, "jobs").forEach(function(job) {
                    if (job.status != "completed") remaining--;
                });
                if (remaining >= 0) {
                    next();
                } else {
                    callback();
                }
            });
        })();
    });
};

function is_cron(workflow) {
    return /^(schedule|workflow_dispatch|workflow_run)$/.test(workflow.event);
}

function read(url, callback) {
    var done = function(reply) {
        done = function() {};
        callback(reply);
    };
    var options = parse(url);
    options.headers = {
        "Authorization": "Token " + token,
        "User-Agent": "UglifyJS",
    };
    get(options, function(response) {
        var chunks = [];
        response.setEncoding("utf8");
        response.on("data", function(chunk) {
            chunks.push(chunk);
        }).on("end", function() {
            var reply;
            try {
                reply = JSON.parse(chunks.join(""));
            } catch (e) {}
            done(reply);
        }).on("error", function() {
            done();
        });
    }).on("error", function() {
        done();
    });
}

function verify(reply, field) {
    if (!reply) return [];
    var values = reply[field];
    if (!Array.isArray(values)) return [];
    return values.filter(function(value) {
        return value;
    });
}
