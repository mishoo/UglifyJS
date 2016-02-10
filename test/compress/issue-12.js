keep_name_of_getter: {
    options = { unused: true };
    input: { a = { get foo () {} } }
    expect: { a = { get foo () {} } }
}

keep_name_of_setter: {
    options = { unused: true };
    input: { a = { set foo () {} } }
    expect: { a = { set foo () {} } }
}

setter_with_operator_keys: {
    input: {
        var tokenCodes  = {
            get instanceof(){
                return test0;
            },
            set instanceof(value){
                test0 = value;
            },
            set typeof(value){
                test1 = value;
            },
            get typeof(){
                return test1;
            },
            set else(value){
                test2 = value;
            },
            get else(){
                return test2;
            }
        };
    }
    expect: {
        var tokenCodes  = {
            get instanceof(){
                return test0;
            },
            set instanceof(value){
                test0 = value;
            },
            set typeof(value){
                test1 = value;
            },
            get typeof(){
                return test1;
            },
            set else(value){
                test2 = value;
            },
            get else(){
                return test2;
            }
        };
    }
}