remove_redundant_sequence_items: {
    options = { side_effects: true };
    input: {
        (0, 1, logThis)();
        (0, 1, _decorators.logThis)();
    }
    expect: {
        logThis();
        (0, _decorators.logThis)();
    }
}

dont_remove_this_binding_sequence: {
    options = { side_effects: true };
    input: {
        (0, logThis)();
        (0, _decorators.logThis)();
    }
    expect: {
        logThis();
        (0, _decorators.logThis)();
    }
}
