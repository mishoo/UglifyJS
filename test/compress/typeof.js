typeof_evaluation: {
    options = {
        evaluate: true
    };
    input: {
        a = typeof 1;
        b = typeof 'test';
        c = typeof [];
        d = typeof {};
        e = typeof /./;
        f = typeof false;
        g = typeof function(){};
        h = typeof undefined;
    }
    expect: {
        a='number';
        b='string';
        c=typeof[];
        d=typeof{};
        e=typeof/./;
        f='boolean';
        g='function';
        h='undefined';
    }
}

typeof_in_boolean_context: {
    options = {
        booleans     : true,
        evaluate     : true,
        conditionals : true,
        side_effects : true,
    };
    input: {
        function f1(x) { return typeof x ? "yes" : "no"; }
        function f2() { return typeof g()? "Yes" : "No"; }
        typeof 0 ? foo() : bar();
        !typeof console.log(1);
        var a = !typeof console.log(2);
        if (typeof (1 + foo()));
    }
    expect: {
        function f1(x) { return "yes"; }
        function f2() { return g(), "Yes"; }
        foo();
        console.log(1);
        var a = !(console.log(2), !0);
        foo();
    }
}

issue_1668: {
    options = {
        booleans: true,
    }
    input: {
        if (typeof bar);
    }
    expect: {
        if (!0);
    }
}
