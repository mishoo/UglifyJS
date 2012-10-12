keep_name_of_getter: {
    input: { a = { get foo () {} } }
    expect: { a = { get foo () {} } }
}

keep_name_of_setter: {
    input: { a = { set foo () {} } }
    expect: { a = { set foo () {} } }
}
