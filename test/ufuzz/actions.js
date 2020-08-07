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

var in_progress = 0, queued = 0;
process.on("beforeExit", function() {
    if (queued > 3) {
        process.stdout.write("0");
    } else {
        process.stdout.write(Math.min(1000 * 20 / in_progress, 1500).toFixed(0));
    }
});
read(base + "/actions/workflows/ufuzz.yml/runs", function(reply) {
    reply.workflow_runs.filter(function(workflow) {
        return /^(in_progress|queued|)$/.test(workflow.status);
    }).forEach(function(workflow) {
        read(workflow.jobs_url, function(reply) {
            reply.jobs.forEach(function(job) {
                switch (job.status) {
                  case "in_progress":
                    in_progress++;
                    break;
                  case "queued":
                    queued++;
                    break;
                }
            });
        });
    });
});
