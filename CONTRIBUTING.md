Contributing
============

## Documentation

Every new feature and API change should be accompanied by a README additon.

## Testing

All features and bugs should have tests that verify the fix. You can run all
tests using `npm test`.

The most common type of test are tests that verify input and output of the
Uglify transforms. These tests exist in `test/compress`. New tests can be added
either to an existing file or in a new file `issue-xxx.js`.

Tests that cannot be expressed as a simple AST can be found in `test/mocha`.

## Code style

- File encoding must be `UTF-8`.
- `LF` is always used as a line ending.
- Statements end with semicolons.
- Indentation uses 4 spaces, switch `case` 2 spaces.
- Identifiers use `snake_case`.
- Strings use double quotes (`"`).
- Use a trailing comma for multiline array and object literals to minimize diffs.
- The Uglify code only uses ES5, even in the `harmony` branch.
- Line length should be at most 80 cols, except when it is easier to read a
  longer line.
- If both sides of a comparison are of the same type, `==` and `!=` are used.
- Multiline conditions place `&&` and `||` first on the line.

**Example feature**

```js
OPT(AST_Debugger, function(self, compressor) {
    if (compressor.option("drop_debugger"))
        return make_node(AST_EmptyStatement, self);
    return self;
});
```

**Example test case**

```js
drop_debugger: {
    options = {
        drop_debugger: true,
    }
    input: {
        debugger;
        if (foo) debugger;
    }
    expect: {
        if (foo);
    }
}
```


