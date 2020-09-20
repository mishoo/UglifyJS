require("../../tools/exit");

var get = require("https").get;
var parse = require("url").parse;
var base = process.argv[2];
var token = process.argv[3];
var queued = 0, total = 0, earliest, now = Date.now();
process.on("beforeExit", function() {
    if (queued > 3) {
        process.stdout.write("0");
    } else {
        var average = total > 2 && (now - earliest) / (total - 1);
        process.stdout.write(Math.min(Math.max(20 * average, 2700000), 18000000).toFixed(0));
    }
});
read(base + "/actions/workflows/ufuzz.yml/runs?event=schedule", function(reply) {
    check(reply, "workflow_runs").filter(function(workflow) {
        return /^(in_progress|queued|)$/.test(workflow.status);
    }).forEach(function(workflow) {
        read(workflow.jobs_url, function(reply) {
            check(reply, "jobs").forEach(function(job) {
                if (job.status == "queued") queued++;
                total++;
                var start = Date.parse(job.started_at);
                if (!(earliest < start)) earliest = start;
            });
        });
    });
});

function read(url, callback) {
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
            callback(JSON.parse(chunks.join("")));
        });
    });
}

function check(reply, field) {
    return reply && Array.isArray(reply[field]) ? reply[field] : [];
}
