/***********************************************************************

  ColaScript standart library. Need for translation.

  Distributed under the BSD license:

    Copyright 2014 (c) TrigenSoftware <danon0404@gmail.com>

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

Cola._ColaRuntime$$is = function _ColaRuntime$$is(_object, _type){
    return _object === _type || _type.prototype && (_object instanceof _type || _object.__proto__ === _type.prototype);
}
Cola._ColaRuntime$$is.i = 0;

Cola._ColaRuntime$$isnt = function _ColaRuntime$$isnt(_object, _type){
    return !(_object === _type || _type.prototype && (_object instanceof _type || _object.__proto__ === _type.prototype));
}
Cola._ColaRuntime$$isnt.i = 1;

Cola._ColaRuntime$$modulo = function _ColaRuntime$$modulo(_a, _b){
    return (_a % _b + +_b) % _b;
}
Cola._ColaRuntime$$modulo.i = 2;

Cola._ColaRuntime$$isset = function _ColaRuntime$$isset(_object){
    return !(typeof _object === "undefined" || _object === null);
}
Cola._ColaRuntime$$isset.i = 3;

Cola._ColaRuntime$$isntset = function _ColaRuntime$$isntset(_object){
    return (typeof _object === "undefined" || _object === null);
}
Cola._ColaRuntime$$isntset.i = 4;

Cola._ColaRuntime$$clone = function _ColaRuntime$$clone(_item){
    if (_item === undefined || _item === null) return _item;
    if (_item.__clone__ instanceof Function) return _item.__clone__();

    if(_item instanceof Number) return Number(_item);
    if(_item instanceof String) return String(_item);
    if(_item instanceof Boolean) return Boolean(_item);

    var result;

    if (!(_item instanceof Object)) return _item;
       
    if (_item.nodeType && _item.cloneNode instanceof Function) return _item.cloneNode( true );    
        
    if (!_item.prototype) {
        if (_item instanceof Date) return new Date(_item);
        if (_item instanceof Function) return _item;
        
        result = new (Object.getPrototypeOf(_item).constructor);
        for (var i in _item) result[i] = _ColaRuntime$$clone( _item[i] );

        return result;
    }

    return _item;
}
Cola._ColaRuntime$$clone.i = 5;

Cola._ColaRuntime$$array_last = function _ColaRuntime$$array_last(_array){
    return _array[_array.length - 1];
}
Cola._ColaRuntime$$array_last.i = 6;

Cola._ColaRuntime$$array_range = function _ColaRuntime$$array_range(_from, _to){
    var range = [];
    if(_from <= _to) for(var i = _from; i <= _to; i++) range.push(i);
    else for(var i = _from; i >= _to; i--) range.push(i);
    return range;
}
Cola._ColaRuntime$$array_range.i = 7;

Cola._ColaRuntime$$array_asplice = function _ColaRuntime$$array_asplice(_array, _from, _to, _a){
    _to = _to - _from + 1; 
    return [].splice.apply(_array, [_from, _to].concat(_a)), _a;
}
Cola._ColaRuntime$$array_asplice.i = 8;

Cola._ColaRuntime$$func_named_args = function _ColaRuntime$$func_named_args(_args){
    this.$ = _args;
}
Cola._ColaRuntime$$func_named_args.i = 9;

Cola._ColaRuntime$$func_set_named_args = function _ColaRuntime$$func_set_named_args(_args){
    if(_args[_args.length - 1] instanceof _ColaRuntime$$func_named_args){
        var nargs = _args[_args.length - 1].$;
        for(var i in nargs) if(nargs.hasOwnProperty(i))
            _args[i] = nargs[i];
    }
}
Cola._ColaRuntime$$func_set_named_args.i = 10;

Cola._ColaRuntime$$error = function _ColaRuntime$$error(_error) {
    throw new Error(_error);
};
Cola._ColaRuntime$$error.i = 11;

Cola._ColaRuntime$$array_negate_access = function _ColaRuntime$$array_negate_access(_array, _index) {
    return _array instanceof Array ? _array.length + _index : _index;
};
Cola._ColaRuntime$$array_negate_access.i = 12;

Cola._ColaRuntime$$array_modulo_access = function _ColaRuntime$$array_modulo_access(_array, _index) {
    return _array instanceof Array ? ((_index % _array.length + +_array.length) % _array.length) : _index;
};
Cola._ColaRuntime$$array_modulo_access.i = 13;

Cola._ColaRuntime$$updateProperty = function _ColaRuntime$$updateProperty(_object, _propname, _props) {
    var _dprops = Object.getOwnPropertyDescriptor(_object, _propname) || {};
    for(var key in _props)
        if(_props.hasOwnProperty(key)) _dprops[key] = _props[key];
    _dprops.configurable = true;
    return Object.defineProperty(_object, _propname, _dprops);
};
Cola._ColaRuntime$$updateProperty.i = 14;

Cola._ColaRuntime$$proto = function _ColaRuntime$$proto(_proto) {
    function proto(){}
    proto.prototype = _proto.prototype;
    return new proto();
};
Cola._ColaRuntime$$proto.i = 15;

Cola._ColaRuntime$$rootImport = function _ColaRuntime$$rootImport(_module) {
    var g = typeof window == "undefined" ? global : window;

    for (var i in _module)
        if (_module.hasOwnProperty(i)) g[i] = _module[i];
};
Cola._ColaRuntime$$rootImport.i = 16;

Cola._ColaRuntime$$commonWrapper = function(_modules, _cache, _ids) {

    function require(name) {
        if (_cache[name]) return _cache[name].exports;
        if (_modules[name]) return call(name);

        throw new Error('Cannot find module "' + name + '"');
    }

    require.cola = true;
    require.cache = _cache;
    require.modules = _modules;

    function call(id) {
        var module = _cache[id] = {
            exports: {}
        };

        _modules[id].call(module.exports, function(moduleName) {
            var dependencies = _ids[moduleName];
            return require(dependencies ? dependencies : moduleName);
        }, module, module.exports);

        return module.exports;
    }

    require(0);
};
Cola._ColaRuntime$$commonWrapper.i = 17;

Cola._ColaRuntime$$rootExport = function _ColaRuntime$$rootExport(_exports, _module) {
    for (var i in _module)
        if (_module.hasOwnProperty(i)) _exports[i] = _module[i];
};
Cola._ColaRuntime$$rootExport.i = 18;

Cola._ColaRuntime$$promise = function _ColaRuntime$$promise(_promise, _then, _this) {
    if (!_promise.then) throw new Error("Function is not async.");
    _promise.then(_then.bind(_this));
};
Cola._ColaRuntime$$promise.i = 19;

Cola._ColaRuntime$$arguments_def = { i : 20 };

Cola._ColaRuntime = 
    Cola._ColaRuntime$$is + Cola._ColaRuntime$$isnt + Cola._ColaRuntime$$modulo + Cola._ColaRuntime$$isset + 
    Cola._ColaRuntime$$isntset + Cola._ColaRuntime$$clone + Cola._ColaRuntime$$array_last + Cola._ColaRuntime$$array_range + 
    Cola._ColaRuntime$$array_asplice + Cola._ColaRuntime$$func_named_args + Cola._ColaRuntime$$func_set_named_args + Cola._ColaRuntime$$error +
    Cola._ColaRuntime$$array_negate_access + Cola._ColaRuntime$$array_modulo_access + Cola._ColaRuntime$$updateProperty +
    Cola._ColaRuntime$$proto + Cola._ColaRuntime$$rootImport + "(" + Cola._ColaRuntime$$commonWrapper + ")([],{},{});" + Cola._ColaRuntime$$rootExport +
    Cola._ColaRuntime$$promise + 
    "var arguments;";

Cola.Compressor.StdFuncs = {
    _ColaRuntime$$modulo  : true
};
