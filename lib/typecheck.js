/***********************************************************************

  AST-Tree translator, ColaScript -> JavaScript.

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

"use strict";
!this.Cola && (this.Cola = {});

/*
    MD:
    
    Defs:
        - var definition
        - function definition 
        - function argument definition

        * AST_VarDef
        * AST_Defun
        * AST_Function
        * AST_SymbolFunarg

    Levels of follow:
        1 level:    Simple types: String, Number, Boolean, Function.
        2 level:    Arrays and Object ( Array<val_type>, Array<key_type, val_type> ).
        Deep-level: interfaces, classes, singletones.

    Operations to check:
        * AST_Return
        * AST_Call
        * AST_UnaryPrefix
        * AST_UnaryPostfix
        * AST_Binary
        * AST_Conditional
        * AST_Assign
*/