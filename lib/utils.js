/***********************************************************************

  A JavaScript tokenizer / parser / beautifier / compressor.
  https://github.com/mishoo/UglifyJS2

  -------------------------------- (C) ---------------------------------

                           Author: Mihai Bazon
                         <mihai.bazon@gmail.com>
                       http://mihai.bazon.net/blog

  Distributed under the BSD license:

    Copyright 2012 (c) Mihai Bazon <mihai.bazon@gmail.com>

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions
    are met:

        * Redistributions of source code must retain the above
          copyright notice, this list of conditions and the following
          disclaimer.

        * Redistributions in binary form must reproduce the above
          copyright notice, this list of conditions and the following
          disclaimer in the documentation and/or other materials
          provided with the distribution.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER “AS IS” AND ANY
    EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
    PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE
    LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
    OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
    PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
    PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
    TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
    THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
    SUCH DAMAGE.

 ***********************************************************************/

!this.Cola && (this.Cola = {});

if (typeof window != "undefined") {

Cola.getSource = function (url) {        
    var xhr = new XMLHttpRequest; 
    xhr.open('GET', url, false);
    xhr.send();
    return xhr.status == 200 
        ? xhr.responseText
        : "";
};

Cola.dirname = function (dir) {
    return dir.replace(/\/[^\/]*$/, "");
};

Cola.getPackages = function() {
    var packages = document.querySelector('script[type="text/packages-json"]');

    if (packages) {
        return JSON.parse(packages.innerHTML);
    }

    packages = document.querySelector('script[type="text/packages-json"][src]');

    if (packages) {
        return JSON.parse(Cola.getSource(packages.src));
    }

    if (packages = Cola.getSource("/packages.json")) {
        return JSON.parse(packages);
    }

    return {};
};

} else {

var path = require("path");
var fs = require("fs");

Cola.getSource = function(file) {
    try {
        return fs.readFileSync(Cola.notRoot(file) 
            ? path.join(process.cwd(), file) 
            : file, "utf8");
    } catch(e) {
        return "";
    }
};

Cola.getPackages = function(path) {
    if (!path) path = "packages.json";
    return JSON.parse(Cola.getSource(path));
};

Cola.dirname = path.dirname;

}

Cola.tryGetRequiredSource = function(src) {
    var source;

    if (source = Cola.getSource(src)) return [src, source];
    if (source = Cola.getSource(src + ".cola")) return [src, source];
    if (source = Cola.getSource(src + ".js")) return [src, source];
    return false;
};

Cola.notRoot = function (path) {
    return path[0] != "/" && !/^http/.test(path);
};

Cola.translate = function (source, opts) {
    var stream = new Cola.OutputStream({ beautify : true }),
        ast;

    try {

        // 1. compile
        ast = Cola.parse(source).toJavaScript(opts);
        ast.print(stream);

        return stream.toString();  

    } catch(e){

        throw e;

    }
};

Cola.eval = function (source, opts) {
    return eval.call(this, Cola.translate(source, opts));
};

Cola.bootstraped = false;
Cola.bootstrap = function () {
    if (Cola.bootstraped) return;
    Cola.bootstraped = true;

    Array.prototype.forEach.call(document.querySelectorAll('script[type="text/colascript"][src]'),
        function(script){
            if (/\.js$/.test(script.src)) eval.call(window, Cola.getSource(script.src));
            else Cola.eval.call(window, Cola.getSource(script.src), { path: Cola.dirname(script.src) });
        });

    var event = document.createEvent("HTMLEvents");
    event.initEvent("DOMContentLoaded", true, true);
    event.eventName = "DOMContentLoaded";

    window.dispatchEvent(event);

    event = document.createEvent("HTMLEvents");
    event.initEvent("load", true, true);
    event.eventName = "load";

    window.dispatchEvent(event);
};

Cola.modsVerifi = function(mods, allowedMods) {
    mods = mods.slice();

    allowedMods.forEach(function(mod){
        Cola.remove(mods, mod);
    });

    return !mods.length;
};

Cola.modsContains = function(mods, allowedMods) {
    for (var i in allowedMods)
        if (allowedMods.hasOwnProperty(i) && mods.indexOf(allowedMods[i]) != -1) return true;

    return false;
};

"use strict";

