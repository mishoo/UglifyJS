only_vars: {
    options = { join_vars: true };
    input: {
        let netmaskBinary = '';
        for (let i = 0; i < netmaskBits; ++i) {
            netmaskBinary += '1';
        }
    }
    expect: {
        let netmaskBinary = '';
        for (let i = 0; i < netmaskBits; ++i) netmaskBinary += '1';
    }
}

issue_1079_with_vars: {
    options = { join_vars: true };
    input: {
        var netmaskBinary = '';
        for (var i = 0; i < netmaskBits; ++i) {
            netmaskBinary += '1';
        }
    }
    expect: {
        for (var netmaskBinary = '', i = 0; i < netmaskBits; ++i) netmaskBinary += '1';
    }
}

issue_1079_with_mixed: {
    options = { join_vars: true };
    input: {
        var netmaskBinary = '';
        for (let i = 0; i < netmaskBits; ++i) {
            netmaskBinary += '1';
        }
    }
    expect: {
        var netmaskBinary = ''
        for (let i = 0; i < netmaskBits; ++i) netmaskBinary += '1';
    }
}