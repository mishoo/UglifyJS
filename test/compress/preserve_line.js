return_1: {
    beautify = {
        beautify: false,
        preserve_line: true,
    }
    input: {
        console.log(function f() {
            return (
                f.toString() != 42
            );
        }());
    }
    expect_exact: [
        "console.log(function f(){",
        "",
        "return 42!=f.toString()}());",
    ]
    expect_stdout: "true"
}

return_2: {
    beautify = {
        beautify: true,
        preserve_line: true,
    }
    input: {
        console.log(function f() {
            return (
                f.toString() != 42
            );
        }());
    }
    expect_exact: [
        "console.log(function f() {",
        "",
        "    return 42 != f.toString();",
        "}());",
    ]
    expect_stdout: "true"
}

return_3: {
    options = {}
    beautify = {
        beautify: false,
        preserve_line: true,
    }
    input: {
        console.log(function f() {
            return (
                f.toString() != 42
            );
        }());
    }
    expect_exact: [
        "console.log(function f(){",
        "",
        "return 42!=f.toString()}());",
    ]
    expect_stdout: "true"
}

return_4: {
    options = {}
    beautify = {
        beautify: true,
        preserve_line: true,
    }
    input: {
        console.log(function f() {
            return (
                f.toString() != 42
            );
        }());
    }
    expect_exact: [
        "console.log(function f() {",
        "",
        "    return 42 != f.toString();",
        "}());",
    ]
    expect_stdout: "true"
}

return_5: {
    beautify = {
        beautify: false,
        preserve_line: true,
    }
    input: {
        _is_selected = function(tags, slug) {
            var ref;
            return (ref = _.find(tags, {
                slug: slug
            })) != null ? ref.selected : void 0;
        };
    }
    expect_exact: [
        "_is_selected=function(tags,slug){",
        "var ref;",
        "",
        "",
        "return null!=(ref=_.find(tags,{slug:slug}))?ref.selected:void 0};",
    ]
}

return_6: {
    beautify = {
        beautify: true,
        preserve_line: true,
    }
    input: {
        _is_selected = function(tags, slug) {
            var ref;
            return (ref = _.find(tags, {
                slug: slug
            })) != null ? ref.selected : void 0;
        };
    }
    expect_exact: [
        "_is_selected = function(tags, slug) {",
        "    var ref;",
        "",
        "",
        "    return null != (ref = _.find(tags, {",
        "        slug: slug",
        "    })) ? ref.selected : void 0;",
        "};",
    ]
}

return_7: {
    options = {}
    mangle = {}
    beautify = {
        beautify: false,
        preserve_line: true,
    }
    input: {
        _is_selected = function(tags, slug) {
            var ref;
            return (ref = _.find(tags, {
                slug: slug
            })) != null ? ref.selected : void 0;
        };
    }
    expect_exact: [
        "_is_selected=function(e,l){",
        "var n;",
        "",
        "",
        "return null!=(n=_.find(e,{slug:l}))?n.selected:void 0};",
    ]
}

return_8: {
    options = {}
    mangle = {}
    beautify = {
        beautify: true,
        preserve_line: true,
    }
    input: {
        _is_selected = function(tags, slug) {
            var ref;
            return (ref = _.find(tags, {
                slug: slug
            })) != null ? ref.selected : void 0;
        };
    }
    expect_exact: [
        "_is_selected = function(e, l) {",
        "    var n;",
        "",
        "",
        "    return null != (n = _.find(e, {",
        "        slug: l",
        "    })) ? n.selected : void 0;",
        "};",
    ]
}