Cola.array_to_hash = function (a) {
    var ret = Object.create(null);
    for (var i = 0; i < a.length; ++i)
        ret[a[i]] = true;
    return ret;
};

Cola.slice = function (a, start) {
    return Array.prototype.slice.call(a, start || 0);
};

Cola.characters = function (str) {
    return str.split("");
};

Cola.member = function (name, array) {
    for (var i = array.length; --i >= 0;)
        if (array[i] == name)
            return true;
    return false;
};

Cola.find_if = function (func, array) {
    for (var i = 0, n = array.length; i < n; ++i) {
        if (func(array[i]))
            return array[i];
    }
};

Cola.repeat_string = function (str, i) {
    if (i <= 0) return "";
    if (i == 1) return str;
    var d = Cola.repeat_string(str, i >> 1);
    d += d;
    if (i & 1) d += str;
    return d;
};

Cola.DefaultsError = function (msg, defs) {
    Error.call(this, msg);
    this.msg = msg;
    this.defs = defs;
};
Cola.DefaultsError.prototype = Object.create(Error.prototype);
Cola.DefaultsError.prototype.constructor = Cola.DefaultsError;

Cola.DefaultsError.croak = function(msg, defs) {
    throw new Cola.DefaultsError(msg, defs);
};

Cola.defaults = function (args, defs, croak) {
    if (args === true)
        args = {};
    var ret = args || {};
    if (croak) for (var i in ret) if (ret.hasOwnProperty(i) && !defs.hasOwnProperty(i))
        Cola.DefaultsError.croak("`" + i + "` is not a supported option", defs);
    for (var i in defs) if (defs.hasOwnProperty(i)) {
        ret[i] = (args && args.hasOwnProperty(i)) ? args[i] : defs[i];
    }
    return ret;
};

Cola.merge = function (obj, ext) {
    for (var i in ext) if (ext.hasOwnProperty(i)) {
        obj[i] = ext[i];
    }
    return obj;
};

Cola.noop = function () {};

Cola.MAP = (function(){
    function MAP(a, f, backwards) {
        var ret = [], top = [], i;
        function doit() {
            var val = f(a[i], i);
            var is_last = val instanceof Last;
            if (is_last) val = val.v;
            if (val instanceof Continue) return false;
            if (val instanceof AtTop) {
                val = val.v;
                if (val instanceof Splice) {
                    top.push.apply(top, backwards ? val.v.slice().reverse() : val.v);
                } else {
                    top.push(val);
                }
            }
            else if (val !== skip) {
                if (val instanceof Splice) {
                    ret.push.apply(ret, backwards ? val.v.slice().reverse() : val.v);
                } else {
                    ret.push(val);
                }
            }
            return is_last;
        };
        if (a instanceof Array) {
            if (backwards) {
                for (i = a.length; --i >= 0;) if (doit()) break;
                ret.reverse();
                top.reverse();
            } else {
                for (i = 0; i < a.length; ++i) if (doit()) break;
            }
        }
        else {
            for (i in a) if (a.hasOwnProperty(i)) if (doit()) break;
        }
        return top.concat(ret);
    };
    MAP.at_top = function(val) { return new AtTop(val) };
    MAP.splice = function(val) { return new Splice(val) };
    MAP.last = function(val) { return new Last(val) };
    MAP.continue = function() { return new Continue() };
    var skip = MAP.skip = {};
    function AtTop(val) { this.v = val };
    function Splice(val) { this.v = val };
    function Last(val) { this.v = val };
    function Continue() {  };
    return MAP;
})();

Cola.push_uniq = function (array, el) {
    if (array.indexOf(el) < 0) return array.push(el), true;
    return false;
};

Cola.string_template = function (text, props) {
    return text.replace(/\{(.+?)\}/g, function(str, p){
        return props[p];
    });
};

Cola.remove = function (array, el) {
    var i = array.indexOf(el);
    if (i > -1) array.splice(i, 1);
    // for (var i = array.length; --i >= 0;) {
    //     if (array[i] === el) array.splice(i, 1);
    // }
};

