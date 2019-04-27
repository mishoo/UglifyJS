function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _require = require("bar"),
    foo = _require.foo;

var _require2 = require("world"),
    hello = _require2.hello;

foo.x.apply(foo, _toConsumableArray(foo.y(hello.z)));

//# sourceMappingURL=input.js.map
