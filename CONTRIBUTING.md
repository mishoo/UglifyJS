Contributing
============

## Testing

All features and bugs should have tests that verify the fix. You can run all
tests using `npm test`.

The most common type of test are tests that verify input and output of the
Uglify transforms. These tests exist in `test/compress`. New tests can be added
either to an existing file or in a new file `issue-xxx.js`.

Tests that cannot be expressed as a simple AST can be found in `test/mocha`.

## Code style

- `LF` is always used as a line ending.
- Statements end with semicolons.
- Indentation uses 4 spaces, switch `case` 2 spaces.
- Identifiers use `snake_case`.
- Strings use double quotes (`"`).
- The Uglify code only uses ES5, even in the `harmony` branch.
- Line length should be at most 80 cols, except when it is easier to read a
  longer line.
- If both sides of a comparison are of the same type, `==` and `!=` are used.
- Multiline conditions place `&&` and `||` first on the line.

Example:

```js
if (compressor.option("comparisons")) switch (self.operator) {
  case "==":
  case "!=":
    // void 0 == x => null == x
    if (!is_strict_comparison && is_undefined(self.left, compressor)) {
        self.left = make_node(AST_Null, self.left);
    }
    // "undefined" == typeof x => undefined === x
    else if (compressor.option("typeofs")
        && self.left instanceof AST_String
        && self.left.value == "undefined"
        && self.right instanceof AST_UnaryPrefix
        && self.right.operator == "typeof") {
        var expr = self.right.expression;
        if (expr instanceof AST_SymbolRef ? expr.is_declared(compressor)
            : !(expr instanceof AST_PropAccess && compressor.option("ie8"))) {
            self.right = expr;
            self.left = make_node(AST_Undefined, self.left).optimize(compressor);
            if (self.operator.length == 2) self.operator += "=";
        }
    }
    ...
}
```
