hex_numbers_in_parentheses_for_prototype_functions: {
    input: {
        (-2);
        (-2).toFixed(0);

        (2);
        (2).toFixed(0);

        (0.2);
        (0.2).toFixed(0);

        (0.00000002);
        (0.00000002).toFixed(0);

        (1000000000000000128);
        (1000000000000000128).toFixed(0);
    }
    expect_exact: "-2;(-2).toFixed(0);2;2..toFixed(0);.2;.2.toFixed(0);2e-8;2e-8.toFixed(0);0xde0b6b3a7640080;(0xde0b6b3a7640080).toFixed(0);"
}
