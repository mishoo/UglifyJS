holes_and_undefined: {
    input: {
        w = [1,,];
        x = [1, 2, undefined];
        y = [1, , 2, ];
        z = [1, undefined, 3];
    }
    expect: {
        w=[1,,];
        x=[1,2,void 0];
        y=[1,,2];
        z=[1,void 0,3];
    }
}
