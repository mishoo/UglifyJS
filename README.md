UglifyJS 2
==========

UglifyJS is a JavaScript parser, minifier, compressor or beautifier toolkit.

For now this page documents the command line utility.  More advanced
API documentation will be made available later.

Usage
-----

    uglifyjs2 [input files] [options]

UglifyJS2 can take multiple input files.  It's recommended that you pass the
input files first, then pass the options.  UglifyJS will parse input files
in sequence and apply any compression options.  The files are parsed in the
same global scope, that is, a reference from a file to some
variable/function declared in another file will be matched properly.

If you want to read from STDIN instead, pass a single dash instead of input
files.

The available options are:

    --source-map       Specify an output file where to generate source map.
                                                                          [string]
    --source-map-root  The path to the original source to be included in the
                       source map.                                        [string]
    --in-source-map    Input source map, useful if you're compressing JS that was
                       generated from some other original code.
    -p, --prefix       Skip prefix for original filenames that appear in source
                       maps. For example -p 3 will drop 3 directories from file
                       names and ensure they are relative paths.
    -o, --output       Output file (default STDOUT).
    -b, --beautify     Beautify output/specify output options.            [string]
    -m, --mangle       Mangle names/pass mangler options.                 [string]
    -r, --reserved     Reserved names to exclude from mangling.
    -c, --compress     Enable compressor/pass compressor options. Pass options
                       like -c hoist_vars=false,if_return=false. Use -c with no
                       argument to use the default compression options.   [string]
    -d, --define       Global definitions                                 [string]
    --comments         Preserve copyright comments in the output. By default this
                       works like Google Closure, keeping JSDoc-style comments
                       that contain "@license" or "@preserve". You can optionally
                       pass one of the following arguments to this flag:
                       - "all" to keep all comments
                       - a valid JS regexp (needs to start with a slash) to keep
                       only comments that match.
                       Note that currently not *all* comments can be kept when
                       compression is on, because of dead code removal or
                       cascading statements into sequences.               [string]
    --stats            Display operations run time on STDERR.            [boolean]
    --acorn            Use Acorn for parsing.                            [boolean]
    --spidermonkey     Assume input fles are SpiderMonkey AST format (as JSON).
                                                                         [boolean]
    -v, --verbose      Verbose                                           [boolean]

Specify `--output` (`-o`) to declare the output file.  Otherwise the output
goes to STDOUT.

## Source map options

UglifyJS2 can generate a source map file, which is highly useful for
debugging your compressed JavaScript.  To get a source map, pass
`--source-map output.js.map` (full path to the file where you want the
source map dumped).

Additionally you might need `--source-map-root` to pass the URL where the
original files can be found.  In case you are passing full paths to input
files to UglifyJS, you can use `--prefix` (`-p`) to specify the number of
directories to drop from the path prefix when declaring files in the source
map.

For example:

    uglifyjs2 /home/doe/work/foo/src/js/file1.js \
              /home/doe/work/foo/src/js/file2.js \
              -o foo.min.js \
              --source-map foo.min.js.map \
              --source-map-root http://foo.com/src \
              -p 5 -c -m

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

To use this feature you need to pass `--in-source-map
/path/to/input/source.map`.  Normally the input source map should also point
to the file containing the generated JS, so if that's correct you can omit
input files from the command line.

## Mangler options

