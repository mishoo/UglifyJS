dont_reuse_prop: {
    mangle_props = {
        regex: /asd/
    }
    input: {
        "aaaaaaaaaabbbbb";
        var obj = {};
        obj.a = 123;
        obj.asd = 256;
        console.log(obj.a);
    }
    expect: {
        "aaaaaaaaaabbbbb";
        var obj = {};
        obj.a = 123;
        obj.b = 256;
        console.log(obj.a);
    }
    expect_stdout: "123"
}

unmangleable_props_should_always_be_reserved: {
    mangle_props = {
        regex: /asd/
    }
    input: {
        "aaaaaaaaaabbbbb";
        var obj = {};
        obj.asd = 256;
        obj.a = 123;
        console.log(obj.a);
    }
    expect: {
        "aaaaaaaaaabbbbb";
        var obj = {};
        obj.b = 256;
        obj.a = 123;
        console.log(obj.a);
    }
    expect_stdout: "123"
}
