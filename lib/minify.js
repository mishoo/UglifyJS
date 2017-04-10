exports.readFile = function() {
    DefaultsError.croak("readFile not supported");
};

exports.writeFile = function() {
    DefaultsError.croak("writeFile not supported");
};

exports.simple_glob = function(files) {
    return files;
};

var defaultBase64Decoder = exports.base64Decoder = function(input) {
    DefaultsError.croak("No base64 decoder implemented");
}

var defaultBase64Encoder = exports.base64Encoder = function(input) {
    DefaultsError.croak("No base64 encoder implemented");
}

var readNameCache = function(filename, key) {
    var cache = null;
    if (filename) {
        try {
            var cache = exports.readFile(filename);
            cache = JSON.parse(cache)[key];
            if (!cache) throw "init";
            cache.props = Dictionary.fromObject(cache.props);
        } catch(ex) {
            cache = {
                cname: -1,
                props: new Dictionary()
            };
        }
    }
    return cache;
};

var writeNameCache = function(filename, key, cache) {
    if (filename) {
        var data;
        try {
            data = exports.readFile(filename);
            data = JSON.parse(data);
        } catch(ex) {
            data = {};
        }
        data[key] = {
            cname: cache.cname,
            props: cache.props.toObject()
        };
        exports.writeFile(filename, JSON.stringify(data, null, 2));
    }
};

var read_source_map = function(code) {
    var match = /\n\/\/# sourceMappingURL=data:application\/json(;.*?)?;base64,(.*)/.exec(code);
    if (!match) {
        AST_Node.warn("inline source map not found");
        return null;
    }
    return JSON.parse(exports.base64Encoded(match[2]));
}

var minify = function(files, options) {
    options = defaults(options, {
        compress         : {},
        fromString       : false,
        inSourceMap      : null,
        mangle           : {},
        mangleProperties : false,
        nameCache        : null,
        outFileName      : null,
        output           : null,
        outSourceMap     : null,
        parse            : {},
        sourceMapInline  : false,
        sourceMapUrl     : null,
        sourceRoot       : null,
        spidermonkey     : false,
        warnings         : false,
    });
    base54.reset();

    var inMap = options.inSourceMap;
    if (typeof inMap == "string" && inMap != "inline") {
        inMap = JSON.parse(exports.readFile(inMap));
    }

    // 1. parse
    var toplevel = null,
        sourcesContent = {};

    var addFile = function(file, fileUrl) {
        var code = options.fromString
            ? file
            : exports.readFile(file);
        if (inMap == "inline") {
            inMap = read_source_map(code);
        }
        sourcesContent[fileUrl] = code;
        toplevel = parse(code, {
            filename: fileUrl,
            toplevel: toplevel,
            bare_returns: options.parse ? options.parse.bare_returns : undefined
        });
    }

    if (options.spidermonkey) {
        if (inMap == "inline") {
            throw new Error("inline source map only works with built-in parser");
        }
        toplevel = AST_Node.from_mozilla_ast(files);
    } else {
        if (!options.fromString) {
            files = exports.simple_glob(files);
            if (inMap == "inline" && files.length > 1) {
                throw new Error("inline source map only works with singular input");
            }
        }
        [].concat(files).forEach(function (files, i) {
            if (typeof files === 'string') {
                addFile(files, options.fromString ? i : files);
            } else {
                for (var fileUrl in files) {
                    addFile(files[fileUrl], fileUrl);
                }
            }
        });
    }
    if (options.wrap) {
      toplevel = toplevel.wrap_commonjs(options.wrap, options.exportAll);
    }

    // 2. compress
    if (options.compress) {
        var compress = { warnings: options.warnings };
        merge(compress, options.compress);
        toplevel.figure_out_scope(options.mangle);
        var sq = Compressor(compress);
        toplevel = sq.compress(toplevel);
    }

    // 3. mangle properties
    if (options.mangleProperties || options.nameCache) {
        options.mangleProperties = options.mangleProperties || {};
        options.mangleProperties.cache = readNameCache(options.nameCache, "props");
        toplevel = mangle_properties(toplevel, options.mangleProperties);
        writeNameCache(options.nameCache, "props", options.mangleProperties.cache);
    }

    // 4. mangle
    if (options.mangle) {
        toplevel.figure_out_scope(options.mangle);
        toplevel.compute_char_frequency(options.mangle);
        toplevel.mangle_names(options.mangle);
    }

    // 5. output
    var output = { max_line_len: 32000 };
    if (options.outSourceMap || options.sourceMapInline) {
        output.source_map = SourceMap({
            // prefer outFileName, otherwise use outSourceMap without .map suffix
            file: options.outFileName || (typeof options.outSourceMap === 'string' ? options.outSourceMap.replace(/\.map$/i, '') : null),
            orig: inMap,
            root: options.sourceRoot
        });
        if (options.sourceMapIncludeSources) {
            for (var file in sourcesContent) {
                if (sourcesContent.hasOwnProperty(file)) {
                    output.source_map.get().setSourceContent(file, sourcesContent[file]);
                }
            }
        }

    }
    if (options.output) {
        merge(output, options.output);
    }
    var stream = OutputStream(output);
    toplevel.print(stream);

    var source_map = output.source_map;
    if (source_map) {
        source_map = source_map + "";
    }

    var mappingUrlPrefix = "\n//# sourceMappingURL=";
    if (options.sourceMapInline) {
        stream += mappingUrlPrefix + "data:application/json;charset=utf-8;base64," + exports.base64Decoder(source_map);
    } else if (options.outSourceMap && typeof options.outSourceMap === "string" && options.sourceMapUrl !== false) {
        stream += mappingUrlPrefix + (typeof options.sourceMapUrl === "string" ? options.sourceMapUrl : options.outSourceMap);
    }

    return {
        code : stream + "",
        map  : source_map
    };
};
