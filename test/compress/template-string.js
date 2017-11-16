template_strings: {
    beautify = {
        quote_style: 3
    }
    input: {
        ``;
        `xx\`x`;
        `${ foo + 2 }`;
        ` foo ${ bar + `baz ${ qux }` }`;
    }
    expect_exact: "``;`xx\\`x`;`${foo+2}`;` foo ${bar+`baz ${qux}`}`;";
}

template_string_prefixes: {
    beautify = {
        quote_style: 3
    }
    input: {
        String.raw`foo`;
        foo `bar`;
    }
    expect_exact: "String.raw`foo`;foo`bar`;";
}

template_strings_ascii_only: {
    beautify = {
        ascii_only: true,
        quote_style: 3
    }
    input: {
        var foo = `foo
        bar
        ↂωↂ`;
        var bar = `\``;
    }
    expect_exact: "var foo=`foo\\n        bar\\n        \\u2182\\u03c9\\u2182`;var bar=`\\``;"
}

template_strings_without_ascii_only: {
    beautify = {
        quote_style: 3
    }
    input: {
        var foo = `foo
        bar
        ↂωↂ`
    }
    expect_exact: "var foo=`foo\\n        bar\\n        ↂωↂ`;"
}

template_string_with_constant_expression: {
    options = {
        evaluate: true
    }
    beautify = {
        quote_style: 3
    }
    input: {
        var foo = `${4 + 4} equals 4 + 4`;
    }
    expect: {
        var foo = "8 equals 4 + 4";
    }
}

template_string_with_predefined_constants: {
    options = {
        evaluate: true
    }
    beautify = {
        quote_style: 3
    }
    input: {
        var foo = `This is ${undefined}`;
        var bar = `This is ${NaN}`;
        var baz = `This is ${null}`;
        var foofoo = `This is ${Infinity}`;
        var foobar = "This is ${1/0}";
        var foobaz = 'This is ${1/0}';
        var barfoo = "This is ${NaN}";
        var bazfoo = "This is ${null}";
        var bazbaz = `This is ${1/0}`;
        var barbar = `This is ${0/0}`;
        var barbar = "This is ${0/0}";
        var barber = 'This is ${0/0}';

        var a = `${4**11}`; // 8 in template vs 7 chars - 4194304
        var b = `${4**12}`; // 8 in template vs 8 chars - 16777216
        var c = `${4**14}`; // 8 in template vs 9 chars - 268435456
    }
    expect: {
        var foo = "This is undefined";
        var bar = "This is NaN";
        var baz = "This is null";
        var foofoo = `This is ${1/0}`;
        var foobar = "This is ${1/0}";
        var foobaz = 'This is ${1/0}';
        var barfoo = "This is ${NaN}";
        var bazfoo = "This is ${null}";
        var bazbaz = `This is ${1/0}`;
        var barbar = "This is NaN";
        var barbar = "This is ${0/0}";
        var barber = 'This is ${0/0}';

        var a = "4194304";
        var b = "16777216"; // Potential for further concatentation
        var c = `${4**14}`; // Not worth converting
    }
}

template_string_evaluate_with_many_segments: {
    options = {
        evaluate: true
    }
    beautify = {
        quote_style: 3
    }
    input: {
        var foo = `Hello ${guest()}, welcome to ${location()}${"."}`;
        var bar = `${1}${2}${3}${4}${5}${6}${7}${8}${9}${0}`;
        var baz = `${foobar()}${foobar()}${foobar()}${foobar()}`;
        var buzz = `${1}${foobar()}${2}${foobar()}${3}${foobar()}`;
    }
    expect: {
        var foo = `Hello ${guest()}, welcome to ${location()}.`;
        var bar = "1234567890";
        var baz = `${foobar()}${foobar()}${foobar()}${foobar()}`;
        var buzz = `1${foobar()}2${foobar()}3${foobar()}`;
    }
}

template_string_with_many_segments: {
    beautify = {
        quote_style: 3
    }
    input: {
        var foo = `Hello ${guest()}, welcome to ${location()}${"."}`;
        var bar = `${1}${2}${3}${4}${5}${6}${7}${8}${9}${0}`;
        var baz = `${foobar()}${foobar()}${foobar()}${foobar()}`;
        var buzz = `${1}${foobar()}${2}${foobar()}${3}${foobar()}`;
    }
    expect: {
        var foo = `Hello ${guest()}, welcome to ${location()}${"."}`;
        var bar = `${1}${2}${3}${4}${5}${6}${7}${8}${9}${0}`;
        var baz = `${foobar()}${foobar()}${foobar()}${foobar()}`;
        var buzz = `${1}${foobar()}${2}${foobar()}${3}${foobar()}`;
    }
}

