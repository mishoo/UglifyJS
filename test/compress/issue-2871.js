comparison_with_undefined: {
    options = {
        comparisons: true,
    }
    input: {
        a == undefined
        a != undefined
        a === undefined
        a !== undefined
    }
    expect: {
        null == a
        null != a
        void 0 === a
        void 0 !== a
    }
}
