catch_destructuring_with_sequence: {
    input: {
        try {
            throw {};
        } catch ({xCover = (0, function() {})} ) {
        }
    }
    expect_exact: "try{throw{}}catch({xCover=(0,function(){})}){}"
}
