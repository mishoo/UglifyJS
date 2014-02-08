alphabetize_disabled_by_default: {
    options = {};
    input: {
        foo({
            c: 1,
            a: 2,
            b: 3
        });
    }
    expect: {
        foo({
            c: 1,
            a: 2,
            b: 3
        });
    }
}

alphabetize_orders_keys: {
    options = { alphabetize: true };
    input: {
        foo({
            c: 1,
            a: 2,
            b: 3
        });
    }
    expect: {
        foo({
            a: 2,
            b: 3,
            c: 1
        });
    }
}
