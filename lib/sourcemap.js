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

"use strict";
!window.Cola && (window.Cola = {});

// a small wrapper around fitzgen's source-map library
Cola.SourceMap = function (options) {
    this.options = Cola.defaults(options, {
        file : null,
        root : null,
        orig : null,

        orig_line_diff : 0,
        dest_line_diff : 0,
    });
    this.generator = new MOZ_SourceMap.SourceMapGenerator({
        file       : this.options.file,
        sourceRoot : this.options.root
    });
    this.orig_map = this.options.orig && new MOZ_SourceMap.SourceMapConsumer(this.options.orig);
}

Cola.SourceMap.prototype.add = function (source, gen_line, gen_col, orig_line, orig_col, name) {
    if (this.orig_map) {
        var info = this.orig_map.originalPositionFor({
            line: orig_line,
            column: orig_col
        });
        if (info.source === null) {
            return;
        }
        source = info.source;
        orig_line = info.line;
        orig_col = info.column;
        name = info.name;
    }
    this.generator.addMapping({
        generated : { line: gen_line + this.options.dest_line_diff, column: gen_col },
        original  : { line: orig_line + this.options.orig_line_diff, column: orig_col },
        source    : source,
        name      : name
    });
};

Cola.SourceMap.prototype.get = function() { return this.generator };
Cola.SourceMap.prototype.toString = function() { return this.generator.toString() };
