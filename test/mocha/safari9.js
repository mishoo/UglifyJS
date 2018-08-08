var assert = require('assert');
var UglifyJS = require('../..');

describe('legacy safari', function() {
    it('Should make sure mangled function name is different from its argument names', function () {
        assert.strictEqual(
            UglifyJS.minify([
                'function main() {',
                '    "use strict";',
                '    ',
                '    function n(a,b,c) {',
                '        console.log(c)',
                '    }',
                '    E.on = function f2() {',
                '        E.on(function(e) {',
                '            return n(this,e)',
                '        })',
                '    }',
                '}'
            ].join('\n'), {
                ie8: true
            }).code,
            'function main(){"use strict";E.on=function(){E.on(function(n){return function c(n,o,t){console.log(t)}()})}}'
        )
    })
})
