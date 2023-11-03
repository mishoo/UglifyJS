mangle_props: {
    mangle = {
        properties: true,
    }
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
            obj[-(1/0)],
            obj["-Infinity"],
            obj[null],
            obj["null"]
        );
    }
    expect_stdout: "1 1 1 2 2 2 3 3 3 4 4 4 5 5"
    expect_warnings: [
        "INFO: Preserving reserved property undefined",
        "INFO: Preserving reserved property NaN",
        "INFO: Preserving reserved property Infinity",
        "INFO: Preserving reserved property -Infinity",
        "INFO: Preserving reserved property null",
        "INFO: Preserving reserved property log",
    ]
}

numeric_literal: {
    mangle = {
        properties: {
            domprops: true,
        },
    }
    beautify = {
        beautify: true,
    }
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
        '    42: 3,',
        '    37: 4,',
        '    o: 5,',
        '    1e42: 6,',
        '    b: 7,',
        '    1e42: 8',
        '};',
        '',
        'console.log(obj[-0], obj[-""], obj["-0"]);',
        '',
        'console.log(obj[42], obj["42"]);',
        '',
        'console.log(obj[37], obj["o"], obj[37], obj["37"]);',
        '',
        'console.log(obj[1e42], obj["b"], obj["1e+42"]);',
    ]
    expect_stdout: [
        "0 0 1",
        "3 3",
        "4 5 4 4",
        "8 7 8",
    ]
    expect_warnings: [
        "INFO: Mapping property 0x25 to o",
        "INFO: Mapping property 1E42 to b",
        "INFO: Preserving reserved property log",
    ]
}

identifier: {
    mangle = {
        properties: {
            builtins: true,
            domprops: true,
        },
    }
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
            e: 1,
            t: 2,
            n: 3,
            a: 4,
            i: 5,
            o: 6,
            r: 7,
            l: 8,
            s: 9,
            c: 10,
            f: 11,
            u: 12,
            d: 13,
            h: 14,
            p: 15,
            b: 16,
            v: 17,
            w: 18,
            y: 19,
            g: 20,
            m: 21,
            k: 22,
            x: 23,
            j: 24,
            z: 25,
            q: 26,
            A: 27,
            B: 28,
            C: 29,
            D: 30,
            E: 31,
            F: 32,
            G: 33,
            H: 34,
            I: 35,
            J: 36,
            K: 37,
            L: 38,
            M: 39,
            N: 40,
            O: 41,
            P: 42,
            Q: 43,
            R: 44,
            S: 45,
            T: 46,
            U: 47,
            V: 48,
            W: 49,
            X: 50,
            Y: 51,
            Z: 52,
            $: 53,
            _: 54,
            ee: 55,
            te: 56,
            ne: 57,
            ae: 58,
            ie: 59,
            oe: 60,
            re: 61,
        };
    }
}
