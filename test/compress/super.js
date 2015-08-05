
super_can_be_parsed: {
    input: {
        super(1,2);
        super.meth();
    }
    expect_exact: "super(1,2);super.meth();"
}

