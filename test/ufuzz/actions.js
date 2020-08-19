require("../../tools/exit");

var get = require("https").get;
var parse = require("url").parse;
var base = process.argv[2];
var token = process.argv[3];

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

var queued = 0, total = 0, earliest, now = Date.now();
process.on("beforeExit", function() {
    if (queued > 3) {
        process.stdout.write("0");
    } else if (now - earliest > 0 && total > 1) {
        process.stdout.write(Math.min(20 * (now - earliest) / (total - 1), 6300000).toFixed(0));
    } else {
        process.stdout.write("3600000");
    }
});
read(base + "/actions/workflows/ufuzz.yml/runs?event=schedule", function(reply) {
    reply.workflow_runs.filter(function(workflow) {
        return /^(in_progress|queued|)$/.test(workflow.status);
    }).forEach(function(workflow) {
        read(workflow.jobs_url, function(reply) {
            reply.jobs.forEach(function(job) {
                if (job.status == "queued") queued++;
                total++;
                if (!job.started_at) return;
                var start = new Date(job.started_at);
                if (!(earliest < start)) earliest = start;
            });
        });
    });
});
