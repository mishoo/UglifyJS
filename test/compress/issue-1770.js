mangle_props: {
    mangle_props = {}
    input: {
        var obj = {
            undefined: 1,
            NaN: 2,
            Infinity: 3,
            "-Infinity": 4,
            null: 5,
        };
        console.log(
            obj[void 0],
            obj[undefined],
            obj["undefined"],
            obj[0/0],
            obj[NaN],
            obj["NaN"],
            obj[1/0],
            obj[Infinity],
            obj["Infinity"],
            obj[-1/0],
            obj[-Infinity],
            obj["-Infinity"],
            obj[null],
            obj["null"]
        );
    }
    expect: {
        var obj = {
            undefined: 1,
            NaN: 2,
            Infinity: 3,
            "-Infinity": 4,
            null: 5,
        };
        console.log(
            obj[void 0],
            obj[void 0],
            obj["undefined"],
            obj[0/0],
            obj[NaN],
            obj["NaN"],
            obj[1/0],
            obj[1/0],
            obj["Infinity"],
            obj[-1/0],
            obj[-1/0],
            obj["-Infinity"],
            obj[null],
            obj["null"]
        );
    }
    expect_stdout: "1 1 1 2 2 2 3 3 3 4 4 4 5 5"
}

numeric_literal: {
    beautify = {
        beautify: true,
    }
    mangle_props = {}
    input: {
        var obj = {
            0: 0,
            "-0": 1,
            42: 2,
            "42": 3,
            0x25: 4,
            "0x25": 5,
            1E42: 6,
            "1E42": 7,
            "1e+42": 8,
        };
        console.log(obj[-0], obj[-""], obj["-0"]);
        console.log(obj[42], obj["42"]);
        console.log(obj[0x25], obj["0x25"], obj[37], obj["37"]);
        console.log(obj[1E42], obj["1E42"], obj["1e+42"]);
    }
    expect_exact: [
        'var obj = {',
        '    0: 0,',
        '    "-0": 1,',
        '    42: 2,',
        '    "42": 3,',
        '    37: 4,',
        '    a: 5,',
        '    1e42: 6,',
        '    b: 7,',
        '    "1e+42": 8',
        '};',
        '',
        'console.log(obj[-0], obj[-""], obj["-0"]);',
        '',
        'console.log(obj[42], obj["42"]);',
        '',
        'console.log(obj[37], obj["a"], obj[37], obj["37"]);',
        '',
        'console.log(obj[1e42], obj["b"], obj["1e+42"]);',
    ]
    expect_stdout: [
        "0 0 1",
        "3 3",
        "4 5 4 4",
        "8 7 8",
    ]
}

identifier: {
    mangle_props = {}
    input: {
        var obj = {
            abstract: 1,
            boolean: 2,
            byte: 3,
            char: 4,
            class: 5,
            double: 6,
            enum: 7,
            export: 8,
            extends: 9,
            final: 10,
            float: 11,
            goto: 12,
            implements: 13,
            import: 14,
            int: 15,
            interface: 16,
            let: 17,
            long: 18,
            native: 19,
            package: 20,
            private: 21,
            protected: 22,
            public: 23,
            short: 24,
            static: 25,
            super: 26,
            synchronized: 27,
            this: 28,
            throws: 29,
            transient: 30,
            volatile: 31,
            yield: 32,
            false: 33,
            null: 34,
            true: 35,
            break: 36,
            case: 37,
            catch: 38,
            const: 39,
            continue: 40,
            debugger: 41,
            default: 42,
            delete: 43,
            do: 44,
            else: 45,
            finally: 46,
            for: 47,
            function: 48,
            if: 49,
            in: 50,
            instanceof: 51,
            new: 52,
            return: 53,
            switch: 54,
            throw: 55,
            try: 56,
            typeof: 57,
            var: 58,
            void: 59,
            while: 60,
            with: 61,
        };
    }
    expect: {
        var obj = {
            a: 1,
            b: 2,
            c: 3,
            d: 4,
            e: 5,
            f: 6,
            g: 7,
            h: 8,
            i: 9,
            j: 10,
            k: 11,
            l: 12,
            m: 13,
            n: 14,
            o: 15,
            p: 16,
            q: 17,
            r: 18,
            s: 19,
            t: 20,
            u: 21,
            v: 22,
            w: 23,
            x: 24,
            y: 25,
            z: 26,
            A: 27,
            B: 28,
            C: 29,
            D: 30,
            F: 31,
            G: 32,
            false: 33,
            null: 34,
            true: 35,
            H: 36,
            I: 37,
            J: 38,
            K: 39,
            L: 40,
            M: 41,
            N: 42,
            O: 43,
            P: 44,
            Q: 45,
            R: 46,
            S: 47,
            T: 48,
            U: 49,
            V: 50,
            W: 51,
            X: 52,
            Y: 53,
            Z: 54,
            $: 55,
            _: 56,
            aa: 57,
            ba: 58,
            ca: 59,
            da: 60,
            ea: 61,
        };
    }
}