Cola.mergeSort = function (array, cmp) {
    if (array.length < 2) return array.slice();
    function merge(a, b) {
        var r = [], ai = 0, bi = 0, i = 0;
        while (ai < a.length && bi < b.length) {
            cmp(a[ai], b[bi]) <= 0
                ? r[i++] = a[ai++]
                : r[i++] = b[bi++];
        }
        if (ai < a.length) r.push.apply(r, a.slice(ai));
        if (bi < b.length) r.push.apply(r, b.slice(bi));
        return r;
    };
    function _ms(a) {
        if (a.length <= 1)
            return a;
        var m = Math.floor(a.length / 2), left = a.slice(0, m), right = a.slice(m);
        left = _ms(left);
        right = _ms(right);
        return merge(left, right);
    };
    return _ms(array);
};

Cola.set_difference = function (a, b) {
    return a.filter(function(el){
        return b.indexOf(el) < 0;
    });
};

Cola.set_intersection = function (a, b) {
    return a.filter(function(el){
        return b.indexOf(el) >= 0;
    });
};

// this function is taken from Acorn [1], written by Marijn Haverbeke
// [1] https://github.com/marijnh/acorn
Cola.makePredicate = function (words) {
    if (!(words instanceof Array)) words = words.split(" ");
    var f = "", cats = [];
    out: for (var i = 0; i < words.length; ++i) {
        for (var j = 0; j < cats.length; ++j)
            if (cats[j][0].length == words[i].length) {
                cats[j].push(words[i]);
                continue out;
            }
        cats.push([words[i]]);
    }
    function compareTo(arr) {
        if (arr.length == 1) return f += "return str === " + JSON.stringify(arr[0]) + ";";
        f += "switch(str){";
        for (var i = 0; i < arr.length; ++i) f += "case " + JSON.stringify(arr[i]) + ":";
        f += "return true}return false;";
    }
    // When there are more than three length categories, an outer
    // switch first dispatches on the lengths, to save on comparisons.
    if (cats.length > 3) {
        cats.sort(function(a, b) {return b.length - a.length;});
        f += "switch(str.length){";
        for (var i = 0; i < cats.length; ++i) {
            var cat = cats[i];
            f += "case " + cat[0].length + ":";
            compareTo(cat);
        }
        f += "}";
        // Otherwise, simply generate a flat `switch` statement.
    } else {
        compareTo(words);
    }
    return new Function("str", f);
};

Cola.all = function (array, predicate) {
    for (var i = array.length; --i >= 0;)
        if (!predicate(array[i]))
            return false;
    return true;
};

Cola.Dictionary = function () {
    this._values = Object.create(null);
    this._size = 0;
};
Cola.Dictionary.prototype = {
    set: function(key, val) {
        if (!this.has(key)) ++this._size;
        this._values["$" + key] = val;
        return this;
    },
    add: function(key, val) {
        if (this.has(key)) {
            this.get(key).push(val);
        } else {
            this.set(key, [ val ]);
        }
        return this;
    },
    get: function(key) { return this._values["$" + key] },
    del: function(key) {
        if (this.has(key)) {
            --this._size;
            delete this._values["$" + key];
        }
        return this;
    },
    has: function(key) { return ("$" + key) in this._values },
    each: function(f) {
        for (var i in this._values)
            f(this._values[i], i.substr(1));
    },
    size: function() {
        return this._size;
    },
    map: function(f) {
        var ret = [];
        for (var i in this._values)
            ret.push(f(this._values[i], i.substr(1)));
        return ret;
    }
};

Cola.clone = function (item) {  
    if (item === undefined || item === null) return item;
    if (item.__clone__ instanceof Function) return item.__clone__();
    if (item.clone instanceof Function) return item.clone();

    var result, types = [ Number, String, Boolean ];
    for (var i in types) 
        if(types.hasOwnProperty(i) && item instanceof types[i])
            return type( item );

    if (item.__proto__ === Array.prototype) {
        result = [];
        item.forEach(function(child, index, array) { 
            result[index] = Cola.clone( child );
        });

        return result;
    } 

    if (!(item instanceof Object)) return item;
       
    if (item.nodeType && item.cloneNode instanceof Function) return item.cloneNode( true );    
        
    if (!item.prototype) {
        if (item instanceof Date) return new Date(item);
        if (item instanceof Function) return item;
        
        result = {};
        for (var i in item) result[i] = Cola.clone( item[i] );
        result.__proto__ = item.__proto__;

        return result;
    }

    return item;
};