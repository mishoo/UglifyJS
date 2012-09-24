make_sequences_1: {
    options = {
        sequences: true
    };
    input: {
        foo();
        bar();
        baz();
    }
    expect: {
        foo(),bar(),baz();
    }
}

make_sequences_2: {
    options = {
        sequences: true
    };
    input: {
        if (boo) {
            foo();
            bar();
            baz();
        } else {
            x();
            y();
            z();
        }
    }
    expect: {
        if (boo) foo(),bar(),baz();
        else x(),y(),z();
    }
}

make_sequences_3: {
    options = {
        sequences: true
    };
    input: {
        function f() {
            foo();
            bar();
            return baz();
        }
        function g() {
            foo();
            bar();
            throw new Error();
        }
    }
    expect: {
        function f() {
            return foo(), bar(), baz();
        }
        function g() {
            throw foo(), bar(), new Error();
        }
    }
}

make_sequences_4: {
    options = {
        sequences: true
    };
    input: {
        x = 5;
        if (y) z();

        x = 5;
        for (i = 0; i < 5; i++) console.log(i);

        x = 5;
        for (; i < 5; i++) console.log(i);

        x = 5;
        switch (y) {}

        x = 5;
        with (obj) {}
    }
    expect: {
        if (x = 5, y) z();
        for (x = 5, i = 0; i < 5; i++) console.log(i);
        for (x = 5; i < 5; i++) console.log(i);
        switch (x = 5, y) {}
        with (x = 5, obj);
    }
}