template_string_to_normal_string: {
    options = {
        evaluate: true
    }
    beautify = {
        quote_style: 0
    }
    input: {
        var foo = `This is ${undefined}`;
        var bar = "Decimals " + `${1}${2}${3}${4}${5}${6}${7}${8}${9}${0}`;
    }
    expect: {
        var foo = "This is undefined";
        var bar = "Decimals 1234567890";
    }
}

template_concattenating_string: {
    options = {
        evaluate: true
    }
    beautify = {
        quote_style: 3 // Yes, keep quotes
    }
    input: {
        var foo = "Have a nice " + `day. ${`day. ` + `day.`}`;
        var bar = "Have a nice " + `${day()}`;
    }
    expect: {
        var foo = "Have a nice day. day. day.";
        var bar = "Have a nice " + `${day()}`;
    }
}

evaluate_nested_templates: {
    options = {
        evaluate: true
    }
    beautify = {
        quote_style: 0
    }
    input: {
        var baz = `${`${`${`foo`}`}`}`;
    }
    expect: {
        var baz = "foo";
    }
}

enforce_double_quotes: {
    beautify = {
        quote_style: 1
    }
    input: {
        var foo = `Hello world`;
        var bar = `Hello ${'world'}`;
        var baz = `Hello ${world()}`;
    }
    expect: {
        var foo = `Hello world`;
        var bar = `Hello ${"world"}`;
        var baz = `Hello ${world()}`;
    }
}

enforce_single_quotes: {
    beautify = {
        quote_style: 2
    }
    input: {
        var foo = `Hello world`;
        var bar = `Hello ${"world"}`;
        var baz = `Hello ${world()}`;
    }
    expect: {
        var foo = `Hello world`;
        var bar = `Hello ${'world'}`;
        var baz = `Hello ${world()}`;
    }
}

enforce_double_quotes_and_evaluate: {
    beautify = {
        quote_style: 1
    }
    options = {
        evaluate: true
    }
    input: {
        var foo = `Hello world`;
        var bar = `Hello ${'world'}`;
        var baz = `Hello ${world()}`;
    }
    expect: {
        var foo = "Hello world";
        var bar = "Hello world";
        var baz = `Hello ${world()}`;
    }
}

enforce_single_quotes_and_evaluate: {
    beautify = {
        quote_style: 2
    }
    options = {
        evaluate: true
    }
    input: {
        var foo = `Hello world`;
        var bar = `Hello ${"world"}`;
        var baz = `Hello ${world()}`;
    }
    expect: {
        var foo = "Hello world";
        var bar = "Hello world";
        var baz = `Hello ${world()}`;
    }
}

respect_inline_script: {
    beautify = {
        inline_script: true,
        quote_style: 3
    }
    input: {
        var foo = `</script>${content}`;
        var bar = `<!--`;
        var baz = `-->`;
    }
    expect_exact: "var foo=`<\\/script>${content}`;var bar=`\\x3c!--`;var baz=`--\\x3e`;";
}

do_not_optimize_tagged_template_1: {
    beautify = {
        quote_style: 0
    }
    options = {
        evaluate: true
    }
    input: {
        var foo = tag`Shall not be optimized. ${"But " + "this " + "is " + "fine."}`;
        var bar = tag`Don't even mind changing my quotes!`;
    }
    expect_exact:
        'var foo=tag`Shall not be optimized. ${"But this is fine."}`;var bar=tag`Don\'t even mind changing my quotes!`;';
}

do_not_optimize_tagged_template_2: {
    options = {
        evaluate: true
    }
    input: {
        var foo = tag`test` + " something out";
    }
    expect_exact: 'var foo=tag`test`+" something out";';
}

keep_raw_content_in_tagged_template: {
    options = {
        evaluate: true
    }
    input: {
        var foo = tag`\u0020\u{20}\u{00020}\x20\40\040 `;
    }
    expect_exact: "var foo=tag`\\u0020\\u{20}\\u{00020}\\x20\\40\\040 `;";
}

allow_chained_templates: {
    input: {
        var foo = tag`a``b``c``d`;
    }
    expect: {
        var foo = tag`a``b``c``d`;
    }
}

