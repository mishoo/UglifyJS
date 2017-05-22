UglifyJS 3
==========

UglifyJS is a JavaScript parser, minifier, compressor and beautifier toolkit.

#### Note:
- **`uglify-js@3` has a simplified [API](#api-reference) and [CLI](#command-line-usage) that is not backwards compatible with [`uglify-js@2`](https://github.com/mishoo/UglifyJS2/tree/v2.x)**.
- **Documentation for UglifyJS `2.x` releases can be found [here](https://github.com/mishoo/UglifyJS2/tree/v2.x)**.
- `uglify-js` only supports ECMAScript 5 (ES5).
- Those wishing to minify
ES2015+ (ES6+) should use the `npm` package [**uglify-es**](https://github.com/mishoo/UglifyJS2/tree/harmony).

Install
-------

First make sure you have installed the latest version of [node.js](http://nodejs.org/)
(You may need to restart your computer after this step).

From NPM for use as a command line app:

    npm install uglify-js -g

From NPM for programmatic use:

    npm install uglify-js

# Command line usage

    uglifyjs [input files] [options]

UglifyJS can take multiple input files.  It's recommended that you pass the
input files first, then pass the options.  UglifyJS will parse input files
in sequence and apply any compression options.  The files are parsed in the
same global scope, that is, a reference from a file to some
variable/function declared in another file will be matched properly.

If no input file is specified, UglifyJS will read from STDIN.

If you wish to pass your options before the input files, separate the two with
a double dash to prevent input files being used as option arguments:

    uglifyjs --compress --mangle -- input.js

### Command line options

```
    -h, --help                  Print usage information.
    -V, --version               Print version number.
    -p, --parse <options>       Specify parser options:
                                `acorn`  Use Acorn for parsing.
                                `bare_returns`  Allow return outside of functions.
                                                Useful when minifying CommonJS
                                                modules and Userscripts that may
                                                be anonymous function wrapped (IIFE)
                                                by the .user.js engine `caller`.
                                `expression`  Parse a single expression, rather than
                                              a program (for parsing JSON).
                                `spidermonkey`  Assume input files are SpiderMonkey
                                                AST format (as JSON).
    -c, --compress [options]    Enable compressor/specify compressor options:
                                `pure_funcs`  List of functions that can be safely
                                              removed when their return values are
                                              not used.
    -m, --mangle [options]      Mangle names/specify mangler options:
                                `reserved`  List of names that should not be mangled.
    --mangle-props [options]    Mangle properties/specify mangler options:
                                `builtins`  Mangle property names that overlaps
                                            with standard JavaScript globals.
                                `debug`  Add debug prefix and suffix.
                                `domprops`  Mangle property names that overlaps
                                            with DOM properties.
                                `keep_quoted`  Only mangle unquoted properies.
                                `regex`  Only mangle matched property names.
                                `reserved`  List of names that should not be mangled.
    -b, --beautify [options]    Beautify output/specify output options:
                                `beautify`  Enabled with `--beautify` by default.
                                `preamble`  Preamble to prepend to the output. You
                                            can use this to insert a comment, for
                                            example for licensing information.
                                            This will not be parsed, but the source
                                            map will adjust for its presence.
                                `quote_style`  Quote style:
                                               0 - auto
                                               1 - single
                                               2 - double
                                               3 - original
                                `wrap_iife`  Wrap IIFEs in parenthesis. Note: you may
                                             want to disable `negate_iife` under
                                             compressor options.
    -o, --output <file>         Output file path (default STDOUT). Specify `ast` or
                                `spidermonkey` to write UglifyJS or SpiderMonkey AST
                                as JSON to STDOUT respectively.
    --comments [filter]         Preserve copyright comments in the output. By
                                default this works like Google Closure, keeping
                                JSDoc-style comments that contain "@license" or
                                "@preserve". You can optionally pass one of the
                                following arguments to this flag:
                                - "all" to keep all comments
                                - a valid JS RegExp like `/foo/` or `/^!/` to
                                keep only matching comments.
                                Note that currently not *all* comments can be
                                kept when compression is on, because of dead
                                code removal or cascading statements into
                                sequences.
    --config-file <file>        Read `minify()` options from JSON file.
    -d, --define <expr>[=value] Global definitions.
    --ie8                       Support non-standard Internet Explorer 8.
                                Equivalent to setting `ie8: true` in `minify()`
                                for `compress`, `mangle` and `output` options.
                                By default UglifyJS will not try to be IE-proof.
    --keep-fnames               Do not mangle/drop function names.  Useful for
                                code relying on Function.prototype.name.
    --name-cache                File to hold mangled name mappings.
    --self                      Build UglifyJS as a library (implies --wrap UglifyJS)
    --source-map [options]      Enable source map/specify source map options:
                                `base`  Path to compute relative paths from input files.
                                `content`  Input source map, useful if you're compressing
                                           JS that was generated from some other original
                                           code. Specify "inline" if the source map is
                                           included within the sources.
                                `filename`  Name and/or location of the output source.
                                `includeSources`  Pass this flag if you want to include
                                                  the content of source files in the
                                                  source map as sourcesContent property.
                                `root`  Path to the original source to be included in
                                        the source map.
                                `url`  If specified, path to the source map to append in
                                       `//# sourceMappingURL`.
    --stats                     Display operations run time on STDERR.
    --toplevel                  Compress and/or mangle variables in top level scope.
    --verbose                   Print diagnostic messages.
    --warn                      Print warning messages.
    --wrap <name>               Embed everything in a big function, making the
                                “exports” and “global” variables available. You
                                need to pass an argument to this option to
                                specify the name that your module will take
                                when included in, say, a browser.
```

Specify `--output` (`-o`) to declare the output file.  Otherwise the output
goes to STDOUT.

## CLI source map options

UglifyJS can generate a source map file, which is highly useful for
debugging your compressed JavaScript.  To get a source map, pass
`--source-map --output output.js` (source map will be written out to
`output.js.map`).

Additional options:

- `--source-map filename=<NAME>` to specify the name of the source map.

- `--source-map root=<URL>` to pass the URL where the original files can be found.
  Otherwise UglifyJS assumes HTTP `X-SourceMap` is being used and will omit the
  `//# sourceMappingURL=` directive.

- `--source-map url=<URL>` to specify the URL where the source map can be found.

For example:

    uglifyjs js/file1.js js/file2.js \
             -o foo.min.js -c -m \
             --source-map root="http://foo.com/src",url=foo.min.js.map

The above will compress and mangle `file1.js` and `file2.js`, will drop the
output in `foo.min.js` and the source map in `foo.min.js.map`.  The source
mapping will refer to `http://foo.com/src/js/file1.js` and
`http://foo.com/src/js/file2.js` (in fact it will list `http://foo.com/src`
as the source map root, and the original files as `js/file1.js` and
`js/file2.js`).

### Composed source map

When you're compressing JS code that was output by a compiler such as
CoffeeScript, mapping to the JS code won't be too helpful.  Instead, you'd
like to map back to the original code (i.e. CoffeeScript).  UglifyJS has an
option to take an input source map.  Assuming you have a mapping from
CoffeeScript → compiled JS, UglifyJS can generate a map from CoffeeScript →
compressed JS by mapping every token in the compiled JS to its original
location.

To use this feature pass `--source-map content="/path/to/input/source.map"`
or `--source-map content=inline` if the source map is included inline with
the sources.

## CLI compress options

You need to pass `--compress` (`-c`) to enable the compressor.  Optionally
you can pass a comma-separated list of [compress options](#compress-options).

Options are in the form `foo=bar`, or just `foo` (the latter implies
a boolean option that you want to set `true`; it's effectively a
shortcut for `foo=true`).

Example:

    uglifyjs file.js -c toplevel,sequences=false

## CLI mangle options

To enable the mangler you need to pass `--mangle` (`-m`).  The following
(comma-separated) options are supported:

- `toplevel` — mangle names declared in the top level scope (disabled by
  default).

- `eval` — mangle names visible in scopes where `eval` or `with` are used
  (disabled by default).

When mangling is enabled but you want to prevent certain names from being
mangled, you can declare those names with `--mangle reserved` — pass a
comma-separated list of names.  For example:

    uglifyjs ... -m reserved=[$,require,exports]

to prevent the `require`, `exports` and `$` names from being changed.

### CLI mangling property names (`--mangle-props`)

**Note:** this will probably break your code.  Mangling property names is a
separate step, different from variable name mangling.  Pass
`--mangle-props`.  It will mangle all properties that are seen in some
object literal, or that are assigned to.  For example:

```javascript
var x = {
    foo: 1
};

x.bar = 2;
x["baz"] = 3;
x[condition ? "moo" : "boo"] = 4;
console.log(x.something());
```

In the above code, `foo`, `bar`, `baz`, `moo` and `boo` will be replaced
with single characters, while `something()` will be left as is.

In order for this to be of any use, we avoid mangling standard JS names by
default (`--mangle-props builtins` to override).

A default exclusion file is provided in `tools/domprops.json` which should
cover most standard JS and DOM properties defined in various browsers.  Pass
`--mangle-props domprops` to disable this feature.

You can also use a regular expression to define which property names should be
mangled.  For example, `--mangle-props regex=/^_/` will only mangle property
names that start with an underscore.

When you compress multiple files using this option, in order for them to
work together in the end we need to ensure somehow that one property gets
mangled to the same name in all of them.  For this, pass `--name-cache filename.json`
and UglifyJS will maintain these mappings in a file which can then be reused.
It should be initially empty.  Example:

```bash
$ rm -f /tmp/cache.json  # start fresh
$ uglifyjs file1.js file2.js --mangle-props --name-cache /tmp/cache.json -o part1.js
$ uglifyjs file3.js file4.js --mangle-props --name-cache /tmp/cache.json -o part2.js
```

Now, `part1.js` and `part2.js` will be consistent with each other in terms
of mangled property names.

Using the name cache is not necessary if you compress all your files in a
single call to UglifyJS.

### Mangling unquoted names (`--mangle-props keep_quoted`)

Using quoted property name (`o["foo"]`) reserves the property name (`foo`)
so that it is not mangled throughout the entire script even when used in an
unquoted style (`o.foo`). Example:

```bash
$ echo 'var o={"foo":1, bar:3}; o.foo += o.bar; console.log(o.foo);' | uglifyjs --mangle-props keep_quoted -mc
var o={foo:1,a:3};o.foo+=o.a,console.log(o.foo);
```

### Debugging property name mangling

You can also pass `--mangle-props debug` in order to mangle property names
without completely obscuring them. For example the property `o.foo`
would mangle to `o._$foo$_` with this option. This allows property mangling
of a large codebase while still being able to debug the code and identify
where mangling is breaking things.

You can also pass a custom suffix using `--mangle-props debug=XYZ`. This would then
mangle `o.foo` to `o._$foo$XYZ_`. You can change this each time you compile a
script to identify how a property got mangled. One technique is to pass a
random number on every compile to simulate mangling changing with different
inputs (e.g. as you update the input script with new properties), and to help
identify mistakes like writing mangled keys to storage.


# API Reference

Assuming installation via NPM, you can load UglifyJS in your application
like this:
```javascript
var UglifyJS = require("uglify-js");
```

There is a single high level function, **`minify(code, options)`**,
which will perform all minification [phases](#minify-options) in a configurable
manner. By default `minify()` will enable the options [`compress`](#compress-options)
and [`mangle`](#mangle-options). Example:
```javascript
var code = "function add(first, second) { return first + second; }";
var result = UglifyJS.minify(code);
console.log(result.error); // runtime error, or `undefined` if no error
console.log(result.code);  // minified output: function add(n,d){return n+d}
```

You can `minify` more than one JavaScript file at a time by using an object
for the first argument where the keys are file names and the values are source
code:
```javascript
var code = {
    "file1.js": "function add(first, second) { return first + second; }",
    "file2.js": "console.log(add(1 + 2, 3 + 4));"
};
var result = UglifyJS.minify(code);
console.log(result.code);
// function add(d,n){return d+n}console.log(add(3,7));
```

The `toplevel` option:
```javascript
var code = {
    "file1.js": "function add(first, second) { return first + second; }",
    "file2.js": "console.log(add(1 + 2, 3 + 4));"
};
var options = { toplevel: true };
var result = UglifyJS.minify(code, options);
console.log(result.code);
// console.log(function(n,o){return n+o}(3,7));
```

An example of a combination of `minify()` options:
```javascript
var code = {
    "file1.js": "function add(first, second) { return first + second; }",
    "file2.js": "console.log(add(1 + 2, 3 + 4));"
};
var options = {
    toplevel: true,
    compress: {
        global_defs: {
            "@console.log": "alert"
        },
        passes: 2
    },
    output: {
        beautify: false,
        preamble: "/* uglified */"
    }
};
var result = UglifyJS.minify(code, options);
console.log(result.code);
// /* uglified */
// alert(10);"
```

To produce warnings:
```javascript
var code = "function f(){ var u; return 2 + 3; }";
var options = { warnings: true };
var result = UglifyJS.minify(code, options);
console.log(result.error);    // runtime error, `undefined` in this case
console.log(result.warnings); // [ 'Dropping unused variable u [0:1,18]' ]
console.log(result.code);     // function f(){return 5}
```

An error example:
```javascript
var result = UglifyJS.minify({"foo.js" : "if (0) else console.log(1);"});
console.log(JSON.stringify(result.error));
// {"message":"Unexpected token: keyword (else)","filename":"foo.js","line":1,"col":7,"pos":7}
```
Note: unlike `uglify-js@2.x`, the `3.x` API does not throw errors. To
achieve a similar effect one could do the following:
```javascript
var result = UglifyJS.minify(code, options);
if (result.error) throw result.error;
```

## Minify options

- `warnings` (default `false`) — pass `true` to return compressor warnings
  in `result.warnings`. Use the value `"verbose"` for more detailed warnings.

- `parse` (default `{}`) — pass an object if you wish to specify some
  additional [parse options](#parse-options).

- `compress` (default `{}`) — pass `false` to skip compressing entirely.
  Pass an object to specify custom [compress options](#compress-options).

- `mangle` (default `true`) — pass `false` to skip mangling names, or pass
  an object to specify [mangle options](#mangle-options) (see below).

  - `mangle.properties` (default `false`) — a subcategory of the mangle option.
    Pass an object to specify custom [mangle property options](#mangle-properties-options).

- `output` (default `null`) — pass an object if you wish to specify
  additional [output options](#output-options).  The defaults are optimized
  for best compression.

- `sourceMap` (default `false`) - pass an object if you wish to specify
  [source map options](#source-map-options).

- `toplevel` (default `false`) - set to `true` if you wish to enable top level
  variable and function name mangling and to drop unused variables and functions.

- `ie8` (default `false`) - set to `true` to support IE8.

## Minify options structure

```javascript
{
    warnings: false,
    parse: {
        // parse options
    },
    compress: {
        // compress options
    },
    mangle: {
        // mangle options

        properties: {
            // mangle property options
        }
    },
    output: {
        // output options
    },
    sourceMap: {
        // source map options
    },
    toplevel: false,
    ie8: false,
}
```

### Source map options

To generate a source map:
```javascript
var result = UglifyJS.minify({"file1.js": "var a = function() {};"}, {
    sourceMap: {
        filename: "out.js",
        url: "out.js.map"
    }
});
console.log(result.code); // minified output
console.log(result.map);  // source map
```

Note that the source map is not saved in a file, it's just returned in
`result.map`.  The value passed for `sourceMap.url` is only used to set
`//# sourceMappingURL=out.js.map` in `result.code`. The value of
`filename` is only used to set `file` attribute (see [the spec][sm-spec])
in source map file.

You can set option `sourceMap.url` to be `"inline"` and source map will
be appended to code.

You can also specify sourceRoot property to be included in source map:
```javascript
var result = UglifyJS.minify({"file1.js": "var a = function() {};"}, {
    sourceMap: {
        root: "http://example.com/src",
        url: "out.js.map"
    }
});
```

If you're compressing compiled JavaScript and have a source map for it, you
can use `sourceMap.content`:
```javascript
var result = UglifyJS.minify({"compiled.js": "compiled code"}, {
    sourceMap: {
        content: "content from compiled.js.map",
        url: "minified.js.map"
    }
});
// same as before, it returns `code` and `map`
```

If you're using the `X-SourceMap` header instead, you can just omit `sourceMap.url`.

## Parse options

- `bare_returns` (default `false`) -- support top level `return` statements
- `html5_comments` (default `true`)
- `shebang` (default `true`) -- support `#!command` as the first line

## Compress options

- `sequences` (default: true) -- join consecutive simple statements using the
  comma operator.  May be set to a positive integer to specify the maximum number
  of consecutive comma sequences that will be generated. If this option is set to
  `true` then the default `sequences` limit is `200`. Set option to `false` or `0`
  to disable. The smallest `sequences` length is `2`. A `sequences` value of `1`
  is grandfathered to be equivalent to `true` and as such means `200`. On rare
  occasions the default sequences limit leads to very slow compress times in which
  case a value of `20` or less is recommended.

- `properties` -- rewrite property access using the dot notation, for
  example `foo["bar"] → foo.bar`

- `dead_code` -- remove unreachable code

- `drop_debugger` -- remove `debugger;` statements

- `unsafe` (default: false) -- apply "unsafe" transformations (discussion below)

- `unsafe_comps` (default: false) -- Reverse `<` and `<=` to `>` and `>=` to
  allow improved compression. This might be unsafe when an at least one of two
  operands is an object with computed values due the use of methods like `get`,
  or `valueOf`. This could cause change in execution order after operands in the
  comparison are switching. Compression only works if both `comparisons` and
  `unsafe_comps` are both set to true.

- `unsafe_math` (default: false) -- optimize numerical expressions like
  `2 * x * 3` into `6 * x`, which may give imprecise floating point results.

- `unsafe_proto` (default: false) -- optimize expressions like
  `Array.prototype.slice.call(a)` into `[].slice.call(a)`

- `unsafe_regexp` (default: false) -- enable substitutions of variables with
  `RegExp` values the same way as if they are constants.

- `conditionals` -- apply optimizations for `if`-s and conditional
  expressions

- `comparisons` -- apply certain optimizations to binary nodes, for example:
  `!(a <= b) → a > b` (only when `unsafe_comps`), attempts to negate binary
  nodes, e.g. `a = !b && !c && !d && !e → a=!(b||c||d||e)` etc.

- `evaluate` -- attempt to evaluate constant expressions

- `booleans` -- various optimizations for boolean context, for example `!!a
  ? b : c → a ? b : c`

- `loops` -- optimizations for `do`, `while` and `for` loops when we can
  statically determine the condition

- `unused` -- drop unreferenced functions and variables (simple direct variable
  assignments do not count as references unless set to `"keep_assign"`)

- `toplevel` -- drop unreferenced functions (`"funcs"`) and/or variables (`"vars"`)
  in the top level scope (`false` by default, `true` to drop both unreferenced
  functions and variables)

- `top_retain` -- prevent specific toplevel functions and variables from `unused`
  removal (can be array, comma-separated, RegExp or function. Implies `toplevel`)

- `hoist_funs` -- hoist function declarations

- `hoist_vars` (default: false) -- hoist `var` declarations (this is `false`
  by default because it seems to increase the size of the output in general)

- `if_return` -- optimizations for if/return and if/continue

- `join_vars` -- join consecutive `var` statements

- `cascade` -- small optimization for sequences, transform `x, x` into `x`
  and `x = something(), x` into `x = something()`

- `collapse_vars` -- Collapse single-use non-constant variables - side
  effects permitting.

- `reduce_vars` -- Improve optimization on variables assigned with and
  used as constant values.

- `warnings` -- display warnings when dropping unreachable code or unused
  declarations etc.

- `negate_iife` -- negate "Immediately-Called Function Expressions"
  where the return value is discarded, to avoid the parens that the
  code generator would insert.

- `pure_getters` -- the default is `false`.  If you pass `true` for
  this, UglifyJS will assume that object property access
  (e.g. `foo.bar` or `foo["bar"]`) doesn't have any side effects.
  Specify `"strict"` to treat `foo.bar` as side-effect-free only when
  `foo` is certain to not throw, i.e. not `null` or `undefined`.

- `pure_funcs` -- default `null`.  You can pass an array of names and
  UglifyJS will assume that those functions do not produce side
  effects.  DANGER: will not check if the name is redefined in scope.
  An example case here, for instance `var q = Math.floor(a/b)`.  If
  variable `q` is not used elsewhere, UglifyJS will drop it, but will
  still keep the `Math.floor(a/b)`, not knowing what it does.  You can
  pass `pure_funcs: [ 'Math.floor' ]` to let it know that this
  function won't produce any side effect, in which case the whole
  statement would get discarded.  The current implementation adds some
  overhead (compression will be slower).

- `drop_console` -- default `false`.  Pass `true` to discard calls to
  `console.*` functions. If you wish to drop a specific function call
  such as `console.info` and/or retain side effects from function arguments
  after dropping the function call then use `pure_funcs` instead.

- `expression` -- default `false`.  Pass `true` to preserve completion values
  from terminal statements without `return`, e.g. in bookmarklets.

- `keep_fargs` -- default `true`.  Prevents the
  compressor from discarding unused function arguments.  You need this
  for code which relies on `Function.length`.

- `keep_fnames` -- default `false`.  Pass `true` to prevent the
  compressor from discarding function names.  Useful for code relying on
  `Function.prototype.name`. See also: the `keep_fnames` [mangle option](#mangle).

- `passes` -- default `1`. Number of times to run compress with a maximum of 3.
  In some cases more than one pass leads to further compressed code.  Keep in
  mind more passes will take more time.

- `keep_infinity` -- default `false`. Pass `true` to prevent `Infinity` from
  being compressed into `1/0`, which may cause performance issues on Chrome.

- `side_effects` -- default `true`. Pass `false` to disable potentially dropping
  functions marked as "pure".  A function call is marked as "pure" if a comment
  annotation `/*@__PURE__*/` or `/*#__PURE__*/` immediately precedes the call. For
  example: `/*@__PURE__*/foo();`

## Mangle options

- `reserved` - pass an array of identifiers that should be excluded from mangling

- `toplevel` — mangle names declared in the top level scope (disabled by
default).

- `eval` — mangle names visible in scopes where eval or with are used
(disabled by default).

- `keep_fnames` -- default `false`.  Pass `true` to not mangle
function names.  Useful for code relying on `Function.prototype.name`.
See also: the `keep_fnames` [compress option](#compress-options).

Examples:

```javascript
// test.js
var globalVar;
function funcName(firstLongName, anotherLongName) {
    var myVariable = firstLongName +  anotherLongName;
}
```
```javascript
var code = fs.readFileSync("test.js", "utf8");

UglifyJS.minify(code).code;
// 'function funcName(a,n){}var globalVar;'

UglifyJS.minify(code, { mangle: { reserved: ['firstLongName'] } }).code;
// 'function funcName(firstLongName,a){}var globalVar;'

UglifyJS.minify(code, { mangle: { toplevel: true } }).code;
// 'function n(n,a){}var a;'
```

### Mangle properties options

- `regex` — Pass a RegExp to only mangle certain names
- `keep_quoted` — Only mangle unquoted property names
- `debug` — Mangle names with the original name still present. Defaults to `false`.
  Pass an empty string to enable, or a non-empty string to set the suffix.

## Output options

The code generator tries to output shortest code possible by default.  In
case you want beautified output, pass `--beautify` (`-b`).  Optionally you
can pass additional arguments that control the code output:

- `ascii_only` (default `false`) -- escape Unicode characters in strings and
  regexps (affects directives with non-ascii characters becoming invalid)
- `beautify` (default `true`) -- whether to actually beautify the output.
  Passing `-b` will set this to true, but you might need to pass `-b` even
  when you want to generate minified code, in order to specify additional
  arguments, so you can use `-b beautify=false` to override it.
- `bracketize` (default `false`) -- always insert brackets in `if`, `for`,
  `do`, `while` or `with` statements, even if their body is a single
  statement.
- `comments` (default `false`) -- pass `true` or `"all"` to preserve all
  comments, `"some"` to preserve some comments, a regular expression string
  (e.g. `/^!/`) or a function.
- `indent_level` (default 4)
- `indent_start` (default 0) -- prefix all lines by that many spaces
- `inline_script` (default `false`) -- escape the slash in occurrences of
  `</script` in strings
- `keep_quoted_props` (default `false`) -- when turned on, prevents stripping
  quotes from property names in object literals.
- `max_line_len` (default `false`) -- maximum line length (for uglified code)
- `preamble` (default `null`) -- when passed it must be a string and
  it will be prepended to the output literally.  The source map will
  adjust for this text.  Can be used to insert a comment containing
  licensing information, for example.
- `preserve_line` (default `false`) -- pass `true` to preserve lines, but it
  only works if `beautify` is set to `false`.
- `quote_keys` (default `false`) -- pass `true` to quote all keys in literal
  objects
- `quote_style` (default `0`) -- preferred quote style for strings (affects
  quoted property names and directives as well):
  - `0` -- prefers double quotes, switches to single quotes when there are
    more double quotes in the string itself.
  - `1` -- always use single quotes
  - `2` -- always use double quotes
  - `3` -- always use the original quotes
- `semicolons` (default `true`) -- separate statements with semicolons.  If
  you pass `false` then whenever possible we will use a newline instead of a
  semicolon, leading to more readable output of uglified code (size before
  gzip could be smaller; size after gzip insignificantly larger).
- `shebang` (default `true`) -- preserve shebang `#!` in preamble (bash scripts)
- `width` (default 80) -- only takes effect when beautification is on, this
  specifies an (orientative) line width that the beautifier will try to
  obey.  It refers to the width of the line text (excluding indentation).
  It doesn't work very well currently, but it does make the code generated
  by UglifyJS more readable.
- `wrap_iife` (default `false`) -- pass `true` to wrap immediately invoked
  function expressions. See
  [#640](https://github.com/mishoo/UglifyJS2/issues/640) for more details.

# Miscellaneous

### Keeping copyright notices or other comments

You can pass `--comments` to retain certain comments in the output.  By
default it will keep JSDoc-style comments that contain "@preserve",
"@license" or "@cc_on" (conditional compilation for IE).  You can pass
`--comments all` to keep all the comments, or a valid JavaScript regexp to
keep only comments that match this regexp.  For example `--comments /^!/`
will keep comments like `/*! Copyright Notice */`.

Note, however, that there might be situations where comments are lost.  For
example:
```javascript
function f() {
    /** @preserve Foo Bar */
    function g() {
        // this function is never called
    }
    return something();
}
```

Even though it has "@preserve", the comment will be lost because the inner
function `g` (which is the AST node to which the comment is attached to) is
discarded by the compressor as not referenced.

The safest comments where to place copyright information (or other info that
needs to be kept in the output) are comments attached to toplevel nodes.

### The `unsafe` `compress` option

It enables some transformations that *might* break code logic in certain
contrived cases, but should be fine for most code.  You might want to try it
on your own code, it should reduce the minified size.  Here's what happens
when this flag is on:

- `new Array(1, 2, 3)` or `Array(1, 2, 3)` → `[ 1, 2, 3 ]`
- `new Object()` → `{}`
- `String(exp)` or `exp.toString()` → `"" + exp`
- `new Object/RegExp/Function/Error/Array (...)` → we discard the `new`
- `typeof foo == "undefined"` → `foo === void 0`
- `void 0` → `undefined` (if there is a variable named "undefined" in
  scope; we do it because the variable name will be mangled, typically
  reduced to a single character)

### Conditional compilation

You can use the `--define` (`-d`) switch in order to declare global
variables that UglifyJS will assume to be constants (unless defined in
scope).  For example if you pass `--define DEBUG=false` then, coupled with
dead code removal UglifyJS will discard the following from the output:
```javascript
if (DEBUG) {
    console.log("debug stuff");
}
```

You can specify nested constants in the form of `--define env.DEBUG=false`.

UglifyJS will warn about the condition being always false and about dropping
unreachable code; for now there is no option to turn off only this specific
warning, you can pass `warnings=false` to turn off *all* warnings.

Another way of doing that is to declare your globals as constants in a
separate file and include it into the build.  For example you can have a
`build/defines.js` file with the following:
```javascript
var DEBUG = false;
var PRODUCTION = true;
// etc.
```

and build your code like this:

    uglifyjs build/defines.js js/foo.js js/bar.js... -c

UglifyJS will notice the constants and, since they cannot be altered, it
will evaluate references to them to the value itself and drop unreachable
code as usual.  The build will contain the `const` declarations if you use
them. If you are targeting < ES6 environments which does not support `const`,
using `var` with `reduce_vars` (enabled by default) should suffice.

### Conditional compilation API

You can also use conditional compilation via the programmatic API. With the difference that the
property name is `global_defs` and is a compressor property:

```javascript
var result = UglifyJS.minify(fs.readFileSync("input.js", "utf8"), {
    compress: {
        dead_code: true,
        global_defs: {
            DEBUG: false
        }
    }
});
```

To replace an identifier with an arbitrary non-constant expression it is
necessary to prefix the `global_defs` key with `"@"` to instruct UglifyJS
to parse the value as an expression:
```javascript
UglifyJS.minify("alert('hello');", {
    compress: {
        global_defs: {
            "@alert": "console.log"
        }
    }
}).code;
// returns: 'console.log("hello");'
```

Otherwise it would be replaced as string literal:
```javascript
UglifyJS.minify("alert('hello');", {
    compress: {
        global_defs: {
            "alert": "console.log"
        }
    }
}).code;
// returns: '"console.log"("hello");'
```

### Using native Uglify AST with `minify()`
```javascript
// example: parse only, produce native Uglify AST

var result = UglifyJS.minify(code, {
    parse: {},
    compress: false,
    mangle: false,
    output: {
        ast: true,
        code: false  // optional - faster if false
    }
});

// result.ast contains native Uglify AST
```
```javascript
// example: accept native Uglify AST input and then compress and mangle
//          to produce both code and native AST.

var result = UglifyJS.minify(ast, {
    compress: {},
    mangle: {},
    output: {
        ast: true,
        code: true  // optional - faster if false
    }
});

// result.ast contains native Uglify AST
// result.code contains the minified code in string form.
```

### Working with Uglify AST

Transversal and transformation of the native AST can be performed through
[`TreeWalker`](http://lisperator.net/uglifyjs/walk) and
[`TreeTransformer`](http://lisperator.net/uglifyjs/transform) respectively.

### ESTree / SpiderMonkey AST

UglifyJS has its own abstract syntax tree format; for
[practical reasons](http://lisperator.net/blog/uglifyjs-why-not-switching-to-spidermonkey-ast/)
we can't easily change to using the SpiderMonkey AST internally.  However,
UglifyJS now has a converter which can import a SpiderMonkey AST.

For example [Acorn][acorn] is a super-fast parser that produces a
SpiderMonkey AST.  It has a small CLI utility that parses one file and dumps
the AST in JSON on the standard output.  To use UglifyJS to mangle and
compress that:

    acorn file.js | uglifyjs -p spidermonkey -m -c

The `-p spidermonkey` option tells UglifyJS that all input files are not
JavaScript, but JS code described in SpiderMonkey AST in JSON.  Therefore we
don't use our own parser in this case, but just transform that AST into our
internal AST.

### Use Acorn for parsing

More for fun, I added the `-p acorn` option which will use Acorn to do all
the parsing.  If you pass this option, UglifyJS will `require("acorn")`.

Acorn is really fast (e.g. 250ms instead of 380ms on some 650K code), but
converting the SpiderMonkey tree that Acorn produces takes another 150ms so
in total it's a bit more than just using UglifyJS's own parser.

[acorn]: https://github.com/ternjs/acorn
[sm-spec]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k
