simple: {
    input: {
        console.log(`foo
        bar\nbaz`);
    }
    expect_exact: "console.log(`foo\n        bar\\nbaz`);"
    expect_stdout: [
        "foo",
        "        bar",
        "baz",
    ]
    node_version: ">=4"
}

placeholder: {
    input: {
        console.log(`foo ${ function(a, b) {
            return a * b;
        }(6, 7) }`);
    }
    expect_exact: "console.log(`foo ${function(a,b){return a*b}(6,7)}`);"
    expect_stdout: "foo 42"
    node_version: ">=4"
}

nested: {
    input: {
        console.log(`P${`A${"S"}`}S`);
    }
    expect_exact: 'console.log(`P${`A${"S"}`}S`);'
    expect_stdout: "PASS"
    node_version: ">=4"
}

tagged: {
    input: {
        console.log(String.raw`foo\nbar`);
    }
    expect_exact: "console.log(String.raw`foo\\nbar`);"
    expect_stdout: "foo\\nbar"
    node_version: ">=4"
}

tagged_chain: {
    input: {
        function f(strings) {
            return strings.join("") || f;
        }
        console.log(f```${42}``pass`.toUpperCase());
    }
    expect_exact: 'function f(strings){return strings.join("")||f}console.log(f```${42}``pass`.toUpperCase());'
    expect_stdout: "PASS"
    node_version: ">=4"
}

malformed_escape: {
    input: {
        (function(s) {
            s.forEach((c, i) => console.log(i, c, s.raw[i]));
            return () => console.log(arguments);
        })`\uFo${42}`();
    }
    expect_exact: "(function(s){s.forEach((c,i)=>console.log(i,c,s.raw[i]));return()=>console.log(arguments)})`\\uFo${42}`();"
    expect_stdout: true
    node_version: ">=4"
}

evaluate: {
    options = {
        evaluate: true,
    }
    input: {
        console.log(`foo ${ function(a, b) {
            return a * b;
        }(6, 7) }`);
    }
    expect: {
        console.log(`foo ${42}`);
    }
    expect_stdout: "foo 42"
    node_version: ">=4"
}
