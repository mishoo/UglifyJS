dont_reuse_prop: {
    mangle_props = {
        regex: /asd/
    };

    input: {
        var obj = {};
        obj.a = 123;
        obj.asd = 256;
        console.log(obj.a);
    }
    expect: {
        var obj = {};
        obj.a = 123;
        obj.b = 256;
        console.log(obj.a);
    }
}

unmangleable_props_should_always_be_reserved: {
    mangle_props = {
        regex: /asd/
    };

    input: {
        var obj = {};
        obj.asd = 256;
        obj.a = 123;
        console.log(obj.a);
    }
    expect: {
        var obj = {};
        obj.b = 256;
        obj.a = 123;
        console.log(obj.a);
    }
}