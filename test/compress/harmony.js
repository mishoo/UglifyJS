arrow_functions: {
    input: {
        (a) => b;  // 1 args
        (a, b) => c;  // n args
        () => b;  // 0 args
        (a) => (b) => c;  // func returns func returns func
        (a) => ((b) => c);  // So these parens are dropped
        () => (b,c) => d;  // func returns func returns func
        a=>{return b;}
        a => 'lel';  // Dropping the parens
    }
    expect_exact: "a=>b;(a,b)=>c;()=>b;a=>b=>c;a=>b=>c;()=>(b,c)=>d;a=>{return b};a=>\"lel\";"
}

arrow_function_parens: {
    input: {
        something && (() => {});
    }
    expect_exact: "something&&(()=>{});"
}
arrow_function_parens_2: {
    input: {
        (() => null)();
    }
    expect_exact: "(()=>null)();"
}

regression_arrow_functions_and_hoist: {
    options = {
        hoist_vars: true,
        hoist_funs: true
    }
    input: {
        (a) => b;
    }
    expect_exact: "a=>b;"
}
