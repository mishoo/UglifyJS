issue_1043: {
    options = {
        side_effects: true
    };

    input: {
        function* range(start = 0, end = null, step = 1) {
            if (end == null) {
                end = start;
                start = 0;
            }

            for (let i = start; i < end; i += step) {
                yield i;
            }
        }
    }

    expect: {
        function* range(start = 0, end = null, step = 1) {
            if (null == end) {
                end = start;
                start = 0;
            }

            for (let i = start; i < end; i += step)
                yield i;
        }
    }
}
