"use strict";

var to_ascii = typeof atob == "undefined" ? function(b64) {
    return new Buffer(b64, "base64").toString();
} : atob;
var to_base64 = typeof btoa == "undefined" ? function(str) {
    return new Buffer(str).toString("base64");
} : btoa;

function read_source_map(code) {
    var match = /\n\/\/# sourceMappingURL=data:application\/json(;.*?)?;base64,(.*)/.exec(code);
    if (!match) {
        AST_Node.warn("inline source map not found");
        return null;
    }
    return to_ascii(match[2]);
}

function set_shorthand(name, options, keys) {
    if (options[name]) {
        keys.forEach(function(key) {
            if (options[key]) {
                if (typeof options[key] != "object") options[key] = {};
                if (!(name in options[key])) options[key][name] = options[name];
            }
        });
    }
}

function minify(files, options) {
    var warn_function = AST_Node.warn_function;
    try {
        options = defaults(options, {
            compress: {},
            ie8: false,
            keep_fnames: false,
            mangle: {},
            output: {},
            parse: {},
            sourceMap: false,
            timings: false,
            toplevel: false,
            warnings: false,
            wrap: false,
        }, true);
        var timings = options.timings && {
            start: Date.now()
        };
        set_shorthand("ie8", options, [ "compress", "mangle", "output" ]);
        set_shorthand("keep_fnames", options, [ "compress", "mangle" ]);
        set_shorthand("toplevel", options, [ "compress", "mangle" ]);
        set_shorthand("warnings", options, [ "compress" ]);
        if (options.mangle) {
            options.mangle = defaults(options.mangle, {
                cache: null,
                eval: false,
                ie8: false,
                keep_fnames: false,
                properties: false,
                reserved: [],
                toplevel: false,
            }, true);
        }
        if (options.sourceMap) {
            options.sourceMap = defaults(options.sourceMap, {
                content: null,
                filename: null,
                includeSources: false,
                root: null,
                url: null,
            }, true);
        }
        var warnings = [];
        if (options.warnings && !AST_Node.warn_function) {
            AST_Node.warn_function = function(warning) {
                warnings.push(warning);
            };
        }
        if (timings) timings.parse = Date.now();
        var toplevel;
        if (files instanceof AST_Toplevel) {
            toplevel = files;
        } else {
            if (typeof files == "string") {
                files = [ files ];
            }
            options.parse = options.parse || {};
            options.parse.toplevel = null;
            for (var name in files) {
                options.parse.filename = name;
                options.parse.toplevel = parse(files[name], options.parse);
                if (options.sourceMap && options.sourceMap.content == "inline") {
                    if (Object.keys(files).length > 1)
                        throw new Error("inline source map only works with singular input");
                    options.sourceMap.content = read_source_map(files[name]);
                }
            }
            toplevel = options.parse.toplevel;
        }
        if (options.wrap) {
            toplevel = toplevel.wrap_commonjs(options.wrap);
        }
        if (timings) timings.scope1 = Date.now();
        if (options.compress) toplevel.figure_out_scope(options.mangle);
        if (timings) timings.compress = Date.now();
        if (options.compress) toplevel = new Compressor(options.compress).compress(toplevel);
        if (timings) timings.scope2 = Date.now();
        if (options.mangle) toplevel.figure_out_scope(options.mangle);
        if (timings) timings.mangle = Date.now();
        if (options.mangle) {
            base54.reset();
            toplevel.compute_char_frequency(options.mangle);
            toplevel.mangle_names(options.mangle);
        }
        if (timings) timings.properties = Date.now();
        if (options.mangle && options.mangle.properties) {
            toplevel = mangle_properties(toplevel, options.mangle.properties);
        }
        if (timings) timings.output = Date.now();
        var result = {};
        if (options.output.ast) {
            result.ast = toplevel;
        }
        if (!HOP(options.output, "code") || options.output.code) {
            if (options.sourceMap) {
                if (typeof options.sourceMap.content == "string") {
                    options.sourceMap.content = JSON.parse(options.sourceMap.content);
                }
                options.output.source_map = SourceMap({
                    file: options.sourceMap.filename,
                    orig: options.sourceMap.content,
                    root: options.sourceMap.root
                });
                if (options.sourceMap.includeSources) {
                    if (files instanceof AST_Toplevel) {
                        throw new Error("original source content unavailable");
                    } else for (var name in files) {
                        options.output.source_map.get().setSourceContent(name, files[name]);
                    }
                }
            }
            delete options.output.ast;
            delete options.output.code;
            var stream = OutputStream(options.output);
            toplevel.print(stream);
            result.code = stream.get();
            if (options.sourceMap) {
                result.map = options.output.source_map.toString();
                if (options.sourceMap.url == "inline") {
                    result.code += "\n//# sourceMappingURL=data:application/json;charset=utf-8;base64," + to_base64(result.map);
                } else if (options.sourceMap.url) {
                    result.code += "\n//# sourceMappingURL=" + options.sourceMap.url;
                }
            }
        }
        if (timings) {
            timings.end = Date.now();
            result.timings = {
                parse: 1e-3 * (timings.scope1 - timings.parse),
                scope: 1e-3 * (timings.compress - timings.scope1 + timings.mangle - timings.scope2),
                compress: 1e-3 * (timings.scope2 - timings.compress),
                mangle: 1e-3 * (timings.properties - timings.mangle),
                properties: 1e-3 * (timings.output - timings.properties),
                output: 1e-3 * (timings.end - timings.output),
                total: 1e-3 * (timings.end - timings.start)
            }
        }
        if (warnings.length) {
            result.warnings = warnings;
        }
        return result;
    } catch (ex) {
        return { error: ex };
    } finally {
        AST_Node.warn_function = warn_function;
    }
}
