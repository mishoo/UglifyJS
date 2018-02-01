keep_comparisons: {
    options = {
        comparisons: true,
        unsafe_comps: false
    }
    input: {
        var obj1 = {
            valueOf: function() {triggeredFirst();}
        }
        var obj2 = {
            valueOf: function() {triggeredSecond();}
        }
        var result1 = obj1 <= obj2;
        var result2 = obj1 <  obj2;
        var result3 = obj1 >= obj2;
        var result4 = obj1 >  obj2;
    }
    expect: {
        var obj1 = {
            valueOf: function() {triggeredFirst();}
        }
        var obj2 = {
            valueOf: function() {triggeredSecond();}
        }
        var result1 = obj1 <= obj2;
        var result2 = obj1 <  obj2;
        var result3 = obj1 >= obj2;
        var result4 = obj1 >  obj2;
    }
}

keep_comparisons_with_unsafe_comps: {
    options = {
        comparisons: true,
        unsafe_comps: true
    }
    input: {
        var obj1 = {
            valueOf: function() {triggeredFirst();}
        }
        var obj2 = {
            valueOf: function() {triggeredSecond();}
        }
        var result1 = obj1 <= obj2;
        var result2 = obj1 <  obj2;
        var result3 = obj1 >= obj2;
        var result4 = obj1 >  obj2;
    }
    expect: {
        var obj1 = {
            valueOf: function() {triggeredFirst();}
        }
        var obj2 = {
            valueOf: function() {triggeredSecond();}
        }
        var result1 = obj2 >= obj1;
        var result2 = obj2 >  obj1;
        var result3 = obj1 >= obj2;
        var result4 = obj1 >  obj2;
    }
}

dont_change_in_or_instanceof_expressions: {
    input: {
        1 in 1;
        null in null;
        1 instanceof 1;
        null instanceof null;
    }
    expect: {
        1 in 1;
        null in null;
        1 instanceof 1;
        null instanceof null;
    }
}

self_comparison_1: {
    options = {
        comparisons: true,
    }
    input: {
        a === a;
        a !== b;
        b.c === a.c;
        b.c !== b.c;
    }
    expect: {
        a == a;
        a !== b;
        b.c === a.c;
        b.c != b.c;
    }
}

self_comparison_2: {
    options = {
        comparisons: true,
        reduce_funcs: true,
        reduce_vars: true,
        toplevel: true,
    }
    input: {
        function f() {}
        var o = {};
        console.log(f != f, o === o);
    }
    expect: {
        function f() {}
        var o = {};
        console.log(false, true);
    }
    expect_stdout: "false true"
}

issue_2857_1: {
    options = {
        comparisons: true,
    }
    input: {
        a === undefined || a === null;
        a === undefined || a !== null;
        a !== undefined || a === null;
        a !== undefined || a !== null;
        a === undefined && a === null;
        a === undefined && a !== null;
        a !== undefined && a === null;
        a !== undefined && a !== null;
    }
    expect: {
        null == a;
        void 0 === a || null !== a;
        void 0 !== a || null === a;
        void 0 !== a || null !== a;
        void 0 === a && null === a;
        void 0 === a && null !== a;
        void 0 !== a && null === a;
        null != a;
    }
}

issue_2857_2: {
    options = {
        comparisons: true,
    }
    input: {
        a === undefined || a === null || p;
        a === undefined || a !== null || p;
        a !== undefined || a === null || p;
        a !== undefined || a !== null || p;
        a === undefined && a === null || p;
        a === undefined && a !== null || p;
        a !== undefined && a === null || p;
        a !== undefined && a !== null || p;
    }
    expect: {
        null == a || p;
        void 0 === a || null !== a || p;
        void 0 !== a || null === a || p;
        void 0 !== a || null !== a || p;
        void 0 === a && null === a || p;
        void 0 === a && null !== a || p;
        void 0 !== a && null === a || p;
        null != a || p;
    }
}

issue_2857_3: {
    options = {
        comparisons: true,
    }
    input: {
        a === undefined || a === null && p;
        a === undefined || a !== null && p;
        a !== undefined || a === null && p;
        a !== undefined || a !== null && p;
        a === undefined && a === null && p;
        a === undefined && a !== null && p;
        a !== undefined && a === null && p;
        a !== undefined && a !== null && p;
    }
    expect: {
        void 0 === a || null === a && p;
        void 0 === a || null !== a && p;
        void 0 !== a || null === a && p;
        void 0 !== a || null !== a && p;
        void 0 === a && null === a && p;
        void 0 === a && null !== a && p;
        void 0 !== a && null === a && p;
        null != a && p;
    }
}

issue_2857_4: {
    options = {
        comparisons: true,
    }
    input: {
        p || a === undefined || a === null;
        p || a === undefined || a !== null;
        p || a !== undefined || a === null;
        p || a !== undefined || a !== null;
        p || a === undefined && a === null;
        p || a === undefined && a !== null;
        p || a !== undefined && a === null;
        p || a !== undefined && a !== null;
    }
    expect: {
        p || null == a;
        p || void 0 === a || null !== a;
        p || void 0 !== a || null === a;
        p || void 0 !== a || null !== a;
        p || void 0 === a && null === a;
        p || void 0 === a && null !== a;
        p || void 0 !== a && null === a;
        p || null != a;
    }
}

issue_2857_5: {
    options = {
        comparisons: true,
    }
    input: {
        p && a === undefined || a === null;
        p && a === undefined || a !== null;
        p && a !== undefined || a === null;
        p && a !== undefined || a !== null;
        p && a === undefined && a === null;
        p && a === undefined && a !== null;
        p && a !== undefined && a === null;
        p && a !== undefined && a !== null;
    }
    expect: {
        p && void 0 === a || null === a;
        p && void 0 === a || null !== a;
        p && void 0 !== a || null === a;
        p && void 0 !== a || null !== a;
        p && void 0 === a && null === a;
        p && void 0 === a && null !== a;
        p && void 0 !== a && null === a;
        p && null != a;
    }
}
