nought: {
    input: {
        import "foo";
    }
    expect_exact: 'import"foo";'
}

default_only: {
    input: {
        import foo from "bar";
    }
    expect_exact: 'import foo from"bar";'
}

all_only: {
    input: {
        import * as foo from "bar";
    }
    expect_exact: 'import*as foo from"bar";'
}

keys_only: {
    input: {
        import { as as foo, bar, delete as baz } from "moo";
    }
    expect_exact: 'import{as as foo,bar,delete as baz}from"moo";'
}

default_all: {
    input: {
        import foo, * as bar from "baz";
    }
    expect_exact: 'import foo,*as bar from"baz";'
}

default_keys: {
    input: {
        import foo, { bar } from "baz";
    }
    expect_exact: 'import foo,{bar}from"baz";'
}

dynamic: {
    input: {
        (async a => await import(a))("foo").then(bar);
    }
    expect_exact: '(async a=>await import(a))("foo").then(bar);'
}

dynamic_nought: {
    input: {
        import(foo);
    }
    expect_exact: "import(foo);"
}

import_meta_1: {
    input: {
        console.log(import.meta, import.meta.url);
    }
    expect_exact: "console.log(import.meta,import.meta.url);"
}

import_meta_2: {
    input: {
        import.meta.url.split("/").forEach(function(part, index) {
            console.log(index, part);
        });
    }
    expect_exact: 'import.meta.url.split("/").forEach(function(part,index){console.log(index,part)});'
}

same_quotes: {
    beautify = {
        beautify: true,
        quote_style: 3,
    }
    input: {
        import 'foo';
        import "bar";
    }
    expect_exact: [
        "import 'foo';",
        "",
        'import "bar";',
    ]
}

drop_unused: {
    options = {
        imports: true,
        toplevel: true,
        unused: true,
    }
    input: {
        import a, * as b from "foo";
        import { c } from "bar";
        import { d, _ as e } from "baz";
        console.log(d);
    }
    expect: {
        import "foo";
        import "bar";
        import { d as d } from "baz";
        console.log(d);
    }
}

mangle: {
    rename = false
    mangle = {
        toplevel: true,
    }
    input: {
        import foo, { bar } from "baz";
        consoe.log(moo);
        import * as moo from "moz";
    }
    expect: {
        import o, { bar as m } from "baz";
        consoe.log(r);
        import * as r from "moz";
    }
}

rename_mangle: {
    rename = true
    mangle = {
        toplevel: true,
    }
    input: {
        import foo, { bar } from "baz";
        consoe.log(moo);
        import * as moo from "moz";
    }
    expect: {
        import o, { bar as m } from "baz";
        consoe.log(r);
        import * as r from "moz";
    }
}

keep_ref: {
    options = {
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        import foo from "bar";
        foo();
    }
    expect: {
        import foo from "bar";
        foo();
    }
}

forbid_merge: {
    options = {
        merge_vars: true,
        toplevel: true,
    }
    input: {
        import A from "foo";
        export default class extends A {}
        var f = () => () => {};
        f();
        f();
    }
    expect: {
        import A from "foo";
        export default class extends A {}
        var f = () => () => {};
        f();
        f();
    }
}

issue_4708_1: {
    options = {
        imports: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a;
        import a from "foo";
    }
    expect: {
        var a;
        import a from "foo";
    }
}

issue_4708_2: {
    options = {
        imports: true,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a;
        console.log(a);
        import a from "foo";
    }
    expect: {
        var a;
        console.log(a);
        import a from "foo";
    }
}
