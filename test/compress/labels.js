labels_1: {
    options = {
        conditionals: true,
        dead_code: true,
        if_return: true,
        unused: true,
    }
    input: {
        out: {
            if (foo) break out;
            console.log("bar");
        }
    };
    expect: {
        foo || console.log("bar");
    }
    expect_stdout: true
}

labels_2: {
    options = {
        conditionals: true,
        dead_code: true,
        if_return: true,
        unused: true,
    }
    input: {
        out: {
            if (foo) print("stuff");
            else break out;
            console.log("here");
        }
    };
    expect: {
        if (foo) {
            print("stuff");
            console.log("here");
        }
    }
}

labels_3: {
    options = {
        conditionals: true,
        dead_code: true,
        if_return: true,
    }
    input: {
        for (var i = 0; i < 5; ++i) {
            if (i < 3) continue;
            console.log(i);
        }
    };
    expect: {
        for (var i = 0; i < 5; ++i)
            i < 3 || console.log(i);
    }
    expect_stdout: true
}

labels_4: {
    options = {
        conditionals: true,
        dead_code: true,
        if_return: true,
        unused: true,
    }
    input: {
        out: for (var i = 0; i < 5; ++i) {
            if (i < 3) continue out;
            console.log(i);
        }
    };
    expect: {
        for (var i = 0; i < 5; ++i)
            i < 3 || console.log(i);
    }
    expect_stdout: true
}

labels_5: {
    options = {
        conditionals: true,
        dead_code: true,
        if_return: true,
    }
    // should keep the break-s in the following
    input: {
        while (foo) {
            if (bar) break;
            console.log("foo");
        }
        out: while (foo) {
            if (bar) break out;
            console.log("foo");
        }
    };
    expect: {
        while (foo) {
            if (bar) break;
            console.log("foo");
        }
        out: while (foo) {
            if (bar) break out;
            console.log("foo");
        }
    }
}

labels_6: {
    options = {
        dead_code: true,
    }
    input: {
        out: break out;
    };
    expect: {}
}

labels_7: {
    options = {
        conditionals: true,
        dead_code: true,
        if_return: true,
    }
    input: {
        while (foo) {
            x();
            y();
            continue;
        }
    };
    expect: {
        while (foo) {
            x();
            y();
        }
    }
}

labels_8: {
    options = {
        conditionals: true,
        dead_code: true,
        if_return: true,
    }
    input: {
        while (foo) {
            x();
            y();
            break;
        }
    };
    expect: {
        while (foo) {
            x();
            y();
            break;
        }
    }
}

labels_9: {
    options = {
        conditionals: true,
        dead_code: true,
        if_return: true,
        unused: true,
    }
    input: {
        out: while (foo) {
            x();
            y();
            continue out;
            z();
            k();
        }
    };
    expect: {
        while (foo) {
            x();
            y();
        }
    }
}

labels_10: {
    options = {
        conditionals: true,
        dead_code: true,
        if_return: true,
    }
    input: {
        out: while (foo) {
            x();
            y();
            break out;
            z();
            k();
        }
    };
    expect: {
        out: while (foo) {
            x();
            y();
            break out;
        }
    }
}

issue_4466_1: {
    mangle = {
        v8: false,
    }
    input: {
        A: if (console.log("PASS"))
            B:;
        else
            C:;
    }
    expect: {
        e: if (console.log("PASS"))
            l:;
        else
            l:;
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

issue_4466_1_v8: {
    mangle = {
        v8: true,
    }
    input: {
        A: if (console.log("PASS"))
            B:;
        else
            C:;
    }
    expect: {
        e: if (console.log("PASS"))
            l:;
        else
            o:;
    }
    expect_stdout: "PASS"
    node_version: ">=12"
}

issue_4466_2: {
    mangle = {
        toplevel: false,
        v8: false,
    }
    input: {
        if (console.log("PASS"))
            A:;
        else
            B:;
    }
    expect: {
        if (console.log("PASS"))
            e:;
        else
            e:;
    }
    expect_stdout: "PASS"
}

issue_4466_2_v8: {
    mangle = {
        toplevel: false,
        v8: true,
    }
    input: {
        if (console.log("PASS"))
            A:;
        else
            B:;
    }
    expect: {
        if (console.log("PASS"))
            e:;
        else
            l:;
    }
    expect_stdout: "PASS"
}

issue_4466_2_toplevel: {
    mangle = {
        toplevel: true,
        v8: false,
    }
    input: {
        if (console.log("PASS"))
            A:;
        else
            B:;
    }
    expect: {
        if (console.log("PASS"))
            e:;
        else
            e:;
    }
    expect_stdout: "PASS"
}

issue_4466_2_toplevel_v8: {
    mangle = {
        toplevel: true,
        v8: true,
    }
    input: {
        if (console.log("PASS"))
            A:;
        else
            B:;
    }
    expect: {
        if (console.log("PASS"))
            e:;
        else
            e:;
    }
    expect_stdout: "PASS"
}
