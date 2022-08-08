"use strict";

function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
    }
    return arr2;
}

var _require = require("bar"), foo = _require.foo;

var _require2 = require("world"), hello = _require2.hello;

foo.x.apply(foo, _toConsumableArray(foo.y(hello.z)));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImlucHV0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHtmb299ID0gcmVxdWlyZShcImJhclwiKTtcbmNvbnN0IHtoZWxsb30gPSByZXF1aXJlKFwid29ybGRcIik7XG5cbmZvby54KC4uLmZvby55KGhlbGxvLnopKTtcbiJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiZm9vIiwiaGVsbG8iLCJ4IiwiYXBwbHkiLCJfdG9Db25zdW1hYmxlQXJyYXkiLCJ5IiwieiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7ZUFBY0EsUUFBUSxLQUFELEdBQWRDLE0sU0FBQUE7O0EsZ0JBQ1NELFFBQVEsT0FBRCxHQUFoQkUsUSxVQUFBQTs7QUFFUEQsSUFBSUUsRUFBSkMsTUFBQUgsS0FBR0ksbUJBQU1KLElBQUlLLEVBQUVKLE1BQU1LLENBQVosQ0FBTixDQUFBIn0=
