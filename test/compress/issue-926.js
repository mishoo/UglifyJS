template_strings: {
    input: {
        foo(
            `<span>${contents}</span>`,
            `<a href="${url}">${text}</a>`
        );
    }
    expect_exact: "foo(`<span>${contents}</span>`,`<a href=\"${url}\">${text}</a>`);"
}