To enable the mangler you need to pass `--mangle` (`-m`).  Optionally you
can pass `-m sort` (we'll possibly have other flags in the future) in order
to assign shorter names to most frequently used variables.  This saves a few
hundred bytes on jQuery before gzip, but the output is _bigger_ after gzip
(and seems to happen for other libraries I tried it on) therefore it's not
enabled by default.

When mangling is enabled but you want to prevent certain names from being
mangled, you can declare those names with `--reserved` (`-r`) — pass a
comma-separated list of names.  For example:

    uglifyjs2 ... -m -r '$,require,exports'

to prevent the `require`, `exports` and `$` names from being changed.

## Compressor options

You need to pass `--compress` (`-c`) to enable the compressor.  Optionally
you can pass a comma-separated list of options.  Options are in the form
`foo=bar`, or just `foo` (the latter implies a boolean option that you want
to set `true`; it's effectively a shortcut for `foo=true`).

The defaults should be tuned for maximum compression on most code.  Here are
the available options (all are `true` by default, except `hoist_vars`):

- `sequences` -- join consecutive simple statements using the comma operator
- `properties` -- rewrite property access using the dot notation, for
  example `foo["bar"] → foo.bar`
- `dead-code` -- remove unreachable code
- `drop-debugger` -- remove `debugger;` statements
- `unsafe` -- apply "unsafe" transformations (discussion below)
- `conditionals` -- apply optimizations for `if`-s and conditional
  expressions
- `comparisons` -- apply certain optimizations to binary nodes, for example:
  `!(a <= b) → a > b` (only when `unsafe`), attempts to negate binary nodes,
  e.g. `a = !b && !c && !d && !e → a=!(b||c||d||e)` etc.
- `evaluate` -- attempt to evaluate constant expressions
- `booleans` -- various optimizations for boolean context, for example `!!a
  ? b : c → a ? b : c`
- `loops` -- optimizations for `do`, `while` and `for` loops when we can
  statically determine the condition
- `unused` -- drop unreferenced functions and variables
- `hoist-funs` -- hoist function declarations
- `hoist-vars` -- hoist `var` declarations (this is `false` by default
  because it seems to increase the size of the output in general)
- `if-return` -- optimizations for if/return and if/continue
- `join-vars` -- join consecutive `var` statements
- `cascade` -- small optimization for sequences, transform `x, x` into `x`
  and `x = something(), x` into `x = something()`
- `warnings` -- display warnings when dropping unreachable code or unused
  declarations etc.

### Conditional compilation

You can use the `--define` (`-d`) switch in order to declare global
variables that UglifyJS will assume to be constants (unless defined in
scope).  For example if you pass `--define DEBUG=false` then, coupled with
dead code removal UglifyJS will discard the following from the output:

    if (DEBUG) {
        console.log("debug stuff");
    }

UglifyJS will warn about the condition being always false and about dropping
unreachable code; for now there is no option to turn off only this specific
warning, you can pass `warnings=false` to turn off *all* warnings.

Another way of doing that is to declare your globals as constants in a
separate file and include it into the build.  For example you can have a
`build/defines.js` file with the following:

    const DEBUG = false;
    const PRODUCTION = true;
    // etc.

and build your code like this:

    uglifyjs2 build/defines.js js/foo.js js/bar.js... -c

UglifyJS will notice the constants and, since they cannot be altered, it
will evaluate references to them to the value itself and drop unreachable
code as usual.  The possible downside of this approach is that the build
will contain the `const` declarations.

## Beautifier options

The code generator tries to output shortest code possible by default.  In
case you want beautified output, pass `--beautify` (`-b`).  Optionally you
can pass additional arguments that control the code output:

- `beautify` (default `true`) -- whether to actually beautify the output.
  Passing `-b` will set this to true, but you might need to pass `-b` even
  when you want to generate minified code, in order to specify additional
  arguments, so you can use `-b beautify=false` to override it.
- `indent-level` (default 4)
- `indent-start` (default 0) -- prefix all lines by that many spaces
- `quote-keys` (default `false`) -- pass `true` to quote all keys in literal
  objects
- `space-colon` (default `true`) -- insert a space after the colon signs
- `ascii-only` (default `false`) -- escape Unicode characters in strings and
  regexps
- `inline-script` (default `false`) -- escape the slash in occurrences of
  `</script` in strings
- `width` (default 80) -- only takes effect when beautification is on, this
  specifies an (orientative) line width that the beautifier will try to
  obey.  It refers to the width of the line text (excluding indentation).
  It doesn't work very well currently, but it does make the code generated
  by UglifyJS more readable.
- `max-line-len` (default 32000) -- maximum line length (for uglified code)
- `ie-proof` (default `true`) -- generate “IE-proof” code (for now this
  means add brackets around the do/while in code like this: `if (foo) do
  something(); while (bar); else ...`.
- `bracketize` (default `false`) -- always insert brackets in `if`, `for`,
  `do`, `while` or `with` statements, even if their body is a single
  statement.

### Keeping copyright notices or other comments

You can pass `--comments` to retain certain comments in the output.  By
default it will keep JSDoc-style comments that contain "@preserve" or
"@license".  You can pass `--comments all` to keep all the comments, or a
valid JavaScript regexp to keep only comments that match this regexp.  For
example `--comments '/foo|bar/'` will keep only comments that contain "foo"
or "bar".

Note, however, that there might be situations where comments are lost.  For
example:

    function f() {
      /** @preserve Foo Bar */
      function g() {
        // this function is never called
      }
      return something();
    }

Even though it has "@preserve", the comment will be lost because the inner
function `g` (which is the AST node to which the comment is attached to) is
discarded by the compressor as not referenced.

The safest comments where to place copyright information (or other info that
needs to me kept in the output) are comments attached to toplevel nodes.

## Support for the SpiderMonkey AST

UglifyJS2 has its own abstract syntax tree format; for
[practical reasons](http://lisperator.net/blog/uglifyjs-why-not-switching-to-spidermonkey-ast/)
we can't easily change to using the SpiderMonkey AST internally.  However,
UglifyJS now has a converter which can import a SpiderMonkey AST.

For example [Acorn](https://github.com/marijnh/acorn) is a super-fast parser
that produces a SpiderMonkey AST.  It has a small CLI utility that parses
one file and dumps the AST in JSON on the standard output.  To use UglifyJS
to mangle and compress that:

    acorn file.js | uglifyjs2 --spidermonkey -m -c

The `--spidermonkey` option tells UglifyJS that all input files are not
JavaScript, but JS code described in SpiderMonkey AST in JSON.  Therefore we
don't use our own parser in this case, but just transform that AST into our
internal AST.

### Use Acorn for parsing

More for fun, I added the `--acorn` option which will use Acorn to do all
the parsing.  If you pass this option, UglifyJS will `require("acorn")`.  At
the time I'm writing this it needs
[this commit](https://github.com/mishoo/acorn/commit/17c0d189c7f9ce5447293569036949b5d0a05fef)
in Acorn to support multiple input files and properly generate source maps.

Acorn is really fast (e.g. 250ms instead of 380ms on some 650K code), but
converting the SpiderMonkey tree that Acorn produces takes another 150ms so
in total it's a bit more than just using UglifyJS's own parser.
