negative_zero: {
    options = { evaluate: true }
    input: {
        assert.sameValue(-"", -0, '-""');
    }
    expect: {
        assert.sameValue(-"", -0, '-""');
    }
}
