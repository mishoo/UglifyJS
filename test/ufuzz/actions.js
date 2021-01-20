var get = require("https").get;
var parse = require("url").parse;

var base, token, run_number, eldest = true;
exports.init = function(url, auth, num) {
    base = url;
    token = auth;
    run_number = num;
};
exports.should_stop = function(callback) {
    read(base + "/actions/runs?per_page=100", function(reply) {
        if (!reply || !Array.isArray(reply.workflow_runs)) return;
        var runs = reply.workflow_runs.sort(function(a, b) {
            return b.run_number - a.run_number;
        });
        var found = false, remaining = 20;
        (function next() {
            var workflow;
            do {
                workflow = runs.pop();
                if (!workflow) return;
                if (workflow.event == "schedule" && workflow.run_number == run_number) found = true;
            } while (!found && workflow.status == "completed");
            read(workflow.jobs_url, function(reply) {
                if (!reply || !Array.isArray(reply.jobs)) return;
                if (!reply.jobs.every(function(job) {
                    if (job.status == "completed") return true;
                    remaining--;
                    return found || workflow.event != "schedule";
                })) return;
                if (remaining >= 0) {
                    next();
                } else {
                    callback();
                }
            });
        })();
    });
};

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
                reply = JSON.parse(chunks.join(""))
            } catch (e) {}
            done(reply);
        }).on("error", function() {
            done();
        });
    }).on("error", function() {
        done();
    });
}
