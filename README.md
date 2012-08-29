> **Tl;dr** — I want to make UglifyJS2 faster, better, easier to maintain
> and more useful than version 1.  If you enjoy using UglifyJS v1, I can
> promise you that you will love its successor.

> Please help me make this happen by funding the development!

> <a href='http://www.pledgie.com/campaigns/18110'><img alt='Click here to lend your support to: Funding development of UglifyJS 2.0 and make a donation at www.pledgie.com !' src='http://www.pledgie.com/campaigns/18110.png?skin_name=chrome' border='0' /></a>

UglifyJS v2
===========

[UglifyJS](https://github.com/mishoo/UglifyJS) is a popular JavaScript
parser/compressor/beautifier and it's itself written in JavaScript.  Version
1 is battle-tested and used in many production systems.  The parser is
[included in WebKit](http://src.chromium.org/multivm/trunk/webkit/Source/WebCore/inspector/front-end/UglifyJS/parse-js.js).
In two years UglifyJS got over 3000 stars at Github and hundreds of bugs
have been identified and fixed, thanks to a great and expanding community.

I'd say version 1 is rock stable.  However, its architecture can't be
stretched much further.  Some features are hard to add, such as source maps
or keeping comments in the compressed AST.  I started work on version 2 in
May, but I gave up quickly because I lacked time.  What prompted me to
resume it was investigating the difficulty of adding source maps (an
[increasingly popular](https://github.com/mishoo/UglifyJS/issues/315)
feature request).

Status and goals
----------------

In short, the goals for v2 are:

- better modularity, cleaner and more maintainable code; (✓ it's better already)
- parser generates objects instead of arrays for nodes; (✓ done)
- store location information in all nodes; (✓ done)
- better scope representation and mangler; (✓ done)
- better code generator; (✓ done)
- compression options at least as good as in v1; (⌛ in progress)
- support for generating source maps;
- better regression tests; (⌛ in progress)
- ability to keep certain comments;
- command-line utility compatible with UglifyJS v1;
- documentation for the `AST` node hierarchy and the API.

Longer term goals—beyond compressing JavaScript:

- provide a linter; (started)
- feature to dump an AST in a simple JSON format, along with information
  that could be useful for an editor (such as Emacs);
- write a minor JS mode for Emacs to highlight obvious errors, locate symbol
  definition or warn about accidental globals;
- support type annotations like Closure does (though I'm thinking of a
  syntax different from comments; no big plans for this yet).

### Objects for nodes

Version 1 uses arrays to represent AST nodes.  This model worked well for
most operations, but adding additional information in nodes could only be
done with hacks I don't really like (you _can_ add properties to an array
just as if it were an object, but that's just a dirty hack; also, such
properties were not propagated in the compressor).

In v2 I switched to a more “object oriented” approach.  Nodes are objects
and there's also an inheritance tree that aims to be useful in practice.
For example in v1 in order to see if a node is an aborting statement, we
might do something like this:

    if (node[0] == "return"
        || node[0] == "throw"
        || node[0] == "break"
        || node[0] == "continue") aborts();

In v2 they all inherit from the base class `AST_Jump`, so I can say:

    if (node instanceof AST_Jump) aborts();

The parser was _heavily_ modified to support the new node types, however you
can still find the same code layout as in v1, and I trust it's just as
stable.  Except for the parser, all other parts of UglifyJS are rewritten
from scratch.

The parser itself got a bit slower (430ms instead of 330ms on my usual 650K
test file).

#### A word about Esprima

**UPDATE**: A
[discussion in my commit](https://github.com/mishoo/UglifyJS2/commit/ce8e8d57c0d346dba9527b7a11b03364ce9ad1bb#commitcomment-1771586)
suggests that Esprima is not as slow as I thought even when requesting
location information.  YMMV.  In any case, we're going to keep the
battle-tested parser in UglifyJS.

[Esprima](http://esprima.org/) is a really nice JavaScript parser.  It
supports EcmaScript 5.1 and it claims to be “up to 3x faster than UglifyJS's
parse-js”.  I thought that's quite cool and I considered using Esprima in
UglifyJS v2, but then I did some tests.

On my 650K test file, UglifyJS v1's parser takes 330ms and Esprima about
250ms.  That's not exactly “3x faster” but very good indeed!  However, I
noticed that in the default configuration Esprima does not keep location
information in the nodes.  Enabled that, and parse time grew to 680ms.

Some would claim it's a fair
[comparison](http://esprima.org/test/compare.html), because UglifyJS doesn't
keep location information either, but that's not entirely accurate.  It's
true that the `parse()` function will not propagate location into the AST
unless you set `embed_tokens`, but the lexer _always_ stores it in the
tokens.

Enabling `embed_tokens` makes UglifyJS do it in 400ms, which is still a lot
better than Esprima's 680ms.

In version 2 we always maintain location info and comments in the AST nodes,
which is why the parser in v2 takes about 430ms on that file (some
milliseconds get lost because it's more work to create object nodes than
arrays).  I might try to speed it up, though I'm not sure it's worth the
trouble (parsing 650K in 430ms (on my rather outdated machine) to get an
objectual AST with full location/range info and comments seems good enough
for me).

### The code generator, V2 vs. V1

The code generator in v1 is a big function that takes a node and applies
various walkers on it in order to generate code.  The code was _returned_
from each walker function, and finally assembled into a big string by
concatenation or array.join, and further returned.  It is impossible there
to know what's the current line/column of the output, which would be
necessary for source maps.  For the same reason, v1 required an additional
step to split very long lines (that includes an additional run of the
tokenizer).  It's _slow_.

The rules for inserting parentheses in v1 are an unholy mess; we know at
least [one case](https://github.com/mishoo/UglifyJS/issues/368) where it
inserts unnecessary parens (non-trivial to fix), and I just discovered one
case where it generates invalid code—UglifyJS can properly parse the
following (valid) statement:

    for (var a = ("foo" in bar), i = 0; i < 5; ++i);

however, the code generator in version 1 will break it by not including the
parens (the `in` operator is not allowed in a `for` initializer, unless it's
parenthesized).

The codegen in V2 is a thing of beauty.  Since I now use objects for AST
nodes, I defined a "print" method on each object type.  This method takes an
object (an OutputStream) and instead of returning the source code for the
node, it prints it in the output stream.  The stream object keeps track of
current line/colum in the output and provides helper functions to insert
semicolons, to indent etc.  The code is somewhat bigger than the `gen_code`
in v1, but it's much easier to understand, it's faster and does not require
an additional pass for splitting long lines.  Also the rules for inserting
parens are nicely separated from the `print` method definitions.

### More aggressive compressing

As I
[blogged](http://lisperator.net/blog/javascript-minification-is-it-worth-it/)
a few days ago, it seems to me that the squeezer works really hard for not
too much benefit.  On my test file, passing `--no-squeeze` to UglifyJS v1
adds only 500 bytes after `gzip`, that is 0.68% of the gzipped file size;
every byte counts, but to be frank, that's not a very big deal either.

Beyond doing what V1 does, I'd like to make it smarter in certain
situations, for example:

    function foo() {
        var something = compute_something();
        var something_else = compute_something_else(something);
        return something_else;
    }

I sometimes write this kind of code because it's cleaner, it nests less and
it avoids the need to add explanatory comments.  It could _safely_ compress
into:

    function foo() {
        return compute_something_else(compute_something());
    }

which makes it a single statement (further compressable into sequences and
allowing to drop brackets in other cases) and it avoids the `var`
declarations.  That's one tricky optimization to do in V1, but I feel with
the new architecture is doable, at least for the simple cases.

Currently the compressor in V2 is far from complete (where by “complete” I
mean as good as V1), and I'll actually put it on hold to add support for
generating source maps first.  However the mangler is complete (seems to be
working properly) as well as the code generator, so V2 is already usable for
achieving pretty good compression.

### Better regression test suite

The existing test suite in UglifyJS v1 has been contributed (thanks!).
Unfortunately it's not great because it employs all the compression
techniques in each test.  Eventually I'd like to port all existing tests to
v2, but for now I started it from scratch.

Tests broke many times for no good reason as I added new features; for
example the feature that transforms consecutive simple statements into
sequences:

    INPUT  → function f(){ if (x) { foo(); bar(); baz(); }}
    OUTPUT → function f(){ x && foo(), bar(), baz() }

It's an useful technique; without meshing consecutive statements into an
`AST_Seq` we would have to keep the `if` and the brackets.

Having a test only for this feature is fine; but if the feature is applied
to all tests, then tests where the “expected” file contains consecutive
statements will break, although the output is perfectly fine.

In v2 I started a new test suite (I actually took the “test driven
development” approach: I'm progressing on both compressor and test suite at
once; for each new compressor option I add a test case).  Tests look like
this:

    keep_debugger: {
        options = {
            drop_debugger: false
        };
        input: {
            debugger;
        }
        expect: {
            debugger;
        }
    }

    drop_debugger: {
        options = {
            drop_debugger: true
        };
        input: {
            debugger;
            if (foo) debugger;
        }
        expect: {
            if (foo);
        }
    }

That might look funny, but it's syntactically valid JS.  A test file
consists of a sequence of labeled block statements.  Each label names a test
in that file.  In each block you can assign to the `options` variable to
override compressor options (for the purpose of running the tests, all
compression options are turned off, so you just enable the stuff you test).
Then you include two other labeled statements: `input` and `expect`.  The
compressor test suite simply parses these statements to get two AST-s.  It
applies the compressor on the `input` AST, then the `codegen` on the
compressed AST.  It applies the `codegen` to the `expect` AST (without
compressing it).  Then it compares the results and if they match, the test
passes.

I expect this model to give a lot less false negatives, and it would work
quite well for the name mangling too (no tests for that yet).

For the code generator we'll need something more fine-tuned, since we care
exactly how the output is going to look like.  I don't yet have any plans
about code generator tests.


Play with it
------------

We don't yet have a nice command line utility, but there's a test script for
NodeJS in tmp/test-node.js.  To play with UglifyJS v2 just clone the
repository anywhere you like and run `tmp/test-node.js script.js` (script.js
being the script that you'd like to compress).  Take a look at the source of
`test-node.js` to see how the API looks like, to enable/disable steps or
compressor options.

To run the existing tests, run `test/run-tests.js`


Status of UglifyJS v1
---------------------

We didn't have any significant new features in the last few months; most
commits are about bug fixes.  I plan to continue to fix show-stopper bugs in
v1 for a while, depending on how time permits, but there won't be any new
development.


Help me complete the new version
--------------------------------

I've put a lot of energy already into this project and I think it comes out
nicely.  It's based on all my previous experience from working on version 1
and I'm working carefully, trying not to introduce bugs that were already
fixed, trying to keep it fast and clean.  If you'd like to help me dedicate
more time to it, please consider making a donation!

<a href='http://www.pledgie.com/campaigns/18110'><img alt='Click here to
lend your support to: Funding development of UglifyJS 2.0 and make a
donation at www.pledgie.com !'
src='http://www.pledgie.com/campaigns/18110.png?skin_name=chrome' border='0'
/></a>
