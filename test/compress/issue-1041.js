const_declaration: {
    options = {
        evaluate: true
    };

    input: {
        const goog = goog || {};
    }
    expect: {
        const goog = goog || {};
    }
}

const_pragma: {
    options = {
        evaluate: true
    };

    input: {
        /** @const */ var goog = goog || {};
    }
    expect: {
        var goog = goog || {};
    }
}

// for completeness' sake
not_const: {
    options = {
        evaluate: true
    };

    input: {
        var goog = goog || {};
    }
    expect: {
        var goog = goog || {};
    }
}
