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

function $_cola_is(_object, _type){
    return _object instanceof _type || _object.__proto__ === _type.prototype;
}
$_cola_is.i = 0;

function $_cola_isnt(_object, _type){
    return !(_object instanceof _type || _object.__proto__ === _type.prototype);
}
$_cola_isnt.i = 1;

function $_cola_modulo(_a, _b){
    return (_a % _b + +_b) % _b;
}
$_cola_modulo.i = 2;

function $_cola_isset(_object){
    return !(typeof _object === "undefined" || _object === null);
}
$_cola_isset.i = 3;

function $_cola_isntset(_object){
    return (typeof _object === "undefined" || _object === null);
}
$_cola_isntset.i = 4;

function $_cola_clone(_item) {
    if (_item === undefined || _item === null) return _item;
    if (_item.__clone__ instanceof Function) return _item.__clone__();

    var result, types = [ Number, String, Boolean ];
    for (var i in types) 
        if(types.hasOwnProperty(i) && _item instanceof types[i])
            return type( _item );

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
$_cola_clone.i = 5;

$_cola = $_cola_is + $_cola_isnt + $_cola_modulo + $_cola_isset + $_cola_isntset + $_cola_clone;
