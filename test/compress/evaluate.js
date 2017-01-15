negative_zero: {
    options = { evaluate: true }
    input: {
        console.log(
            -"",
            - -"",
            1 / (-0),
            1 / (-"")
        );
    }
    expect: {
        console.log(
            -0,
            0,
            1 / (-0),
            1 / (-0)
        );
    }
}

positive_zero: {
    options = { evaluate: true }
    input: {
        console.log(
            +"",
            + -"",
            1 / (+0),
            1 / (+"")
        );
    }
    expect: {
        console.log(
            0,
            -0,
            1 / (0),
            1 / (0)
        );
    }
}

unsafe_constant: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            true.a,
            false.a,
            null.a,
            undefined.a
        );
    }
    expect: {
        console.log(
            true.a,
            false.a,
            null.a,
            (void 0).a
        );
    }
}

unsafe_object: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            ({a:1}) + 1,
            ({a:1}).a + 1,
            ({a:1}).b + 1,
            ({a:1}).a.b + 1
        );
    }
    expect: {
        console.log(
            ({a:1}) + 1,
            2,
            ({a:1}).b + 1,
            1..b + 1
        );
    }
}

unsafe_object_nested: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            ({a:{b:1}}) + 1,
            ({a:{b:1}}).a + 1,
            ({a:{b:1}}).b + 1,
            ({a:{b:1}}).a.b + 1
        );
    }
    expect: {
        console.log(
            ({a:{b:1}}) + 1,
            ({a:{b:1}}).a + 1,
            ({a:{b:1}}).b + 1,
            2
        );
    }
}

unsafe_object_complex: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            ({a:{b:1},b:1}) + 1,
            ({a:{b:1},b:1}).a + 1,
            ({a:{b:1},b:1}).b + 1,
            ({a:{b:1},b:1}).a.b + 1
        );
    }
    expect: {
        console.log(
            ({a:{b:1},b:1}) + 1,
            ({a:{b:1},b:1}).a + 1,
            2,
            2
        );
    }
}

unsafe_object_repeated: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            ({a:{b:1},a:1}) + 1,
            ({a:{b:1},a:1}).a + 1,
            ({a:{b:1},a:1}).b + 1,
            ({a:{b:1},a:1}).a.b + 1
        );
    }
    expect: {
        console.log(
            ({a:{b:1},a:1}) + 1,
            2,
            ({a:{b:1},a:1}).b + 1,
            1..b + 1
        );
    }
}

unsafe_function: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            ({a:{b:1},b:function(){}}) + 1,
            ({a:{b:1},b:function(){}}).a + 1,
            ({a:{b:1},b:function(){}}).b + 1,
            ({a:{b:1},b:function(){}}).a.b + 1
        );
    }
    expect: {
        console.log(
            ({a:{b:1},b:function(){}}) + 1,
            ({a:{b:1},b:function(){}}).a + 1,
            ({a:{b:1},b:function(){}}).b + 1,
            ({a:{b:1},b:function(){}}).a.b + 1
        );
    }
}

unsafe_integer_key: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            ({0:1}) + 1,
            ({0:1})[0] + 1,
            ({0:1})["0"] + 1,
            ({0:1})[1] + 1,
            ({0:1})[0][1] + 1,
            ({0:1})[0]["1"] + 1
        );
    }
    expect: {
        console.log(
            ({0:1}) + 1,
            2,
            2,
            ({0:1})[1] + 1,
            1[1] + 1,
            1["1"] + 1
        );
    }
}

unsafe_integer_key_complex: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            ({0:{1:1},1:1}) + 1,
            ({0:{1:1},1:1})[0] + 1,
            ({0:{1:1},1:1})["0"] + 1,
            ({0:{1:1},1:1})[1] + 1,
            ({0:{1:1},1:1})[0][1] + 1,
            ({0:{1:1},1:1})[0]["1"] + 1
        );
    }
    expect: {
        console.log(
            ({0:{1:1},1:1}) + 1,
            "[object Object]1",
            "[object Object]1",
            2,
            2,
            2
        );
    }
}

