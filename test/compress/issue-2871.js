comparison_with_undefined: {
    options = {
        comparisons: true,
    }
    input: {
        a == undefined;
        a != undefined;
        a === undefined;
        a !== undefined;

        undefined == a;
        undefined != a;
        undefined === a;
        undefined !== a;

        void 0 == a;
        void 0 != a;
        void 0 === a;
        void 0 !== a;
    }
    expect: {
        null == a;
        null != a;
        void 0 === a;
        void 0 !== a;

        null == a;
        null != a;
        void 0 === a;
        void 0 !== a;

        null == a;
        null != a;
        void 0 === a;
        void 0 !== a;
    }
}
