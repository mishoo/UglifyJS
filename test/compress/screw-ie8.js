do_screw: {
    options = { screw_ie8: true };
    beautify = {
        screw_ie8: true,
        ascii_only: true
    };

    input: f("\v");
    expect_exact: 'f("\\v");';
}

dont_screw: {
    options = { screw_ie8: false };
    beautify = { screw_ie8: false, ascii_only: true };

    input: f("\v");
    expect_exact: 'f("\\x0B");';
}