unsafe_float_key: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            ({2.72:1}) + 1,
            ({2.72:1})[2.72] + 1,
            ({2.72:1})["2.72"] + 1,
            ({2.72:1})[3.14] + 1,
            ({2.72:1})[2.72][3.14] + 1,
            ({2.72:1})[2.72]["3.14"] + 1
        );
    }
    expect: {
        console.log(
            ({2.72:1}) + 1,
            2,
            2,
            ({2.72:1})[3.14] + 1,
            1[3.14] + 1,
            1["3.14"] + 1
        );
    }
}

unsafe_float_key_complex: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            ({2.72:{3.14:1},3.14:1}) + 1,
            ({2.72:{3.14:1},3.14:1})[2.72] + 1,
            ({2.72:{3.14:1},3.14:1})["2.72"] + 1,
            ({2.72:{3.14:1},3.14:1})[3.14] + 1,
            ({2.72:{3.14:1},3.14:1})[2.72][3.14] + 1,
            ({2.72:{3.14:1},3.14:1})[2.72]["3.14"] + 1
        );
    }
    expect: {
        console.log(
            "[object Object]1",
            "[object Object]1",
            "[object Object]1",
            2,
            2,
            2
        );
    }
}

unsafe_array: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            [1, , 3][1],
            [1, 2, 3, a] + 1,
            [1, 2, 3, 4] + 1,
            [1, 2, 3, a][0] + 1,
            [1, 2, 3, 4][0] + 1,
            [1, 2, 3, 4][6 - 5] + 1,
            [1, , 3, 4][6 - 5] + 1,
            [[1, 2], [3, 4]][0] + 1,
            [[1, 2], [3, 4]][6 - 5][1] + 1,
            [[1, 2], , [3, 4]][6 - 5][1] + 1
        );
    }
    expect: {
        console.log(
            void 0,
            [1, 2, 3, a] + 1,
            "1,2,3,41",
            [1, 2, 3, a][0] + 1,
            2,
            3,
            NaN,
            "1,21",
            5,
            (void 0)[1] + 1
        );
    }
}

unsafe_string: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            "1234" + 1,
            "1234"[0] + 1,
            "1234"[6 - 5] + 1,
            ("12" + "34")[0] + 1,
            ("12" + "34")[6 - 5] + 1,
            [1, 2, 3, 4].join("")[0] + 1
        );
    }
    expect: {
        console.log(
            "12341",
            "11",
            "21",
            "11",
            "21",
            "11"
        );
    }
}

unsafe_array_bad_index: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            [1, 2, 3, 4].a + 1,
            [1, 2, 3, 4]["a"] + 1,
            [1, 2, 3, 4][3.14] + 1
        );
    }
    expect: {
        console.log(
            [1, 2, 3, 4].a + 1,
            [1, 2, 3, 4]["a"] + 1,
            [1, 2, 3, 4][3.14] + 1
        );
    }
}

unsafe_string_bad_index: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        console.log(
            "1234".a + 1,
            "1234"["a"] + 1,
            "1234"[3.14] + 1
        );
    }
    expect: {
        console.log(
            "1234".a + 1,
            "1234"["a"] + 1,
            "1234"[3.14] + 1
        );
    }
}

unsafe_prototype_function: {
    options = {
        evaluate  : true,
        unsafe    : true
    }
    input: {
        var a = ({valueOf: 0}) < 1;
        var b = ({toString: 0}) < 1;
        var c = ({valueOf: 0}) + "";
        var d = ({toString: 0}) + "";
        var e = (({valueOf: 0}) + "")[2];
        var f = (({toString: 0}) + "")[2];
        var g = ({valueOf: 0}).valueOf();
        var h = ({toString: 0}).toString();
    }
    expect: {
        var a = ({valueOf: 0}) < 1;
        var b = ({toString: 0}) < 1;
        var c = ({valueOf: 0}) + "";
        var d = ({toString: 0}) + "";
        var e = (({valueOf: 0}) + "")[2];
        var f = (({toString: 0}) + "")[2];
        var g = ({valueOf: 0}).valueOf();
        var h = "" + ({toString: 0});
    }
}
