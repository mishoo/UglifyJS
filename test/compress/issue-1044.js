issue_1044: {
    options = { evaluate: true, conditionals: true };
    input: {
        const mixed = Base ? class extends Base {} : class {}
    }
    expect: {
        const mixed = Base ? class extends Base {} : class {}
    }
}