check_escaped_chars: {
    input: {
        var foo = `\u0020\u{20}\u{00020}\x20\40\040 `;
    }
    expect_exact: "var foo=`       `;";
}

escape_dollar_curly: {
    options = {
        evaluate: true
    }
    input: {
        console.log(`\$\{ beep \}`)
        console.log(`${1-0}\${2-0}$\{3-0}${4-0}`)
        console.log(`$${""}{not an expression}`)
    }
    expect_exact: 'console.log("${ beep }");console.log("1${2-0}${3-0}4");console.log("${not an expression}");'
}

template_starting_with_newline: {
    options = {
        dead_code: true
    }
    input: {
        function foo(e) {
            return `
this is a template string!`;
        };
    }
    expect_exact: "function foo(e){return`\\nthis is a template string!`}"
}

template_with_newline: {
    options = {
        dead_code: true
    }
    input: {
        function foo(e) {
            return `yep,
this is a template string!`;
        };
    }
    expect_exact: "function foo(e){return`yep,\\nthis is a template string!`}"
}

template_ending_with_newline: {
    options = {
        dead_code: true
    }
    input: {
        function foo(e) {
            return `this is a template string!
`;
        };
    }
    expect_exact: "function foo(e){return`this is a template string!\\n`}"
}

issue_1856: {
    beautify = {
        ascii_only: false,
    }
    input: {
        console.log(`\\n\\r\\u2028\\u2029\n\r\u2028\u2029`);
    }
    expect_exact: "console.log(`\\\\n\\\\r\\\\u2028\\\\u2029\\n\\r\\u2028\\u2029`);"
}

issue_1856_ascii_only: {
    beautify = {
        ascii_only: true,
    }
    input: {
        console.log(`\\n\\r\\u2028\\u2029\n\r\u2028\u2029`);
    }
    expect_exact: "console.log(`\\\\n\\\\r\\\\u2028\\\\u2029\\n\\r\\u2028\\u2029`);"
}

side_effects: {
    options = {
        evaluate: true,
        side_effects: true,
    }
    input: {
        `t1`;
        tag`t2`;
        `t${3}`;
        tag`t${4}`;
        console.log(`
t${5}`);
        function f(a) {
            `t6${a}`;
            a = `t7${a}` & a;
            a = `t8${b}` | a;
            a = f`t9${a}` ^ a;
        }
    }
    expect: {
        tag`t2`;
        tag`t${4}`;
        console.log("\nt5");
        function f(a) {
            a &= `t7${a}`;
            a = `t8${b}` | a;
            a = f`t9${a}` ^ a;
        }
    }
}

simple_string: {
    options = {
        computed_props: true,
        evaluate: true,
        properties: true,
    }
    input: {
        console.log({[`foo`]: 1}[`foo`], `hi` == "hi", `world`);
    }
    expect: {
        console.log([ 1 ][0], true, "world");
    }
    expect_stdout: "1 true 'world'"
    node_version: ">=4"
}

semicolons: {
    beautify = {
        semicolons: false,
    }
    input: {
        foo;
        `bar`;
    }
    expect_exact: "foo;`bar`\n"
}

regex_1: {
    input: {
        console.log(`${/a/} ${6/2} ${/b/.test("b")} ${1?/c/:/d/}`);
    }
    expect_exact: 'console.log(`${/a/} ${6/2} ${/b/.test("b")} ${1?/c/:/d/}`);'
    expect_stdout: "/a/ 3 true /c/"
    node_version: ">=4"
}

regex_2: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        console.log(`${/a/} ${6/2} ${/b/.test("b")} ${1?/c/:/d/}`);
    }
    expect: {
        console.log("/a/ 3 true /c/");
    }
    expect_stdout: "/a/ 3 true /c/"
    node_version: ">=4"
}

sequence_1: {
    input: {
        console.log(`${1,2} ${/a/,/b/}`);
    }
    expect_exact: 'console.log(`${1,2} ${/a/,/b/}`);'
    expect_stdout: "2 /b/"
    node_version: ">=4"
}

sequence_2: {
    options = {
        evaluate: true,
        side_effects: true,
    }
    input: {
        console.log(`${1,2} ${/a/,/b/}`);
    }
    expect: {
        console.log("2 /b/");
    }
    expect_stdout: "2 /b/"
    node_version: ">=4"
}
