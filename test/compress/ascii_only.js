prevents_unicode_escape_sequences_from_being_converted: {
    options = {ascii_only: true};
    input: {
        var a = "\u2000";
    }
    expect: {
        var a = "\u2000";
    }
}

converts_unicode_characters_to_escape_sequences: {
    options = {ascii_only: true};
    input: {
        var a = " ";
    }
    expect: {
        var a = "\u2000";
    }
}
