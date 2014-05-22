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

Cola.$_cola_is = function $_cola_is(_object, _type){
    return _object === _type || _type.prototype && (_object instanceof _type || _object.__proto__ === _type.prototype) || isNaN(_object) && isNaN(_type);
}
Cola.$_cola_is.i = 0;

Cola.$_cola_isnt = function $_cola_isnt(_object, _type){
    return !(_object === _type || _type.prototype && (_object instanceof _type || _object.__proto__ === _type.prototype) || isNaN(_object) && isNaN(_type));
}
Cola.$_cola_isnt.i = 1;

Cola.$_cola_modulo = function $_cola_modulo(_a, _b){
    return (_a % _b + +_b) % _b;
}
Cola.$_cola_modulo.i = 2;

Cola.$_cola_isset = function $_cola_isset(_object){
    return !(typeof _object === "undefined" || _object === null);
}
Cola.$_cola_isset.i = 3;

Cola.$_cola_isntset = function $_cola_isntset(_object){
    return (typeof _object === "undefined" || _object === null);
}
Cola.$_cola_isntset.i = 4;

Cola.$_cola_clone = function $_cola_clone(_item){
    if (_item === undefined || _item === null) return _item;
    if (_item.__clone__ instanceof Function) return _item.__clone__();

    var result, types = [ Number, String, Boolean ];
    for (var i in types) 
        if(types.hasOwnProperty(i) && _item instanceof types[i])
            return types[i]( _item );

    if (_item.__proto__ === Array.prototype) {
        result = [];
        _item.forEach(function(child, index, array) { 
            result[index] = $_cola_clone( child );
        });

        return result;
    } 

    if (!(_item instanceof Object)) return _item;
       
    if (_item.nodeType && _item.cloneNode instanceof Function) return _item.cloneNode( true );    
        
    if (!_item.prototype) {
        if (_item instanceof Date) return new Date(_item);
        if (_item instanceof Function) return _item;
        
        result = {};
        for (var i in _item) result[i] = $_cola_clone( _item[i] );
        result.__proto__ = _item.__proto__;

        return result;
    }

    return _item;
}
Cola.$_cola_clone.i = 5;

Cola.$_cola_array_last = function $_cola_array_last(_array){
    return _array[_array.length - 1];
}
Cola.$_cola_array_last.i = 6;

Cola.$_cola_array_range = function $_cola_array_range(_from, _to){
    var range = [];
    if(_from <= _to) for(var i = _from; i <= _to; i++) range.push(i);
    else for(var i = _from; i >= _to; i--) range.push(i);
    return range;
}
Cola.$_cola_array_range.i = 7;

Cola.$_cola_array_asplice = function $_cola_array_asplice(_array, _from, _to, _a){
    _to = _to - _from + 1; 
    return [].splice.apply(_array, [_from, _to].concat(_a)), _a;
}
Cola.$_cola_array_asplice.i = 8;

Cola.$_cola_func_named_args = function $_cola_func_named_args(_args){
    this.$ = _args;
}
Cola.$_cola_func_named_args.i = 9;

Cola.$_cola_func_set_named_args = function $_cola_func_set_named_args(_args){
    if(_args[_args.length - 1] instanceof $_cola_func_named_args){
        var nargs = _args[_args.length - 1].$;
        for(var i in nargs) if(nargs.hasOwnProperty(i))
            _args[i] = nargs[i];
    }
}
Cola.$_cola_func_set_named_args.i = 10;
Cola.$_cola_arguments_def = { i : 11 };

Cola.$_cola = 
    Cola.$_cola_is + Cola.$_cola_isnt + Cola.$_cola_modulo + Cola.$_cola_isset + 
    Cola.$_cola_isntset + Cola.$_cola_clone + Cola.$_cola_array_last + Cola.$_cola_array_range + 
    Cola.$_cola_array_asplice + Cola.$_cola_func_named_args + Cola.$_cola_func_set_named_args +
    "var arguments;";

Cola.Compressor.StdFuncs = {
    $_cola_is      : true,
    $_cola_isnt    : true,
    $_cola_modulo  : true,
    $_cola_isset   : true,
    $_cola_isntset : true
};
