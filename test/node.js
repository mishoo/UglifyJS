var orig = require("../tools/node");
// Get all AST-nodes
orig.utils.merge(orig, orig.ast);
orig.SourceMap = require("../lib/sourcemap").SourceMap;
orig.base54 = orig.utils.base54;
orig.defaults = orig.utils.defaults;
orig.mangle_properties =  orig.propmangle.mangle_properties;
orig.reserve_quoted_keys =  orig.propmangle.reserve_quoted_keys;
orig.JS_Parse_Error = orig.parser.JS_Parse_Error;
orig.tokenizer = orig.parser.tokenizer;
orig.is_identifier = orig.parser.is_identifier;
module.exports = orig;