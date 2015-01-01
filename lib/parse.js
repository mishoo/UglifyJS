/***********************************************************************

  A JavaScript tokenizer / parser / beautifier / compressor.
  https://github.com/mishoo/UglifyJS2

  Edited for parsing ColaScript.

  -------------------------------- (C) ---------------------------------

                           Author: Mihai Bazon
                         <mihai.bazon@gmail.com>
                       http://mihai.bazon.net/blog

  Distributed under the BSD license:

    Copyright 2012 (c) Mihai Bazon <mihai.bazon@gmail.com>
    Copyright 2014 (c) TrigenSoftware <danon0404@gmail.com>
    Parser based on parse-js (http://marijn.haverbeke.nl/parse-js/).

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

Cola.KEYWORDS = 'break case catch const continue debugger default delete do else finally for function if in instanceof new return switch throw try typeof var void while with';
Cola.cKEYWORDS = Cola.KEYWORDS.replace(' void', '') + ' static covert export async get set when clone of is isnt class extends singleton resolve reject await';

Cola.KEYWORDS_ATOM = 'false null true';
Cola.cKEYWORDS_ATOM = Cola.KEYWORDS_ATOM + ' on yes off no';

Cola.RESERVED_WORDS = 'abstract boolean byte char double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized this throws transient volatile yield';
Cola.cRESERVED_WORDS = Cola.RESERVED_WORDS.replace(' class', '').replace(' extends', '').replace(' static', '').replace(' export', '') + " " + Cola.cKEYWORDS_ATOM + " " + Cola.cKEYWORDS;
Cola.RESERVED_WORDS += " " + Cola.KEYWORDS_ATOM + " " + Cola.KEYWORDS;

Cola.KEYWORDS_BEFORE_EXPRESSION = 'return new delete throw else case';
Cola.cKEYWORDS_BEFORE_EXPRESSION = Cola.KEYWORDS_BEFORE_EXPRESSION += ' when resolve reject await';

Cola.KEYWORDS = Cola.makePredicate(Cola.KEYWORDS);
Cola.cKEYWORDS = Cola.makePredicate(Cola.cKEYWORDS);

Cola.RESERVED_WORDS = Cola.makePredicate(Cola.RESERVED_WORDS);
Cola.cRESERVED_WORDS = Cola.makePredicate(Cola.cRESERVED_WORDS);

Cola.KEYWORDS_ATOM = Cola.makePredicate(Cola.KEYWORDS_ATOM);
Cola.cKEYWORDS_ATOM = Cola.makePredicate(Cola.cKEYWORDS_ATOM);

Cola.KEYWORDS_BEFORE_EXPRESSION = Cola.makePredicate(Cola.KEYWORDS_BEFORE_EXPRESSION);
Cola.cKEYWORDS_BEFORE_EXPRESSION = Cola.makePredicate(Cola.cKEYWORDS_BEFORE_EXPRESSION);

Cola.OPERATOR_CHARS = Cola.makePredicate(Cola.characters("+-*&%=<>!?|~^"));

Cola.RE_HEX_NUMBER = /^0x[0-9a-f]+$/i;
Cola.RE_OCT_NUMBER = /^0[0-7]+$/;
Cola.RE_DEC_NUMBER = /^\d*\.?\d*(?:e[+-]?\d*(?:\d\.?|\.?\d)\d*)?$/i;

Cola.OPERATORS = [ // d - different left and right types of vars, s - same
    "in",         // binary - d
    "instanceof", // binary - d
    "typeof",     // unary - dynamic
    "new",        // unary
    //"void",     // unary
    "delete",     // unary - dynamic
    "++",         // unary - Number
    "--",         // unary - Number
    "+",          // binary/unary - s
    "-",          // binary/unary - s
    "!",          // unary - Boolean
    "~",          // unary - Number
    "&",          // binary - s 
    "|",          // binary - s
    "^",          // binary - s
    "*",          // binary - s
    "/",          // binary - s
    "%",          // binary - s
    ">>",         // binary - s
    "<<",         // binary - s
    ">>>",        // binary - s
    "<",          // binary - s
    ">",          // binary - s
    "<=",         // binary - s
    ">=",         // binary - s
    "==",         // binary - s
    "===",        // binary - s, without checking of types!
    "!=",         // binary - s
    "!==",        // binary - s, without checking of types!
    "?",          // ternary?
    "=",          // binary - d|s
    "+=",         // binary - d|s
    "-=",         // binary - d|s
    "/=",         // binary - d|s
    "*=",         // binary - d|s
    "%=",         // binary - d|s
    ">>=",        // binary - d|s
    "<<=",        // binary - d|s
    ">>>=",       // binary - d|s
    "|=",         // binary - d|s
    "^=",         // binary - d|s
    "&=",         // binary - d|s
    "&&",         // binary - s
    "||",         // binary - s
    // ColaScript
    "await",
    "clone",
    "of",
    "is",
    "isnt",
    "**",
    "%%",
    "?="

];
Cola.cOPERATORS = Cola.makePredicate(Cola.OPERATORS);

Cola.OPERATORS = Cola.OPERATORS.slice(0, Cola.OPERATORS.length - 6);
Cola.OPERATORS.push('void');

Cola.OPERATORS = Cola.makePredicate(Cola.OPERATORS);

Cola.COMPARISON = Cola.makePredicate("< > <= >= == === != !==");

Cola.WHITESPACE_CHARS = Cola.makePredicate(Cola.characters(" \u00a0\n\r\t\f\u000b\u200b\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000"));

Cola.cPUNC_BEFORE_EXPRESSION = Cola.makePredicate(Cola.characters("[{(,.;:").concat(["::", "?."]));
Cola.PUNC_BEFORE_EXPRESSION = Cola.makePredicate(Cola.characters("[{(,.;:"));

Cola.PUNC_CHARS = Cola.makePredicate(Cola.characters("[]{}(),;:"));

Cola.REGEXP_MODIFIERS = Cola.makePredicate(Cola.characters("gmsiy"));

/* -----[ Tokenizer ]----- */

// regexps adapted from http://xregexp.com/plugins/#unicode
Cola.UNICODE = {
    letter: new RegExp("[\\u0041-\\u005A\\u0061-\\u007A\\u00AA\\u00B5\\u00BA\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0370-\\u0374\\u0376\\u0377\\u037A-\\u037D\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03F5\\u03F7-\\u0481\\u048A-\\u0523\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u064A\\u066E\\u066F\\u0671-\\u06D3\\u06D5\\u06E5\\u06E6\\u06EE\\u06EF\\u06FA-\\u06FC\\u06FF\\u0710\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u07F4\\u07F5\\u07FA\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961\\u0971\\u0972\\u097B-\\u097F\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0\\u0AE1\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D\\u0C58\\u0C59\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3D\\u0D60\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E46\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD-\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EDC\\u0EDD\\u0F00\\u0F40-\\u0F47\\u0F49-\\u0F6C\\u0F88-\\u0F8B\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061\\u1065\\u1066\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10A0-\\u10C5\\u10D0-\\u10FA\\u10FC\\u1100-\\u1159\\u115F-\\u11A2\\u11A8-\\u11F9\\u1200-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C\\u166F-\\u1676\\u1681-\\u169A\\u16A0-\\u16EA\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C\\u176E-\\u1770\\u1780-\\u17B3\\u17D7\\u17DC\\u1820-\\u1877\\u1880-\\u18A8\\u18AA\\u1900-\\u191C\\u1950-\\u196D\\u1970-\\u1974\\u1980-\\u19A9\\u19C1-\\u19C7\\u1A00-\\u1A16\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0\\u1BAE\\u1BAF\\u1C00-\\u1C23\\u1C4D-\\u1C4F\\u1C5A-\\u1C7D\\u1D00-\\u1DBF\\u1E00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2071\\u207F\\u2090-\\u2094\\u2102\\u2107\\u210A-\\u2113\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u212F-\\u2139\\u213C-\\u213F\\u2145-\\u2149\\u214E\\u2183\\u2184\\u2C00-\\u2C2E\\u2C30-\\u2C5E\\u2C60-\\u2C6F\\u2C71-\\u2C7D\\u2C80-\\u2CE4\\u2D00-\\u2D25\\u2D30-\\u2D65\\u2D6F\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u2E2F\\u3005\\u3006\\u3031-\\u3035\\u303B\\u303C\\u3041-\\u3096\\u309D-\\u309F\\u30A1-\\u30FA\\u30FC-\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31B7\\u31F0-\\u31FF\\u3400\\u4DB5\\u4E00\\u9FC3\\uA000-\\uA48C\\uA500-\\uA60C\\uA610-\\uA61F\\uA62A\\uA62B\\uA640-\\uA65F\\uA662-\\uA66E\\uA67F-\\uA697\\uA717-\\uA71F\\uA722-\\uA788\\uA78B\\uA78C\\uA7FB-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822\\uA840-\\uA873\\uA882-\\uA8B3\\uA90A-\\uA925\\uA930-\\uA946\\uAA00-\\uAA28\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAC00\\uD7A3\\uF900-\\uFA2D\\uFA30-\\uFA6A\\uFA70-\\uFAD9\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40\\uFB41\\uFB43\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF21-\\uFF3A\\uFF41-\\uFF5A\\uFF66-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC]"),
    non_spacing_mark: new RegExp("[\\u0300-\\u036F\\u0483-\\u0487\\u0591-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05C5\\u05C7\\u0610-\\u061A\\u064B-\\u065E\\u0670\\u06D6-\\u06DC\\u06DF-\\u06E4\\u06E7\\u06E8\\u06EA-\\u06ED\\u0711\\u0730-\\u074A\\u07A6-\\u07B0\\u07EB-\\u07F3\\u0816-\\u0819\\u081B-\\u0823\\u0825-\\u0827\\u0829-\\u082D\\u0900-\\u0902\\u093C\\u0941-\\u0948\\u094D\\u0951-\\u0955\\u0962\\u0963\\u0981\\u09BC\\u09C1-\\u09C4\\u09CD\\u09E2\\u09E3\\u0A01\\u0A02\\u0A3C\\u0A41\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A51\\u0A70\\u0A71\\u0A75\\u0A81\\u0A82\\u0ABC\\u0AC1-\\u0AC5\\u0AC7\\u0AC8\\u0ACD\\u0AE2\\u0AE3\\u0B01\\u0B3C\\u0B3F\\u0B41-\\u0B44\\u0B4D\\u0B56\\u0B62\\u0B63\\u0B82\\u0BC0\\u0BCD\\u0C3E-\\u0C40\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C62\\u0C63\\u0CBC\\u0CBF\\u0CC6\\u0CCC\\u0CCD\\u0CE2\\u0CE3\\u0D41-\\u0D44\\u0D4D\\u0D62\\u0D63\\u0DCA\\u0DD2-\\u0DD4\\u0DD6\\u0E31\\u0E34-\\u0E3A\\u0E47-\\u0E4E\\u0EB1\\u0EB4-\\u0EB9\\u0EBB\\u0EBC\\u0EC8-\\u0ECD\\u0F18\\u0F19\\u0F35\\u0F37\\u0F39\\u0F71-\\u0F7E\\u0F80-\\u0F84\\u0F86\\u0F87\\u0F90-\\u0F97\\u0F99-\\u0FBC\\u0FC6\\u102D-\\u1030\\u1032-\\u1037\\u1039\\u103A\\u103D\\u103E\\u1058\\u1059\\u105E-\\u1060\\u1071-\\u1074\\u1082\\u1085\\u1086\\u108D\\u109D\\u135F\\u1712-\\u1714\\u1732-\\u1734\\u1752\\u1753\\u1772\\u1773\\u17B7-\\u17BD\\u17C6\\u17C9-\\u17D3\\u17DD\\u180B-\\u180D\\u18A9\\u1920-\\u1922\\u1927\\u1928\\u1932\\u1939-\\u193B\\u1A17\\u1A18\\u1A56\\u1A58-\\u1A5E\\u1A60\\u1A62\\u1A65-\\u1A6C\\u1A73-\\u1A7C\\u1A7F\\u1B00-\\u1B03\\u1B34\\u1B36-\\u1B3A\\u1B3C\\u1B42\\u1B6B-\\u1B73\\u1B80\\u1B81\\u1BA2-\\u1BA5\\u1BA8\\u1BA9\\u1C2C-\\u1C33\\u1C36\\u1C37\\u1CD0-\\u1CD2\\u1CD4-\\u1CE0\\u1CE2-\\u1CE8\\u1CED\\u1DC0-\\u1DE6\\u1DFD-\\u1DFF\\u20D0-\\u20DC\\u20E1\\u20E5-\\u20F0\\u2CEF-\\u2CF1\\u2DE0-\\u2DFF\\u302A-\\u302F\\u3099\\u309A\\uA66F\\uA67C\\uA67D\\uA6F0\\uA6F1\\uA802\\uA806\\uA80B\\uA825\\uA826\\uA8C4\\uA8E0-\\uA8F1\\uA926-\\uA92D\\uA947-\\uA951\\uA980-\\uA982\\uA9B3\\uA9B6-\\uA9B9\\uA9BC\\uAA29-\\uAA2E\\uAA31\\uAA32\\uAA35\\uAA36\\uAA43\\uAA4C\\uAAB0\\uAAB2-\\uAAB4\\uAAB7\\uAAB8\\uAABE\\uAABF\\uAAC1\\uABE5\\uABE8\\uABED\\uFB1E\\uFE00-\\uFE0F\\uFE20-\\uFE26]"),
    space_combining_mark: new RegExp("[\\u0903\\u093E-\\u0940\\u0949-\\u094C\\u094E\\u0982\\u0983\\u09BE-\\u09C0\\u09C7\\u09C8\\u09CB\\u09CC\\u09D7\\u0A03\\u0A3E-\\u0A40\\u0A83\\u0ABE-\\u0AC0\\u0AC9\\u0ACB\\u0ACC\\u0B02\\u0B03\\u0B3E\\u0B40\\u0B47\\u0B48\\u0B4B\\u0B4C\\u0B57\\u0BBE\\u0BBF\\u0BC1\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCC\\u0BD7\\u0C01-\\u0C03\\u0C41-\\u0C44\\u0C82\\u0C83\\u0CBE\\u0CC0-\\u0CC4\\u0CC7\\u0CC8\\u0CCA\\u0CCB\\u0CD5\\u0CD6\\u0D02\\u0D03\\u0D3E-\\u0D40\\u0D46-\\u0D48\\u0D4A-\\u0D4C\\u0D57\\u0D82\\u0D83\\u0DCF-\\u0DD1\\u0DD8-\\u0DDF\\u0DF2\\u0DF3\\u0F3E\\u0F3F\\u0F7F\\u102B\\u102C\\u1031\\u1038\\u103B\\u103C\\u1056\\u1057\\u1062-\\u1064\\u1067-\\u106D\\u1083\\u1084\\u1087-\\u108C\\u108F\\u109A-\\u109C\\u17B6\\u17BE-\\u17C5\\u17C7\\u17C8\\u1923-\\u1926\\u1929-\\u192B\\u1930\\u1931\\u1933-\\u1938\\u19B0-\\u19C0\\u19C8\\u19C9\\u1A19-\\u1A1B\\u1A55\\u1A57\\u1A61\\u1A63\\u1A64\\u1A6D-\\u1A72\\u1B04\\u1B35\\u1B3B\\u1B3D-\\u1B41\\u1B43\\u1B44\\u1B82\\u1BA1\\u1BA6\\u1BA7\\u1BAA\\u1C24-\\u1C2B\\u1C34\\u1C35\\u1CE1\\u1CF2\\uA823\\uA824\\uA827\\uA880\\uA881\\uA8B4-\\uA8C3\\uA952\\uA953\\uA983\\uA9B4\\uA9B5\\uA9BA\\uA9BB\\uA9BD-\\uA9C0\\uAA2F\\uAA30\\uAA33\\uAA34\\uAA4D\\uAA7B\\uABE3\\uABE4\\uABE6\\uABE7\\uABE9\\uABEA\\uABEC]"),
    connector_punctuation: new RegExp("[\\u005F\\u203F\\u2040\\u2054\\uFE33\\uFE34\\uFE4D-\\uFE4F\\uFF3F]")
};

Cola.is_letter = function (code) {
    return (code >= 97 && code <= 122)
        || (code >= 65 && code <= 90)
        || (code >= 0xaa && Cola.UNICODE.letter.test(String.fromCharCode(code)));
};

Cola.is_digit = function (code) {
    return code >= 48 && code <= 57; //XXX: find out if "UnicodeDigit" means something else than 0..9
};

Cola.is_alphanumeric_char = function (code) {
    return Cola.is_digit(code) || Cola.is_letter(code);
};

Cola.is_unicode_combining_mark = function (ch) {
    return Cola.UNICODE.non_spacing_mark.test(ch) || Cola.UNICODE.space_combining_mark.test(ch);
};

Cola.is_unicode_connector_punctuation = function (ch) {
    return Cola.UNICODE.connector_punctuation.test(ch);
};

Cola.is_identifier = function (name, is_js) {
    return (is_js && !Cola.RESERVED_WORDS(name) || !is_js && !Cola.cRESERVED_WORDS(name)) && /^[a-z_$][a-z0-9_$]*$/i.test(name);
};

Cola.is_identifier_start = function (code) {
    return code == 36 || code == 95 || Cola.is_letter(code);
};

Cola.is_identifier_char = function (ch) {
    var code = ch.charCodeAt(0);
    return Cola.is_identifier_start(code)
        || Cola.is_digit(code)
        || code == 8204 // \u200c: zero-width non-joiner <ZWNJ>
        || code == 8205 // \u200d: zero-width joiner <ZWJ> (in my ECMA-262 PDF, this is also 200c)
        || Cola.is_unicode_combining_mark(ch)
        || Cola.is_unicode_connector_punctuation(ch)
    ;
};

Cola.is_identifier_string = function (str){
    var i = str.length;
    if (i == 0) return false;
    if (!Cola.is_identifier_start(str.charCodeAt(0))) return false;
    while (--i >= 0) {
        if (!Cola.is_identifier_char(str.charAt(i)))
            return false;
    }
    return true;
};

Cola.parse_js_number = function (num) {
    if (Cola.RE_HEX_NUMBER.test(num)) {
        return parseInt(num.substr(2), 16);
    } else if (Cola.RE_OCT_NUMBER.test(num)) {
        return parseInt(num.substr(1), 8);
    } else if (Cola.RE_DEC_NUMBER.test(num)) {
        return parseFloat(num);
    }
};

Cola.JS_Parse_Error = function (message, line, col, pos) {
    this.message = message;
    this.line = line;
    this.col = col;
    this.pos = pos;
    this.stack = new Error().stack;
};

Cola.JS_Parse_Error.prototype.toString = function() {
    return this.message + " (line: " + this.line + ", col: " + this.col + ", pos: " + this.pos + ")" + "\n\n" + this.stack;
};

Cola.js_error = function (message, filename, line, col, pos) {
    throw new Cola.JS_Parse_Error(message, line, col, pos);
};

Cola.is_token = function (token, type, val) {
    return token.type == type && (val == null || token.value == val);
};

Cola.EX_EOF = {};

Cola.Tokenizer = function ($TEXT, filename, is_js, html5_comments) {
    this.S = {
        text            : $TEXT.replace(/\r\n?|[\n\u2028\u2029]/g, "\n").replace(/\uFEFF/g, ''),
        filename        : filename,
        pos             : 0,
        tokpos          : 0,
        line            : 1,
        tokline         : 0,
        col             : 0,
        tokcol          : 0,
        newline_before  : false,
        in_class        : false,
        class_name      : false,
        regex_allowed   : false,
        comments_before : []
    };
    this.dumps = [];
    this.dumpi = -1;

    if(!is_js) this.S.string = {
        at    : [ new Cola.Tokenizer.StringInfo() ],
        level : 0
    };

    if(is_js){
        this.KEYWORDS = Cola.KEYWORDS;
        this.KEYWORDS_ATOM = Cola.KEYWORDS_ATOM;
        this.OPERATORS = Cola.OPERATORS;
        this.UNARY_POSTFIX = Cola.UNARY_POSTFIX;
        this.KEYWORDS_BEFORE_EXPRESSION = Cola.KEYWORDS_BEFORE_EXPRESSION;
        this.PUNC_BEFORE_EXPRESSION = Cola.PUNC_BEFORE_EXPRESSION;
    } else {
        this.KEYWORDS = Cola.cKEYWORDS;
        this.KEYWORDS_ATOM = Cola.cKEYWORDS_ATOM;
        this.OPERATORS = Cola.cOPERATORS;
        this.UNARY_POSTFIX = Cola.cUNARY_POSTFIX;
        this.KEYWORDS_BEFORE_EXPRESSION = Cola.cKEYWORDS_BEFORE_EXPRESSION;
        this.PUNC_BEFORE_EXPRESSION = Cola.cPUNC_BEFORE_EXPRESSION;
    }

    this.is_js = !!is_js;
    this.html5_comments = html5_comments;
    this.prev_was_dot = false;
};

Cola.Tokenizer.StringInfo = function () {
    this.quote = '';
    this.inside = false;
    this.after_at = false;
    this.inside_at = false;
    this.inside_braces = false;
    this.balance = 0;
};

Cola.Tokenizer.with_eof_error = function (eof_error, cont) {
    return function() {
        try {
            return cont.apply(this, arguments);
        } catch(ex) {
            if (ex === Cola.EX_EOF) this.parse_error(eof_error);
            else throw ex;
        }
    };
};

Cola.Tokenizer.prototype.dumpS = function () {
    this.dumps[++this.dumpi] = Cola.clone(this.S);
};

Cola.Tokenizer.prototype.restoreS = function (onlyDown) {
    if(this.dumpi == -1) return;

    if(onlyDown) return this.dumpi--;

    this.S = this.dumps[this.dumpi];
    delete this.dumps[this.dumpi--];
};

Cola.Tokenizer.prototype.peek = function (offset) { return this.S.text.charAt(this.S.pos + (offset ? offset : 0)); };

Cola.Tokenizer.prototype.next = function (signal_eof, in_string) {
    var ch = this.S.text.charAt(this.S.pos++);
    if (signal_eof && !ch)
        throw Cola.EX_EOF;
    if (ch == "\n") {
        this.S.newline_before = this.S.newline_before || !in_string;
        ++this.S.line;
        this.S.col = 0;
    } else {
        ++this.S.col;
    }
    return ch;
};

Cola.Tokenizer.prototype.forward = function (i) {
    while (i-- > 0) this.next();
};

Cola.Tokenizer.prototype.looking_at = function (str) {
    return this.S.text.substr(this.S.pos, str.length) == str;
};

Cola.Tokenizer.prototype.find = function (what, signal_eof) {
    var pos = this.S.text.indexOf(what, this.S.pos);
    if (signal_eof && pos == -1) throw Cola.EX_EOF;
    return pos;
};

Cola.Tokenizer.prototype.start_token = function () {
    this.S.tokline = this.S.line;
    this.S.tokcol = this.S.col;
    this.S.tokpos = this.S.pos;
};

Cola.Tokenizer.prototype.token = function (type, value, is_comment) {
    this.S.regex_allowed = ((type == "operator" && !this.UNARY_POSTFIX(value)) ||
                       (type == "keyword" && this.KEYWORDS_BEFORE_EXPRESSION(value)) ||
                       (type == "punc" && this.PUNC_BEFORE_EXPRESSION(value)));
    this.prev_was_dot = (type == "punc" && value == ".") || (!this.is_js && type == "punc" && (value == "::" || value == "?."));
    var ret = {
        type   : type,
        value  : value,
        line   : this.S.tokline,
        col    : this.S.tokcol,
        pos    : this.S.tokpos,
        endpos : this.S.pos,
        nlb    : this.S.newline_before,
        file   : this.S.filename
    };
    if (!is_comment) {
        ret.comments_before = this.S.comments_before;
        this.S.comments_before = [];
        // make note of any newlines in the comments that came before
        for (var i = 0, len = ret.comments_before.length; i < len; i++) {
            ret.nlb = ret.nlb || ret.comments_before[i].nlb;
        }
    }
    this.S.newline_before = false;
    return new Cola.AST_Token(ret);
};

Cola.Tokenizer.prototype.skip_whitespace = function () {
    while (Cola.WHITESPACE_CHARS(this.peek()))
        this.next();
};

Cola.Tokenizer.prototype.read_while = function (pred) {
    var ret = "", ch, i = 0;
    while ((ch = this.peek()) && pred(ch, i++))
        ret += this.next();
    return ret;
};

Cola.Tokenizer.prototype.parse_error = function (err) {
    Cola.js_error(err, this.S.filename, this.S.tokline, this.S.tokcol, this.S.tokpos);
};

Cola.Tokenizer.prototype.read_num = function (prefix) {
    var has_e = false, after_e = false, has_x = false, has_dot = prefix == ".", _this = this;
    var num = this.read_while(function(ch, i){
        var code = ch.charCodeAt(0);
        switch (code) {
          case 120: case 88: // xX
            return has_x ? false : (has_x = true);
          case 101: case 69: // eE
            return has_x ? true : has_e ? false : (has_e = after_e = true);
          case 45: // -
            return after_e || (i == 0 && !prefix);
          case 43: // +
            return after_e;
          case (after_e = false, 46): // .
            if(!_this.is_js && _this.peek(1) == '.') return false;
            return (!has_dot && !has_x && !has_e) ? (has_dot = true) : false;
        }
        return Cola.is_alphanumeric_char(code);
    });
    if (prefix) num = prefix + num;
    var valid = Cola.parse_js_number(num);
    if (!isNaN(valid)) {
        return this.token("num", valid);
    } else {
        this.parse_error("Invalid syntax: " + num);
    }
};

Cola.Tokenizer.prototype.read_escaped_char = function (in_string) {
    var ch = this.next(true, in_string);
    switch (ch.charCodeAt(0)) {
      case 110 : return "\n";
      case 114 : return "\r";
      case 116 : return "\t";
      case 98  : return "\b";
      case 118 : return "\u000b"; // \v
      case 102 : return "\f";
      case 48  : return "\0";
      case 120 : return String.fromCharCode(this.hex_bytes(2)); // \x
      case 117 : return String.fromCharCode(this.hex_bytes(4)); // \u
      case 10  : return ""; // newline
      default  : return ch;
    }
};

Cola.Tokenizer.prototype.hex_bytes = function (n) {
    var num = 0;
    for (; n > 0; --n) {
        var digit = parseInt(this.next(true), 16);
        if (isNaN(digit))
            this.parse_error("Invalid hex-character pattern in string");
        num = (num << 4) | digit;
    }
    return num;
};

Cola.Tokenizer.prototype.read_string = Cola.Tokenizer.with_eof_error("Unterminated string constant", function(raw, noq){
    var quote = this.next(), ret = "";
    
    if (!this.is_js && !raw) {
        if (this.S.string.at[this.S.string.level].inside && (this.S.string.at[this.S.string.level].inside_at || this.S.string.at[this.S.string.level].inside_braces)) {
            this.S.string.level++;
            this.S.string.at[this.S.string.level] = new Cola.Tokenizer.StringInfo();
        }
        this.S.string.at[this.S.string.level].inside = true;
        
        if (noq) {
            ret = quote;
            quote = this.S.string.at[this.S.string.level].quote;
        } else 

        if (quote == this.S.string.at[this.S.string.level].quote){
            this.S.string.at[this.S.string.level].inside = false;
            this.S.string.at[this.S.string.level].quote = '';
            if(this.S.string.level != 0){
                delete this.S.string.at[this.S.string.level];
                this.S.string.level--;
            }
            return this.next_token();
        } else 

        this.S.string.at[this.S.string.level].quote = quote;
        if (this.peek() == '@' || this.peek() == '{' && this.peek(1) == '{') return this.token("string", ret);
    }

    for (;;) {
        var ch = this.next(true);
        if ((!raw || this.is_js) && ch == "\\") {
            // read OctalEscapeSequence (XXX: deprecated if "strict mode")
            // https://github.com/mishoo/UglifyJS/issues/178
            var octal_len = 0, first = null;
            ch = this.read_while(function(ch){
                if (ch >= "0" && ch <= "7") {
                    if (!first) {
                        first = ch;
                        return ++octal_len;
                    }
                    else if (first <= "3" && octal_len <= 2) return ++octal_len;
                    else if (first >= "4" && octal_len <= 1) return ++octal_len;
                }
                return false;
            });
            if (octal_len > 0) ch = String.fromCharCode(parseInt(ch, 8));
            else ch = this.read_escaped_char(true);
        }
        else if (ch == quote) {
            if(!this.is_js && !raw){
                this.S.string.at[this.S.string.level].inside = false;
                this.S.string.at[this.S.string.level].quote = '';
                if(this.S.string.level != 0){
                    delete this.S.string.at[this.S.string.level];
                    this.S.string.level--;
                }
            }
            break;
        } 
        ret += ch;
        if (!this.is_js && !raw && (this.peek() == '@' || this.peek() == '{' && this.peek(1) == '{')) break;
    } 

    return this.token("string", ret);
});

Cola.Tokenizer.prototype.read_at = function (){
    var at = this.next();

    if (this.S.string.at[this.S.string.level].inside && Cola.is_identifier_char(this.peek())) {
        this.S.string.at[this.S.string.level].after_at = true;
        return this.token("punc", "@");
    } else 

    if (this.S.string.at[this.S.string.level].inside && this.peek() == '{') {
        this.S.string.at[this.S.string.level].inside_at = true;
        this.S.string.at[this.S.string.level].balance = 1;
        return this.token("punc", "@" + this.next());
    } else return this.token("punc", "@");

    this.parse_error('Unexpected character "@"');
}

Cola.Tokenizer.prototype.read_braces = function (){
    this.next(), this.next();
    this.S.string.at[this.S.string.level].inside_braces = true;
    this.S.string.at[this.S.string.level].balance = 1;
    return this.token("punc", "{{");        
}

Cola.Tokenizer.prototype.skip_line_comment = function (type) {
    var regex_allowed = this.S.regex_allowed;
    var i = this.find("\n"), ret;
    if (i == -1) {
        ret = this.S.text.substr(this.S.pos);
        this.S.pos = this.S.text.length;
    } else {
        ret = this.S.text.substring(this.S.pos, i);
        this.S.pos = i;
    }
    this.S.comments_before.push(this.token(type, ret, true));
    this.S.regex_allowed = regex_allowed;
    return this.next_token();
};

Cola.Tokenizer.prototype.skip_multiline_comment = Cola.Tokenizer.with_eof_error("Unterminated multiline comment", function(){
    var regex_allowed = this.S.regex_allowed;
    var i = this.find("*/", true);
    var text = this.S.text.substring(this.S.pos, i);
    var a = text.split("\n"), n = a.length;
    // update stream position
    this.S.pos = i + 2;
    this.S.line += n - 1;
    if (n > 1) this.S.col = a[n - 1].length;
    else this.S.col += a[n - 1].length;
    this.S.col += 2;
    var nlb = this.S.newline_before = this.S.newline_before || text.indexOf("\n") >= 0;
    this.S.comments_before.push(this.token("comment2", text, true));
    this.S.regex_allowed = regex_allowed;
    this.S.newline_before = nlb;
    return this.next_token();
});

Cola.Tokenizer.prototype.read_name = function () {
    var backslash = false, name = "", ch, escaped = false, hex;
    while ((ch = this.peek()) != null) {
        if (!backslash) {
            if (ch == "\\") escaped = backslash = true, this.next();
            else if (Cola.is_identifier_char(ch)) name += this.next();
            else break;
        }
        else {
            if (ch != "u") this.parse_error("Expecting UnicodeEscapeSequence -- uXXXX");
            ch = this.read_escaped_char();
            if (!Cola.is_identifier_char(ch)) this.parse_error("Unicode char: " + ch.charCodeAt(0) + " is not valid in identifier");
            name += ch;
            backslash = false;
        }
    }
    if (this.KEYWORDS(name) && escaped) {
        hex = name.charCodeAt(0).toString(16).toUpperCase();
        name = "\\u" + "0000".substr(hex.length) + hex + name.slice(1);
    }
    if (!this.is_js && this.S.string.at[this.S.string.level].inside && this.S.string.at[this.S.string.level].after_at) this.S.string.at[this.S.string.level].after_at = false;
    return name;
};

Cola.Tokenizer.prototype.read_regexp = Cola.Tokenizer.with_eof_error("Unterminated regular expression", function(regexp){
    var prev_backslash = false, ch, in_class = false;
    while ((ch = this.next(true))) if (prev_backslash) {
        regexp += "\\" + ch;
        prev_backslash = false;
    } else if (ch == "[") {
        in_class = true;
        regexp += ch;
    } else if (ch == "]" && in_class) {
        in_class = false;
        regexp += ch;
    } else if (ch == "/" && !in_class) {
        break;
    } else if (ch == "\\") {
        prev_backslash = true;
    } else {
        regexp += ch;
    }
    var mods = this.read_name();
    return this.token("regexp", this.is_js ? new RegExp(regexp, mods) : "/" + regexp + "/" + mods);
});

Cola.Tokenizer.prototype.read_operator = function (prefix) {
    var _this = this;
    function grow(op) {
        if (!_this.peek()) return op;
        var bigger = op + _this.peek();
        if (_this.OPERATORS(bigger)) {
            _this.next();
            return grow(bigger);
        } else {
            return op;
        }
    };
    return this.token("operator", grow(prefix || this.next()));
};

Cola.Tokenizer.prototype.handle_slash = function () {
    this.next();
    switch (this.peek()) {
      case "/":
        this.next();
        return this.skip_line_comment("comment1");
      case "*":
        this.next();
        return this.skip_multiline_comment();
    }
    return this.S.regex_allowed ? this.read_regexp("") : this.read_operator("/");
};

Cola.Tokenizer.prototype.handle_dot = function () {
    this.next();
    if (!this.is_js && this.peek() == '.' && this.peek(1) != ".") return this.next(), this.token("punc", "..");
    else if (!this.is_js && this.peek() == '.' && this.peek(1) == ".") return this.next(), this.next(), this.token("punc", "...");

    return Cola.is_digit(this.peek().charCodeAt(0))
        ? this.read_num(".")
        : this.token("punc", ".");
    };

Cola.Tokenizer.prototype.read_word = function () {
    var word = this.read_name();
    if (this.prev_was_dot) return this.token("name", word);
    return this.KEYWORDS_ATOM(word) ? this.token("atom", word)
        : !this.KEYWORDS(word) ? this.token("name", word)
        : this.OPERATORS(word) ? this.token("operator", word)
        : this.token("keyword", word);
    };

Cola.Tokenizer.prototype.next_token = function (force_regexp) {
    if (force_regexp != null)
    return this.read_regexp(force_regexp);

    var ch;
    if (!this.is_js && this.S.string.at[this.S.string.level].inside && !this.S.string.at[this.S.string.level].after_at && !this.S.string.at[this.S.string.level].inside_at && !this.S.string.at[this.S.string.level].inside_braces) {
        ch = this.peek();
        if (ch == '@') return this.read_at();
        if (ch == '{' && this.peek(1) == '{') return this.read_braces();
        return this.read_string(false, true);
    }

    this.skip_whitespace();
    this.start_token();
    if (this.html5_comments) {
        if (this.looking_at("<!--")) {
            this.forward(4);
            return this.skip_line_comment("comment3");
        }
        if (this.looking_at("-->") && this.S.newline_before) {
            this.forward(3);
            return this.skip_line_comment("comment4");
        }
    }
    ch = this.peek();
    if (!ch) return this.token("eof");
    var code = ch.charCodeAt(0);
    if(!this.is_js && code == 96) return this.read_string();
    switch (code) {
      case 34: case 39: return this.read_string();
      case 46: return this.handle_dot();
      case 47: return this.handle_slash();
    }
    if (Cola.is_digit(code)) return this.read_num();
    if (Cola.PUNC_CHARS(ch)){

        if (!this.is_js && ch == ":" && this.peek(1) == ":") return this.next(), this.next(), this.token("punc", "::");

        if (!this.is_js && this.S.string.at[this.S.string.level].inside && (this.S.string.at[this.S.string.level].inside_at || this.S.string.at[this.S.string.level].inside_braces)) {
            if (ch == '{') this.S.string.at[this.S.string.level].balance++;
            else if (ch == '}') this.S.string.at[this.S.string.level].balance--;

            if (this.S.string.at[this.S.string.level].balance == 0) 
                if (this.S.string.at[this.S.string.level].inside_at) this.S.string.at[this.S.string.level].inside_at = false;
                else {
                    this.S.string.at[this.S.string.level].inside_braces = false;
                    return this.next(), this.next(), this.token("punc", "}}");
                }
        }

        return this.token("punc", this.next());
    }

    if (!this.is_js) {
        if (ch == "?" && this.peek(1) == ".") return this.next(), this.next(), this.token("punc", "?.");
        if (ch == 'r' && (this.peek(1) == '"' || this.peek(1) == "'" || this.peek(1) == '`')) return this.next(), this.read_string(true);
        if (ch + this.peek(1) == '=>') return this.next(), this.next(), this.token("punc", "=>");
        if (ch == '@') return this.read_at();
    }

    if (Cola.OPERATOR_CHARS(ch)) return this.read_operator();
    if (code == 92 || Cola.is_identifier_start(code)) return this.read_word();
    this.parse_error("Unexpected character '" + ch + "'");
};

Cola.Tokenizer.prototype.context = function(nc) {
    if (nc) this.S = nc;
    return this.S;
};

/* -----[ Parser (constants) ]----- */

Cola.UNARY_PREFIX = Cola.makePredicate([
    "typeof",
    "void",
    "delete",
    "--",
    "++",
    "!",
    "~",
    "-",
    "+"
]);
Cola.cUNARY_PREFIX = Cola.makePredicate([
    "await",
    "clone",
    "typeof",
    "delete",
    "--",
    "++",
    "!",
    "~",
    "-",
    "+"
]);

Cola.cVARS_MODIFICATORS = Cola.makePredicate([ "const", "covert", "static", "export", "async" ]);

Cola.UNARY_POSTFIX = Cola.makePredicate([ "--", "++" ]);
Cola.cUNARY_POSTFIX = Cola.makePredicate([ "--", "++", "?" ]);

Cola.ASSIGNMENT = Cola.makePredicate([ "=", "+=", "-=", "/=", "*=", "%=", ">>=", "<<=", ">>>=", "|=", "^=", "&=" ]);
Cola.cASSIGNMENT = Cola.makePredicate([ "=", "+=", "-=", "/=", "*=", "%=", ">>=", "<<=", ">>>=", "|=", "^=", "&=", "?=" ]);

Cola.mergeTokens = function (a, ret) {
    for (var i = 0; i < a.length; ++i) {
        var b = a[i];
        for (var j = 0; j < b.length; ++j) {
            ret[b[j]] = i + 1;
        }
    }
    return ret;
};

Cola.PRECEDENCE = Cola.mergeTokens(
    [
        ["||"],
        ["&&"],
        ["|"],
        ["^"],
        ["&"],
        ["==", "===", "!=", "!=="],
        ["<", ">", "<=", ">=", "in", "instanceof"],
        [">>", "<<", ">>>"],
        ["+", "-"],
        ["*", "/", "%"]
    ],
    {}
);
Cola.cPRECEDENCE = Cola.mergeTokens(
    [
        ["||"],
        ["&&"],
        ["|"],
        ["^"],
        ["&"],
        ["==", "===", "!=", "!=="],
        ["<", ">", "<=", ">=", "in", "of", "instanceof", "is", "isnt"],
        [">>", "<<", ">>>"],
        ["+", "-"],
        ["*", "/", "%", "**", "%%"]
    ],
    {}
);

Cola.STATEMENTS_WITH_LABELS = Cola.array_to_hash([ "for", "do", "while", "switch" ]);

Cola.ATOMIC_START_TOKEN = Cola.array_to_hash([ "atom", "num", "string", "regexp", "name" ]);

/* -----[ Parser ]----- */

Cola.parse = function ($TEXT, options) {
    return (new Cola.Parser($TEXT, options)).parse();
};

Cola.Parser = function ($TEXT, options) {
    var _this = this;

    this.options = Cola.defaults(options, {
        strict         : false,
        filename       : null,
        toplevel       : null,
        expression     : false,
        html5_comments : true,
        is_js          : false,
        braces_free    : true
    });

    this.is_js = !!this.options.is_js;
    this.tokenizer = typeof $TEXT == "string" ? new Cola.Tokenizer($TEXT, this.options.filename, this.is_js, this.options.html5_comments) : $TEXT;

    this.S = {
        input : function(){ return _this.tokenizer.next_token() },
        token         : null,
        prev          : null,
        peeked        : null,
        in_function   : 0,
        in_async_function   : 0,
        in_directives : true,
        in_loop       : 0,
        labels        : []
    };
    this.S.input.context = function(){ return _this.tokenizer.context() };
    this.S.token = this.next();
    this.dumps = [];
    this.dumpi = -1;

    this.requiredModules = [];

    if(this.is_js){
        this.UNARY_PREFIX = Cola.UNARY_PREFIX;
        this.PRECEDENCE = Cola.PRECEDENCE;
        this.ASSIGNMENT = Cola.ASSIGNMENT;
        this.UNARY_POSTFIX = Cola.UNARY_POSTFIX;
    } else {
        this.UNARY_PREFIX = Cola.cUNARY_PREFIX;
        this.PRECEDENCE = Cola.cPRECEDENCE;
        this.ASSIGNMENT = Cola.cASSIGNMENT;
        this.UNARY_POSTFIX = Cola.cUNARY_POSTFIX;
    }
};

Cola.Parser.prototype.parse = function () {
    var _this = this;
    if (this.options.expression) {
        return this.expression(true);
    }

    return (function(){
        var start = _this.S.token;
        var body = [];
        while (!_this.is("eof"))
            body.push(_this.statement());
        var end = _this.prev();
        var toplevel = _this.options.toplevel;
        if (toplevel) {
            toplevel.body = toplevel.body.concat(body);
            toplevel.end = end;
        } else {
            toplevel = new Cola.AST_Toplevel({ start: start, body: body, end: end });
        }
        toplevel.language = _this.is_js ? 'js' : 'cola';
        toplevel.requiredModules = _this.requiredModules;
        return toplevel;
    })();
};

Cola.Parser.prototype.dumpS = function () {
    this.dumps[++this.dumpi] = Cola.clone(this.S);    
    this.tokenizer.dumpS();
};

Cola.Parser.prototype.restoreS = function (onlyDown) {
    if(this.dumpi == -1) return;

    this.tokenizer.restoreS(onlyDown);
    if(onlyDown) return this.dumpi--;
    
    this.S = this.dumps[this.dumpi];
    delete this.dumps[this.dumpi--];
};

Cola.Parser.prototype.next_until = function (until) {
    while(true){
        if(until(this.S.token)) break;
        this.next();
    }
    return this.S.token;
}

Cola.Parser.prototype.is = function (type, value) {
    return Cola.is_token(this.S.token, type, value);
};

Cola.Parser.prototype.peek = function () { return this.S.peeked || (this.S.peeked = this.S.input()); };

Cola.Parser.prototype.next_is = function (type, value) {
    return Cola.is_token(this.peek(), type, value);
};

Cola.Parser.prototype.next = function () {
    this.S.prev = this.S.token;
    if (this.S.peeked) {
        this.S.token = this.S.peeked;
        this.S.peeked = null;
    } else {
        this.S.token = this.S.input();
    }
    this.S.in_directives = this.S.in_directives && (
        this.S.token.type == "string" || this.is("punc", ";")
    );
    return this.S.token;
};

Cola.Parser.prototype.prev = function () {
    return this.S.prev;
};

Cola.Parser.prototype.croak = function (msg, line, col, pos) {
    var ctx = this.S ? this.S.input.context() : {};
    Cola.js_error(msg,
             ctx.filename,
             line != null ? line : ctx.tokline,
             col != null ? col : ctx.tokcol,
             pos != null ? pos : ctx.tokpos);
};

Cola.Parser.prototype.token_error = function (token, msg) {
    this.croak(msg, token.line, token.col, token.pos);
};

Cola.Parser.prototype.unexpected = function (token) {
    if (token == null)
        token = this.S.token;
    this.token_error(token, "Unexpected token: " + token.type + " `" + token.value + "`");
};

Cola.Parser.prototype.expect_token = function (type, val, stay) {
    if (this.is(type, val)) {
        return stay ? undefined : this.next();
    }
    this.token_error(this.S.token, "Unexpected token " + this.S.token.type + " `" + this.S.token.value + "`" + ", expected " + type + " `" + val + "`");
};

Cola.Parser.prototype.expect = function (punc, stay) { return this.expect_token("punc", punc, stay); };

Cola.Parser.prototype.can_insert_semicolon = function () {
    if(!this.is_js) return false;
    return !this.options.strict && (
        this.S.token.nlb || this.is("eof") || this.is("punc", "}")
    );
};

Cola.Parser.prototype.semicolon = function () {
    if (this.is("punc", ";")) this.next();
    else if (!this.can_insert_semicolon()) this.unexpected();
};

Cola.Parser.prototype.parenthesised = function () {
    if (this.is_js || !this.options.braces_free) this.expect("(");
    var exp = this.expression(true);
    if (this.is_js || !this.options.braces_free) this.expect(")");
    else this.expect("{", true);
    return exp;
};

Cola.Parser.embed_tokens = function (parser) {
    return function() {
        var start = this.S.token;
        var expr = parser.apply(this, arguments);
        var end = this.prev();
        expr.start = start;
        expr.end = end;
        return expr;
    };
};

Cola.Parser.prototype.handle_regexp = function () {
    if (this.is("operator", "/") || this.is("operator", "/=")) {
        this.S.peeked = null;
        this.S.token = this.S.input(this.S.token.value.substr(1)); // force regexp
    }
};

Cola.Parser.prototype.statement = Cola.Parser.embed_tokens(function() {
    var tmp, type, _this = this;
    this.handle_regexp();
    switch (this.S.token.type) {
      case "string":
        var dir = this.S.in_directives, stat = this.simple_statement();
        // XXXv2: decide how to fix directives
        if (dir && stat.body instanceof Cola.AST_String && !this.is("punc", ","))
            return new Cola.AST_Directive({ value: stat.body.value });
        return stat;
      case "num":
      case "regexp":
      case "operator":
      case "atom":
        return this.simple_statement();

      case "name": case "keyword":
        var mods = [];

        if(!this.is_js && this.is("keyword") && Cola.cVARS_MODIFICATORS(this.S.token.value))
            while(this.is("keyword") && Cola.cVARS_MODIFICATORS(this.S.token.value)){
                mods.push(this.S.token.value);
                this.next();
            }

        if(!this.is_js && this.is("keyword", "class")){
            this.next();
            return this.class_(mods);
        }

        if(!this.is_js && this.is("keyword", "singleton")){
            this.next();
            return this.singleton_(mods);
        }

        if(!this.is_js && this.is("keyword", "function")){
            this.next();
            return this.function_(Cola.AST_Defun, false, mods);
        }

        if(!this.is_js && this.is("keyword", "get")){
            this.next();
            return this.function_(Cola.AST_Getter, false, mods);
        }

        if(!this.is_js && this.is("keyword", "set")){
            this.next();
            return this.function_(Cola.AST_Setter, false, mods);
        }

        if(!this.is_js && this.is("keyword", "var")){
            this.next();
            return tmp = this.var_(false, false, mods), this.semicolon(), tmp;
        }

        if(!this.is_js && this.is("name") && (this.next_is("name") || this.next_is("keyword", "function") || this.next_is("keyword", "get") || this.next_is("keyword", "set"))){
            type = this.S.token.value, this.next();

            var isfun = false, ctor = Cola.AST_Defun;

            if(this.is("keyword", "get")){ 
                ctor = Cola.AST_Getter;
                this.next();
            } else if(this.is("keyword", "set")){
                ctor = Cola.AST_Setter;
                this.next();
            } else if(this.is("keyword", "function"))
                this.next();

            this.dumpS();
                this.subscripts(this.as_symbol(Cola.AST_SymbolDefun), false);
                isfun = this.is("punc", "(");
            this.restoreS();

            if(isfun){
                if(mods.indexOf("const") != -1) this.token_error(this.S.token, "Function can't have `const` modifer");
                return this.function_(ctor, type, mods);
            } else return tmp = this.var_(false, type, mods), this.semicolon(), tmp;
        }

        if(!this.is_js && this.is("name")){ 
            var _this = this, balance = 1, isfun = false;
            this.dumpS();
                
                this.subscripts(this.as_symbol(Cola.AST_SymbolDefun), false);
                if(this.is('punc', '(')){
                    this.next();
                    this.next_until(function(){
                        if(_this.is('punc', '(')) balance++;
                        else if(_this.is('punc', ')')) balance--;

                        return balance == 0 || _this.is('eof');
                    });
                    isfun = (this.next(), (this.is('punc','{') || this.is('punc','=>')));
                }

            this.restoreS();
            if(isfun) {
                if(mods.indexOf("const") != -1) this.token_error(this.S.token, "Function can't have `const` modifer");
                return this.function_(Cola.AST_Defun, false, mods);
            }
        }

        if(!this.is_js && mods.length != 0 && this.is("name"))
            return tmp = this.var_(false, false, mods), this.semicolon(), tmp;

        if(!this.is_js && mods.length) this.unexpected();

        if(this.is("name")) return this.next_is("punc", ":")
            ? this.labeled_statement()
            : this.simple_statement();

      case "punc":
        switch (this.S.token.value) {
          case "@":
            if (!this.is_js && (this.next_is("name") || this.next_is("keyword")))
                return new Cola.AST_Command({
                    name : this.next().value,
                    args : (function(name){
                        var args = [];

                        if (name == 'require' || name == 'include') {
                            while (!this.peek().nlb && !this.next_is('eof')){
                                this.next();
                                if (!this.is("string")) this.unexpected();
                                args.push(this.S.token.value);
                            }
                            this.next();
                        } else 
                        if (name == 'import') {
                            var lib = false, component = false, as = false; 

                            this.next();

                            if (this.is("string")) {
                                lib = this.S.token.value;

                                if (this.next_is("name", "as")) {
                                    this.next(); this.next();
                                    
                                    if (!this.is("name")) this.unexpected();
                                    as = this.S.token.value;
                                }

                                args.push([lib, component, as]);
                            } else 
                            if (this.is("name")) {
                                while (!this.S.token.nlb && !this.is("eof")) {
                                    component = this.S.token.value;
                                    this.next();

                                    if (this.is("name", "as")) {
                                        this.next();

                                        if (!this.is("name")) this.unexpected();
                                        as = this.S.token.value;

                                        this.next();
                                    } else as = component;

                                    args.push([lib, component, as]);

                                    if (this.is("punc", ",")) this.next();
                                    else break;
                                }

                                if (!this.is("name", "from")) this.unexpected();
                                this.next();

                                if (!this.is("string")) this.unexpected();
                                lib = this.S.token.value;

                                args.forEach(function(args) {
                                    args[0] = lib;
                                });
                            } else this.unexpected();

                            if (!this.peek().nlb && !this.next_is("eof")) this.unexpected();
                            this.next();

                            Cola.push_uniq(this.requiredModules, lib);
                        } else 
                        if (name == 'export') {
                            var lib = false, component = false, as = false; 

                            this.next();

                            if (this.is("string")) {
                                lib = this.S.token.value;

                                args.push([lib, component, as]);
                            } else 
                            if (this.is("name")) {
                                while (!this.S.token.nlb && !this.is("eof")) {
                                    component = this.S.token.value;
                                    if (!this.peek().nlb) this.next();

                                    if (this.is("name", "as")) {
                                        this.next();

                                        if (!this.is("name")) this.unexpected();
                                        as = this.S.token.value;

                                        this.next();
                                    } else as = component;

                                    args.push([lib, component, as]);

                                    if (this.is("punc", ",")) this.next();
                                    else break;
                                }

                                if (this.is("name", "from")) {
                                    this.next();

                                    if (!this.is("string")) this.unexpected();
                                    lib = this.S.token.value;

                                    args.forEach(function(args) {
                                        args[0] = lib;
                                    });
                                }
                            } else this.unexpected();

                            if (!this.peek().nlb && !this.next_is("eof")) this.unexpected();
                            this.next();

                            if (lib) Cola.push_uniq(this.requiredModules, lib);
                        } else 
                        if (name == 'use') {
                            this.next();

                            if (!this.is("name")) this.unexpected();
                            args.push(this.S.token.value);

                            if (this.S.token.value == 'closure' || this.S.token.value == 'server' || this.S.token.value == 'client') {
                                this.next();
                                args.push(this.is("punc","{"), new Cola.AST_BlockStatement({
                                    start : this.S.token,
                                    body  : this.block_(!this.is("punc","{")),
                                    end   : this.prev()
                                }));
                            } else 
                            if (this.S.token.value != "asm" && this.S.token.value != "strict") this.unexpected();
                        } else this.unexpected();
                        
                        return args;
                    }).call(this, this.S.token.value)
                });

          case "{":
            if (this.is_js) return new Cola.AST_BlockStatement({
                start : this.S.token,
                body  : this.block_(),
                end   : this.prev()
            });
            
            return this.maybe_template_assign(false);

          case "[":
            return this.maybe_template_assign(true);
          case "(":
            return this.simple_statement();
          case ";":
            this.next();
            return new Cola.AST_EmptyStatement();
          default:
            if(!this.is_js && !this.is("keyword")) this.unexpected();
        }

      case "keyword":
        switch (tmp = this.S.token.value, this.next(), tmp) {
          case "break":
            return this.break_cont(Cola.AST_Break);

          case "continue":
            return this.break_cont(Cola.AST_Continue);

          case "debugger":
            this.semicolon();
            return new Cola.AST_Debugger();

          case "do":
            return new Cola.AST_Do({
                body      : this.in_loop(function(){ return this.statement() }),
                condition : (this.expect_token("keyword", "while"), tmp = this.parenthesised(), this.semicolon(), tmp)
            });

          case "while":
            return new Cola.AST_While({
                condition : this.parenthesised(),
                body      : this.in_loop(function(){ return this.statement() })
            });

          case "for":
            return this.for_();

          case "class":
            return this.class_();

          case "singleton":
            return this.singleton_();

          case "function":
            return this.function_(Cola.AST_Defun);

          case "get":
            if(!this.is_js) return this.function_(Cola.AST_Getter);

          case "set":
            if(!this.is_js) return this.function_(Cola.AST_Setter);

          case "if":
            return this.if_();

          case "return": case "resolve": case "reject":
            if (this.S.in_function == 0)
                this.croak("'" + tmp + "' outside of function");

            if (tmp != "return" && this.S.in_async_function == 0)
                this.croak("'" + tmp + "' outside of async function");

            var ctor = Cola.AST_Return;
            if (tmp == "resolve") ctor = Cola.AST_Resolve;
            else if (tmp == "reject") ctor = Cola.AST_Reject;

            return new ctor({
                value: ( this.is("punc", ";")
                         ? (this.next(), null)
                         : this.can_insert_semicolon()
                         ? null
                         : (tmp = this.expression(true), this.semicolon(), tmp) )
            });

          case "switch":
            return new Cola.AST_Switch({
                expression : this.is('punc', '{') && !this.is_js ? new Cola.AST_Noop() : this.parenthesised(),
                body       : this.in_loop(this.switch_body_)
            });

          case "throw":
            if (this.S.token.nlb)
                this.croak("Illegal newline after 'throw'");
            return new Cola.AST_Throw({
                value: (tmp = this.expression(true), this.semicolon(), tmp)
            });

          case "try":
            return this.try_();

          case "var":
            return tmp = this.var_(), this.semicolon(), tmp;

          case "const":
            return tmp = this.const_(), this.semicolon(), tmp;

          case "with":
            return new Cola.AST_With({
                expression : this.parenthesised(),
                body       : this.statement()
            });

          default:
            this.unexpected();
        }
    }
});

Cola.Parser.prototype.maybe_template_assign = function (array) {
    var _this = this;
    if (!array) {
        this.dumpS();
            var balance = 0, is_object = false;
            this.next_until(function(){
                if(_this.is('punc', '{')) balance++;
                else if(_this.is('punc', '}')) balance--;

                return balance == 0 || _this.is('eof');
            });
            is_object = this.next_is("operator");
        this.restoreS();

        if(is_object){
            var start = this.S.token, tobj = this.object_(false, false, true), top = this.S.token.value;

            if (tobj.vardef && top != "=")
                this.token_error(this.S.token, "Invalid operator `" + top + "`.");

            this.next();

            tobj = new Cola.AST_Assign({
                start    : start,
                left     : tobj,
                operator : top,
                right    : this.maybe_assign(false),
                end      : this.prev()
            });

            return new Cola.AST_SimpleStatement({
                start : tobj.start,
                body  : tobj,
                end   : tobj.end
            });
        }
        
        return new Cola.AST_BlockStatement({
            start : this.S.token,
            body  : this.block_(),
            end   : this.prev()
        });
    } else {
        this.dumpS();
            var balance = 0, is_array = false;
            this.next_until(function(){
                if(_this.is('punc', '[')) balance++;
                else if(_this.is('punc', ']')) balance--;

                return balance == 0 || _this.is('eof');
            });
            is_array = this.next_is("operator");
        this.restoreS();

        if(is_array){
            var start = this.S.token, tarr = this.array_(false, false, true), top = this.S.token.value;

            if (tarr.vardef && top != "=")
                this.token_error(this.S.token, "Invalid operator `" + top + "`.");

            this.next();

            tarr = new Cola.AST_Assign({
                start    : start,
                left     : tarr,
                operator : top,
                right    : this.maybe_assign(false),
                end      : this.prev()
            });

            return new Cola.AST_SimpleStatement({
                start : tarr.start,
                body  : tarr,
                end   : tarr.end
            });
        }

        return this.simple_statement();
    }
};

Cola.Parser.prototype.labeled_statement = function () {
    var label = this.as_symbol(Cola.AST_Label), _this = this;
    if (Cola.find_if(function(l){ return l.name == label.name }, this.S.labels)) {
        // ECMA-262, 12.12: An ECMAScript program is considered
        // syntactically incorrect if it contains a
        // LabelledStatement that is enclosed by a
        // LabelledStatement with the same Identifier as label.
        this.croak("Label " + label.name + " defined twice");
    }
    this.expect(":");
    this.S.labels.push(label);
    var stat = this.statement();
    this.S.labels.pop();
    if (!(stat instanceof Cola.AST_IterationStatement)) {
        // check for `continue` that refers to this label.
        // those should be reported as syntax errors.
        // https://github.com/mishoo/UglifyJS2/issues/287
        label.references.forEach(function(ref){
            if (ref instanceof Cola.AST_Continue) {
                ref = ref.label.start;
                _this.croak("Continue label `" + label.name + "` refers to non-IterationStatement.",
                      ref.line, ref.col, ref.pos);
            }
        });
    }
    return new Cola.AST_LabeledStatement({ body: stat, label: label });
};

Cola.Parser.prototype.simple_statement = function (tmp) {
    return new Cola.AST_SimpleStatement({ body: (tmp = this.expression(true), this.semicolon(), tmp) });
};

Cola.Parser.prototype.break_cont = function (type) {
    var label = null, ldef;
    if (!this.can_insert_semicolon()) {
        label = this.as_symbol(Cola.AST_LabelRef, true);
    }
    if (label != null) {
        ldef = Cola.find_if(function(l){ return l.name == label.name }, this.S.labels);
        if (!ldef)
            this.croak("Undefined label " + label.name);
        label.thedef = ldef;
    }
    else if (this.S.in_loop == 0)
        this.croak(type.TYPE + " not inside a loop or switch");
    this.semicolon();
    var stat = new type({ label: label });
    if (ldef) ldef.references.push(stat);
    return stat;
};

Cola.Parser.prototype.for_ = function () {
    if (this.is_js || !this.options.braces_free) this.expect("(");
    var init = null;
    if (!this.is("punc", ";")) {
        init = this.is("keyword", "var") || !this.is_js && this.is("name") && this.next_is("name")
            ? (this.next(), this.var_(true, this.prev().value))
            : this.expression(true, true);
            
        if (this.is("operator", "in")) {
            if (init instanceof Cola.AST_Var && init.definitions.length > 1)
                this.croak("Only one variable declaration allowed in for..in loop");
            this.next();
            return this.for_in(init);
        } else
        if (!this.is_js && this.is("operator", "of")) {
            if (init instanceof Cola.AST_Var && init.definitions.length > 1)
                this.croak("Only one variable declaration allowed in for..of loop");
            this.next();
            return this.for_of(init);
        }
    }
    return this.regular_for(init);
};

Cola.Parser.prototype.regular_for = function (init) {
    this.expect(";");
    var test = this.is("punc", ";") ? null : this.expression(true);
    this.expect(";");
    var step = this.is("punc", ")") ? null : this.expression(true);
    if (this.is_js || !this.options.braces_free) this.expect(")");
    else this.expect("{", true);
    var _this = this;
    return new Cola.AST_For({
        init      : init,
        condition : test,
        step      : step,
        body      : this.in_loop(function(){ return this.statement() })
    });
};

Cola.Parser.prototype.for_in = function (init) {
    var lhs = init instanceof Cola.AST_Var ? init.definitions[0].name : null;
    var obj = this.expression(true);
    if (this.is_js || !this.options.braces_free) this.expect(")");
    else this.expect("{", true);
    var _this = this;
    return new Cola.AST_ForIn({
        init   : init,
        name   : lhs,
        object : obj,
        body   : this.in_loop(function(){ return this.statement() })
    });
};

Cola.Parser.prototype.for_of = function (init) {
    var lhs = init instanceof Cola.AST_Var ? init.definitions[0].name : null;
    var obj = this.expression(true);
    if (!this.options.braces_free) this.expect(")");
    else this.expect("{", true);
    var _this = this;
    return new Cola.AST_ForOf({
        init   : init,
        name   : lhs,
        object : obj,
        body   : this.in_loop(function(){ return this.statement() })
    });
};

Cola.Parser.prototype.class_ = function(mods){
    if(this.S.in_class)
        this.token_error(this.prev(), "You can define class or singleton only in root scope.");

    if (mods && (mods.length > 1 || mods[0] && mods[0] != "export"))
        this.token_error(this.prev(), "Class and singleton can have only `export` modificator.");

    this.S.in_class = true;

    var _this = this,
        name = this.is("name") ? this.as_symbol(Cola.AST_SymbolClass) : this.unexpected(),
        extends_ = false;

    this.S.class_name = name.name;

    if(this.is("keyword", "extends")){
        this.next();
        if(!this.is("name")) this.unexpected();
        extends_ = this.subscripts((extends_ = this.as_symbol(Cola.AST_SymbolRef)), true);
    }
    
    return new Cola.AST_Class({
        name: name,
        extends: extends_,
        mods: mods || [],
        body: (function(loop, labels){
            ++_this.S.in_function;
            _this.S.in_directives = true;
            _this.S.in_loop = 0;
            _this.S.labels = [];

            var tmp, a = _this.block_();
            
            --_this.S.in_function;
            _this.S.in_loop = loop;
            _this.S.labels = labels;

            var mconstr = false, nconstrs = false;
            a.forEach(function(member){
                if(member instanceof Cola.AST_Defun && member.name instanceof Cola.AST_SymbolDefun && member.name.name == _this.S.class_name){
                    if(member.type != "dynamic")
                        _this.token_error(member.start, "Constructor can't have returned type.");

                    if(member.mods.length != 0)
                        _this.token_error(member.start, "Constructor can't have modificators.");

                    if(nconstrs)
                        _this.token_error(member.start, "Main constructor must be defined before named constructors");

                    if(mconstr)
                        _this.token_error(member.start, "Main constructor can be defined only one time");
                    
                    mconstr = true;
                } else if(member instanceof Cola.AST_Defun && member.name instanceof Cola.AST_Dot && 
                          member.name.expression instanceof Cola.AST_SymbolDefun && member.name.expression.name == _this.S.class_name){
                    if(member.type != "dynamic")
                        _this.token_error(member.start, "Constructor can't have returned type.");

                    if(member.mods.length != 0)
                        _this.token_error(member.start, "Constructor can't have modificators.");

                    nconstrs = true;
                } else if(member instanceof Cola.AST_Defun && member.name instanceof Cola.AST_Dot && member.mods.indexOf("static") != -1){
                    _this.token_error(member.start, "Unexpected `static` modificator.");
                }
            });

            _this.S.in_class = false;
            _this.S.class_name = false;
            return a;
        })(this.S.in_loop, this.S.labels)
    });
};

Cola.Parser.prototype.singleton_ = function(mods){
    if(this.S.in_class)
        this.token_error(this.prev(), "You can define class or singleton only in root scope.");

    if (mods && (mods.length > 1 || mods[0] && mods[0] != "export"))
        this.token_error(this.prev(), "Class and singleton can have only `export` modificator.");

    this.S.in_class = true;

    var _this = this,
        name = this.is("name") ? this.as_symbol(Cola.AST_SymbolSingleton) : this.unexpected();

    this.S.class_name = name.name;
    
    return new Cola.AST_Singleton({
        name: name,
        mods: mods || [],
        body: (function(loop, labels){
            ++_this.S.in_function;
            _this.S.in_directives = true;
            _this.S.in_loop = 0;
            _this.S.labels = [];

            var tmp, a = _this.block_();
            
            --_this.S.in_function;
            _this.S.in_loop = loop;
            _this.S.labels = labels;

            var mconstr = false;
            a.forEach(function(member){
                if(member instanceof Cola.AST_Defun && member.name instanceof Cola.AST_SymbolDefun && member.name.name == _this.S.class_name){
                    if(member.type != "dynamic")
                        _this.token_error(member.start, "Constructor can't have returned type.");

                    if(member.mods.length != 0)
                        _this.token_error(member.start, "Constructor can't have modificators.");

                    if(member.argnames.length)
                        _this.token_error(member.start, "Singleton's constructor can't have arguments.");

                    if(mconstr)
                        _this.token_error(member.start, "Main constructor can be defined only one time");
                    
                    mconstr = true;
                } else if(member instanceof Cola.AST_Defun && member.name instanceof Cola.AST_Dot && member.mods.indexOf("static") != -1){
                    _this.token_error(member.start, "Unexpected `static` modificator.");
                }
            });

            _this.S.in_class = false;
            _this.S.class_name = false;
            return a;
        })(this.S.in_loop, this.S.labels)
    });
};

Cola.Parser.prototype.as_funcarg = function(splatedexist) {
    var name = this.as_symbol(Cola.AST_SymbolFunarg), type = name, argtype = 'positional', defval = new Cola.AST_Noop, required = true;

    if(this.is("name")) name = this.as_symbol(Cola.AST_SymbolFunarg);

    if(this.is("operator", "?")){
        required = false;
        this.next();
    }

    if(this.is("punc", "...") && required){
        if(splatedexist) this.token_error(this.S, "Unexpected token: splated argument can be only one.");
        if(type != name && type.name != "Array") this.token_error(this.S, "Unexpected token: splated argument must have `Array` type.");
        required = false;
        this.next();
        argtype = "splated";
    } else if(this.is("operator", "=") && required){
        this.next();
        defval = this.expression(false);
    } else if(this.is("punc",":")){
        this.next();
        argtype = "named";
        if(!this.is("punc",",") && !this.is("punc",")")){
            defval = this.expression(false);
        }
    }

    return new Cola.AST_ArgDef({
        name     : name,
        type     : name.type = (argtype == "splated" ? "Array" : type == name ? "dynamic" : type.name),
        required : required,
        argtype  : argtype,
        defval   : defval,
        start    : type.start,
        end      : this.prev()
    });
};

Cola.Parser.prototype.function_ = function(ctor, type, mods) {
    !type && (type = "dynamic");
    !mods && (mods = []);
    
    var in_statement = ctor === Cola.AST_Defun || ctor === Cola.AST_Setter || ctor === Cola.AST_Getter, _this = this, splatedexist = false;
    var name = this.is("name") ? this.as_symbol(in_statement ? Cola.AST_SymbolDefun : Cola.AST_SymbolLambda) : null;
    //var args_skiped = false;
    
    if (name != null) name = this.subscripts(name, false);

    if(!this.S.in_class){
        if(name instanceof Cola.AST_Symbol){
            if(!Cola.modsVerifi(mods, ["export", "async"]))
                this.token_error(name.start, "Function definition outside of class can contain only `export` and `async` modifers");
        }

        else {
            if(Cola.modsContains(mods, ["export", "static"]))
                this.token_error(name.start, "Prop definition can't contain `static` and `export` modifers");
        }
    } else if (mods.indexOf("export") != -1)
        this.token_error(name.start, "Invalid `export` modifer");

    if (in_statement && !name)
        this.unexpected();

    this.expect("(");
    return new ctor({
        mods: mods,
        type: type,
        name: name,
        argnames: (function(first, a){
            while (!_this.is("punc", ")")) {
                if (first) first = false; else _this.expect(",");
                a.push(_this.is_js ? _this.as_symbol(Cola.AST_SymbolFunarg) : _this.as_funcarg(splatedexist));
                splatedexist = a[a.length - 1].argtype == "splated";
            }
            _this.next();
            return a;
        })(true, []),
        body: (function(loop, labels){
            ++_this.S.in_function;
            if (mods.indexOf("async") != -1) ++_this.S.in_async_function;
            _this.S.in_directives = true;
            _this.S.in_loop = 0;
            _this.S.labels = [];

            var tmp, a = !_this.is_js && _this.is("punc", "=>")
                ? (_this.next(), [new Cola.AST_Return({
                    start: new Cola.AST_Token({ nlb : false, type : 'keyword', value : 'return' }),
                    value: (function(){
                        tmp = _this.expression(ctor === Cola.AST_Defun || ctor === Cola.AST_Setter || ctor === Cola.AST_Getter);
                        if ( ctor === Cola.AST_Defun || ctor === Cola.AST_Setter || ctor === Cola.AST_Getter ) {
                            _this.semicolon(); 
                            //_this.next();
                        } 
                        return tmp;
                    })(),
                    end  : _this.prev()
                })])
                : _this.block_();
            
            --_this.S.in_function;
            if (mods.indexOf("async") != -1) --_this.S.in_async_function;
            _this.S.in_loop = loop;
            _this.S.labels = labels;
            return a;
        })(this.S.in_loop, this.S.labels)
    });
};

Cola.Parser.prototype.if_ = function (inline) {
    var cond = this.parenthesised(), body = (inline && !this.is_js ? this.expression(true) : this.statement()), belse = null;
    if (this.is("keyword", "else")) {
        this.next();
        if (inline && !this.is_js) belse = this.is("keyword", "if") ? (this.next(), this.if_(true)) : this.expression(true);
        else belse = this.statement();
    }
    return new Cola.AST_If({
        condition   : cond,
        body        : body,
        alternative : belse,
        inline      : inline
    });
};

Cola.Parser.prototype.block_ = function (to_eof) {
    if(this.is_js || !to_eof) this.expect("{");
    var a = [];

    if (this.is_js || !to_eof)
        while (!this.is("punc", "}")) {
            if (this.is("eof")) this.unexpected();
            a.push(this.statement());
        }
    else 
        while (!this.is("eof")) a.push(this.statement());

    this.next();
    return a;
};

Cola.Parser.prototype.switch_body_ = function () {
    this.expect("{");
    var a = [], cur = null, branch = null, tmp;
    while (!this.is("punc", "}")) {
        if (this.is("eof")) this.unexpected();
        if (this.is("keyword", "case") || !this.is_js && this.is("keyword", "when")) {
            if (branch) branch.end = this.prev();
            cur = [];
            branch = new (!this.is_js && this.is("keyword", "when") ? Cola.AST_When : Cola.AST_Case)({
                start      : (tmp = this.S.token, this.next(), tmp),
                expression : this.expression(true),
                body       : cur
            });
            a.push(branch);
            this.expect(":");
        }
        else if (this.is("keyword", "default")) {
            if (branch) branch.end = this.prev();
            cur = [];
            branch = new Cola.AST_Default({
                start : (tmp = this.S.token, this.next(), this.expect(":"), tmp),
                body  : cur
            });
            a.push(branch);
        }
        else {
            if (!cur) this.unexpected();
            cur.push(this.statement());
        }
    }
    if (branch) branch.end = this.prev();
    this.next();
    return a;
};

Cola.Parser.prototype.try_ = function () {
    var body = this.block_(), bcatch = null, bfinally = null;
    if (this.is("keyword", "catch")) {
        var start = this.S.token;
        this.next();
        this.expect("(");
        var name = this.as_symbol(Cola.AST_SymbolCatch);
        this.expect(")");
        bcatch = new Cola.AST_Catch({
            start   : start,
            argname : name,
            body    : this.block_(),
            end     : this.prev()
        });
    }
    if (this.is("keyword", "finally")) {
        var start = this.S.token;
        this.next();
        bfinally = new Cola.AST_Finally({
            start : start,
            body  : this.block_(),
            end   : this.prev()
        });
    }
    if (!bcatch && !bfinally)
        this.croak("Missing catch/finally blocks");
    return new Cola.AST_Try({
        body     : body,
        bcatch   : bcatch,
        bfinally : bfinally
    });
};

Cola.Parser.prototype.vardefs = function (no_in, in_const, type, mods) {
    var a = [], was_template = false, last;
    for (;;) {
        was_template = false;
        a.push(last = new Cola.AST_VarDef({
            start : this.S.token,
            type  : type,
            name  : (function(_this){
                if(!_this.is_js) return _this.subscripts(_this.as_symbol(in_const ? Cola.AST_SymbolConst : Cola.AST_SymbolVar), false);
                //_this.dumpS();
                //console.log(_this.subscripts(_this.as_symbol(in_const ? Cola.AST_SymbolConst : Cola.AST_SymbolVar), true));
                //_this.restoreS();
                //was_template = !_this.is_js && ( _this.is("punc","[") || _this.is("punc","{") );
                //if (!_this.is_js && _this.is("punc","[")) return _this.array_(true, true);
                //if (!_this.is_js && _this.is("punc","{")) return _this.object_(true, true);
                return _this.as_symbol(in_const ? Cola.AST_SymbolConst : Cola.AST_SymbolVar);
            })(this),
            value : this.is("operator", "=") ? (this.next(), this.expression(false, no_in)) : ( was_template ? this.expect_token("operator","=") : null ),
            end   : this.prev()
        }));

        if (mods && mods.indexOf("const") != -1 && !last.value)
            this.token_error(last.start, "`const` prop can't have `undefined` value");

        if (mods && mods.indexOf("covert") != -1 && last.name instanceof Cola.AST_Symbol && !this.S.in_class)
            this.token_error(last.start, "Unexpected `covert` modificator.");

        if (mods && mods.indexOf("static") != -1 && (!(last.name instanceof Cola.AST_Symbol) || !this.S.in_class))
            this.token_error(last.start, "Unexpected `static` modificator.");

        if (mods && mods.indexOf("export") != -1 && (!(last.name instanceof Cola.AST_Symbol) || this.S.in_class))
            this.token_error(last.start, "Unexpected `export` modificator.");

        if (mods && mods.indexOf("async") != -1)
            this.token_error(last.start, "Unexpected `async` modificator.");

        if (!this.is("punc", ","))
            break;
        this.next();
    }
    return a;
};

Cola.Parser.prototype.var_ = function(no_in, type, mods) {
    (!type || type == "var") && (type = "dynamic");
    return new Cola.AST_Var({
        start       : this.prev(),
        definitions : this.vardefs(no_in, false, type, mods),
        mods        : mods,
        type        : type,
        end         : this.prev()
    });
};

Cola.Parser.prototype.const_ = function() {
    return new Cola.AST_Const({
        start       : this.prev(),
        definitions : this.vardefs(false, true),
        end         : this.prev()
    });
};

Cola.Parser.prototype.new_ = function() {
    var start = this.S.token;
    this.expect_token("operator", "new");
    var newexp = this.expr_atom(false), args;
    if (this.is("punc", "(")) {
        this.next();
        args = this.expr_list(")", false, false, !this.is_js);
    } else {
        args = [];
    }
    return this.subscripts(new Cola.AST_New({
        start      : start,
        expression : newexp,
        args       : args,
        end        : this.prev()
    }), true);
};

Cola.Parser.prototype.string_template_ = function (start_token) {
    var body = [new Cola.AST_String({ start: start_token, end: start_token, value: start_token.value })];
    this.next();

    while (this.is('punc', '@') || this.is('punc', '@{') || this.is('punc', '{{') || this.is('string', null))
        if (this.is('string', null)) {
            body.push(new Cola.AST_String({ start: this.S.token, end: this.S.token, value: this.S.token.value }));
            this.next();
        } else

        if (this.is('punc', '@')) {
            this.next();
            body.push(this._make_symbol(Cola.AST_SymbolRef));
            this.next();
        } else 

        if (this.is('punc', '@{')) {
            this.next();
            body.push(this.expression(true));
            this.expect('}');
        } else 
        
        if (this.is('punc', '{{')) {
            this.next();
            body.push(this.expression(true));
            this.expect('}}');
        }

    var last = body[body.length - 1];
    body[0].value = body[0].value.replace(/^[ \t]*[\n\r]/,'');
    if (last instanceof Cola.AST_String) {
        var offstr = last.value.match(/[\n\r][ \t]*$/);
        if(offstr){
            offstr = offstr[0];
            for(var i in body) if(body[i] instanceof Cola.AST_String){
                body[i].value = body[i].value.replace(new RegExp(offstr, 'g'), '\n');
                body[i].value = body[i].value.replace(/\n/g, '\n');
            }
            last.value = last.value.replace(/[\n\r]$/,'');
        }
    }

    if (body.length == 1) return body[0];
    return new Cola.AST_StringTemplate({
        start : start_token,
        end   : this.prev(),
        body  : body
    });
}

Cola.Parser.prototype.as_atom_node = function () {
    var tok = this.S.token, ret;
    switch (tok.type) {
      case "name":
      case "keyword":
        ret = this._make_symbol(Cola.AST_SymbolRef);
        break;
      case "num":
        ret = new Cola.AST_Number({ start: tok, end: tok, value: tok.value });
        break;
      case "string":
        if(this.is_js){
            ret = new Cola.AST_String({ start: tok, end: tok, value: tok.value });
            break;
        } else return this.string_template_(tok);
      case "regexp":
        ret = new Cola.AST_RegExp({ start: tok, end: tok, value: tok.value });
        break;
      case "atom":
        if(!this.is_js) switch (tok.value) {
          case "off": case "no":  
            ret = new Cola.AST_False({ start: tok, end: tok });
            break;
          case "on": case "yes":
            ret = new Cola.AST_True({ start: tok, end: tok });
            break;
        }
        switch (tok.value) {
          case "false":
            ret = new Cola.AST_False({ start: tok, end: tok });
            break;
          case "true":
            ret = new Cola.AST_True({ start: tok, end: tok });
            break;
          case "null":
            ret = new Cola.AST_Null({ start: tok, end: tok });
            break;
        }
        break;
    }
    this.next();
    return ret;
};

Cola.Parser.prototype.expr_atom = function(allow_calls) {
    if (this.is("operator", "new")) {
        return this.new_();
    }
    var type, start = this.S.token;
    if (this.is("punc")) {
        switch (start.value) {
          case "(":
            if(!this.is_js){
                var _this = this, balance = 1, isfun = false;
                this.dumpS();
            
                    this.next();
                    this.next_until(function(){
                        if(_this.is('punc', '(')) balance++;
                        else if(_this.is('punc', ')')) balance--;

                        return balance == 0 || _this.is('eof');
                    });
                    isfun = (this.next(), (this.is('punc','{') || this.is('punc','=>')));

                this.restoreS();
                if(isfun) return this.function_(Cola.AST_Function);
            }

            this.next();
            var ex = this.expression(true);
            ex.start = start;
            ex.end = this.S.token;
            this.expect(")");
            return this.subscripts(ex, allow_calls);
          case "[":
            return this.subscripts(this.array_(), allow_calls);
          case "{":
            return this.subscripts(this.object_(), allow_calls);
        }
        this.unexpected();
    }
    if (!this.is_js && this.is("name")) {
        if(this.next_is("name")){
            var isfun = false;
            this.dumpS();
                type = this.S.token.value, this.next();

                this.subscripts(this.as_symbol(Cola.AST_SymbolLambda), false);
                isfun = this.is("punc", "(");
            this.restoreS();

            if(isfun) return this.function_(Cola.AST_Function, type);
        }

        var _this = this, balance = 1, isfun = false;
        this.dumpS();
            
            this.subscripts(this.as_symbol(Cola.AST_SymbolLambda), false);
            if(this.is('punc', '(')){
                this.next();
                this.next_until(function(){
                    if(_this.is('punc', '(')) balance++;
                    else if(_this.is('punc', ')')) balance--;

                    return balance == 0 || _this.is('eof');
                });
                isfun = (this.next(), (this.is('punc','{') || this.is('punc','=>')));
            }

        this.restoreS();
        if(isfun) return this.function_(Cola.AST_Function);
    }
    if (this.is("keyword", "function")) {
        this.next();
        var func = this.function_(Cola.AST_Function);
        func.start = start;
        func.end = this.prev();
        return this.subscripts(func, allow_calls);
    }
    if (this.is("keyword", "if") && !this.is_js) {
        this.next();
        var f = this.if_(true), s = f;

        /*while (true) {
            if (s.body instanceof Cola.AST_BlockStatement && s.body.body.length != 1 || 
                !(s.body instanceof Cola.AST_BlockStatement) && !(s.body instanceof Cola.AST_SimpleStatement)) this.unexpected(s.body.start);

            if (s.alternative instanceof Cola.AST_If) s = f;
            else if (s.alternative == null) break;
            else {
                if (s.alternative instanceof Cola.AST_BlockStatement && s.alternative.body.length != 1 || 
                    !(s.alternative instanceof Cola.AST_BlockStatement) && !(s.alternative instanceof Cola.AST_SimpleStatement)) this.unexpected(s.alternative.start);
                break;
            }
        }*/

        return f;
    }
    if (this.is("keyword", "switch") && !this.is_js) {
        this.next();
        var swtch = {
            start      : start,
            expression : this.is('punc', '{') ? new Cola.AST_Noop() : this.parenthesised(),
            body       : this.in_loop(this.switch_body_),
            end        : this.prev()
        }, _this = this;

        swtch.body.forEach(function(branch){
            if (branch.body.length != 1 || !(branch.body[0] instanceof Cola.AST_SimpleStatement)) _this.unexpected(branch.start);
        });

        return new Cola.AST_Switch(swtch);
    }
    if (Cola.ATOMIC_START_TOKEN[this.S.token.type]) {
        return this.subscripts(this.as_atom_node(), allow_calls);
    }
    this.unexpected();
};

Cola.Parser.prototype.expr_list = function (closing, allow_trailing_comma, allow_empty, allow_named_args) {
    var first = true, a = [], name;
    while (!this.is("punc", closing)) {
        if (first) first = false; else this.expect(",");
        if (allow_trailing_comma && this.is("punc", closing)) break;
        if (this.is("punc", ",") && allow_empty) {
            a.push(new Cola.AST_Hole({ start: this.S.token, end: this.S.token }));
        } else
        if(this.is("name") && allow_named_args){
            name = this.S.token.clone();
            this.dumpS();
            this.next();
            if(this.is("punc",":")){
                this.restoreS(true);
                this.next();
                a.push(new Cola.AST_Namedarg({
                    name  : name.value,
                    value : this.expression(false),
                    start : name,
                    end   : this.prev()
                }));
            } else {
                this.restoreS();
                a.push(this.expression(false))
            }
        } else a.push(this.expression(false));
    }
    this.next();
    return a;
};

Cola.Parser.prototype.array_ = Cola.Parser.embed_tokens(function(is_template, is_var, with_vardef) {
    this.expect("[");
    
    if(!this.is_js && !this.is("punc","]") && !this.is("punc",",") && !(this.is("name") && this.next_is("name"))){
        this.dumpS();
            var tmp, from = this.expression(false, false, true), triple;
            if((this.is("punc","..") || this.is("punc","...")) && !this.next_is("punc", ",") && !this.next_is("punc", "]")){
                triple = this.is("punc","...");
                this.next();
                return new Cola.AST_ArrayRange({
                    from   : from,
                    to     : (tmp = this.expression(true, false, true), this.expect("]"), tmp),
                    triple : triple,
                    start  : from.start,
                    end    : this.prev()
                });
            }
        this.restoreS();
    }
    
    if(this.is_js) return new Cola.AST_Array({
        elements: this.expr_list("]", !this.options.strict, true)
    });

    var is_array = ( is_template ? false : null ), vardef = false, first = true, a = [], val, skiped = false;
    while (!this.is("punc", "]")) {
        if (first) first = false; else this.expect(",");
        
        if (this.is("punc", ",") || this.is("punc", "]")) {
            a.push(new Cola.AST_Hole({ start: this.S.token, end: this.S.token }));
            if (!this.options.strict && this.is("punc", "]")) break;
        } else
        if (this.is("punc", "...") && is_array !== true) { 
            if (skiped) this.unexpected();
            this.next();
            skiped = true;
            is_array = false;
            a.push(new Cola.AST_Noop());
        } else
        if (!is_var && with_vardef && this.is("name") && this.next_is("name") && (!Cola.cKEYWORDS(this.peek().value) || this.peek().value == "var")) {
            if (is_array === true) this.unexpected();
            is_array = false;
            vardef = true;
            a.push(new Cola.AST_VarDef({
                start : this.S.token,
                type  : this.S.token.value == "var" ? "dynamic" : this.S.token.value,
                name  : (function(_this){
                    _this.next();
                    val = _this.as_symbol(Cola.AST_SymbolVar);
                    if (_this.is("punc", "...") && is_array !== true) {
                        if (skiped) _this.unexpected();
                        _this.next();
                        skiped = true;
                        is_array = false;
                        val.splated = true;
                    }
                    return val;
                })(this),
                value : null,
                end   : this.prev()
            }))
        } else {
            if (is_array === false && this.is("punc","[")) val = this.array_(true, is_var);
            else if (is_array === false && this.is("punc","{")) val = this.object_(true, is_var);
            else val = this.expression(false);

            if (val.vardef) vardef = true;
            if (this.is("punc", "...") && is_array !== true) {
                if (skiped) this.unexpected();
                this.next();
                skiped = true;
                is_array = false;
                val.splated = true;
            }

            if (val instanceof Cola.AST_ObjectTemplate || val instanceof Cola.AST_ArrayTemplate) {
                if (is_array === true) this.unexpected();
                is_array = false;
            }
            if (!(val instanceof Cola.AST_SymbolRef || 
                val instanceof Cola.AST_ObjectTemplate || val instanceof Cola.AST_ArrayTemplate || 
                !is_var && ( val instanceof Cola.AST_PropAccess ) ||
                val instanceof Cola.AST_Object && val.template == true ||
                val instanceof Cola.AST_Array && val.template == true)) {

                if (is_array === false) this.unexpected();
                is_array = true;
            }
            a.push(val);
        }
    }
    this.next();

    return is_array === true || is_array === null 
        ? new Cola.AST_Array({ elements: a, template: is_array === null, vardef : vardef })
        : new Cola.AST_ArrayTemplate({ elements: a, vardef : vardef });
});

Cola.Parser.prototype.object_ = Cola.Parser.embed_tokens(function(is_template, is_var, with_vardef) {
    this.expect("{");
    var first = true, a = [], ptype, is_object = ( is_template ? false : null ), vardef = false, val;
    while (!this.is("punc", "}")) {
        if (first) first = false; else this.expect(",");
        if (!this.options.strict && this.is("punc", "}"))
            // allow trailing comma
            break;
        var start = this.S.token;
        var type = start.type;
        var name = this.as_property_name();
        if (!this.is_js && !is_var && with_vardef && this.is("name") && !this.next_is("punc", "(") && (!Cola.cKEYWORDS(name) || name == "var")) {
            vardef = true;
            ptype = name == "var" ? "dynamic" : name;
            name = this.as_name();
        } else ptype = false;
        if ((type == "name" || !this.is_js && type == "keyword") && !this.is("punc", ":")) {
            if (name == "get") {
                if (!this.is_js && is_object === false) this.unexpected();
                is_object = true;
                a.push(new Cola.AST_ObjectGetter({
                    start : start,
                    type  : ptype,
                    key   : this.as_atom_node(),
                    value : this.function_(Cola.AST_Accessor),
                    end   : this.prev()
                }));
                continue;
            }
            if (name == "set") {
                if (!this.is_js && is_object === false) this.unexpected();
                is_object = true;
                a.push(new Cola.AST_ObjectSetter({
                    start : start,
                    type  : ptype,
                    key   : this.as_atom_node(),
                    value : this.function_(Cola.AST_Accessor),
                    end   : this.prev()
                }));
                continue;
            }
        }
        if (!this.is_js && !this.is("punc",":")) {
            //if (is_object === true) this.unexpected();
            //is_object = false;
            val = new Cola.AST_SymbolRef({ name : name });
        } else {
            this.expect(":");

            if (is_object === false && this.is("punc","[")) val = this.array_(true, is_var);
            else if (is_object === false && this.is("punc","{")) val = this.object_(true, is_var);
            else val = this.expression(false);

            if (ptype && !(val instanceof Cola.AST_SymbolRef)) this.unexpected(val.start);
            if (val.vardef) vardef = true;

            if (val instanceof Cola.AST_ObjectTemplate || val instanceof Cola.AST_ArrayTemplate) {
                if (is_object === true || ptype) this.unexpected();
                is_object = false;
            }
            if (!(val instanceof Cola.AST_SymbolRef || 
                val instanceof Cola.AST_ObjectTemplate || val instanceof Cola.AST_ArrayTemplate || 
                !is_var && ( val instanceof Cola.AST_PropAccess ) ||
                val instanceof Cola.AST_Object && val.template == true ||
                val instanceof Cola.AST_Array && val.template == true)) {

                if (is_object === false) this.unexpected();
                is_object = true;
            }
        }
        a.push(new Cola.AST_ObjectKeyVal({
            start : start,
            type  : ptype,
            key   : name,
            value : val,
            end   : this.prev()
        }));
    }
    this.next();

    return is_object === true || is_object === null 
        ? new Cola.AST_Object({ properties: a, template: is_object === null, vardef : vardef })
        : new Cola.AST_ObjectTemplate({ properties: a, vardef : vardef });
});

Cola.Parser.prototype.as_property_name = function () {
    var tmp = this.S.token;
    this.next();
    switch (tmp.type) {
      case "num":
      case "string":
      case "name":
      case "operator":
      case "keyword":
      case "atom":
        return tmp.value;
      default:
        this.unexpected();
    }
};

Cola.Parser.prototype.as_name = function () {
    var tmp = this.S.token;
    this.next();
    switch (tmp.type) {
      case "name":
      case "operator":
      case "keyword":
      case "atom":
        return tmp.value;
      default:
        this.unexpected();
    }
};

Cola.Parser.prototype._make_symbol = function (type) {
    var name = this.S.token.value;
    return new (name == "this" ? Cola.AST_This : type)({
        name  : String(name),
        start : this.S.token,
        end   : this.S.token
    });
};

Cola.Parser.prototype.as_symbol = function (type, noerror) {
    if (!this.is("name")) {
        if (!noerror) this.croak("Name expected");
        return null;
    }
    var sym = this._make_symbol(type);
    this.next();
    return sym;
};

Cola.Parser.prototype.subscripts = function(expr, allow_calls) {
    var start = expr.start;
    if (this.is("punc", ".")) {
        this.next();
        return this.subscripts(new Cola.AST_Dot({
            start      : start,
            expression : expr,
            property   : this.as_name(),
            end        : this.prev()
        }), allow_calls);
    }
    if (this.is("punc", "::") && !this.is_js) {
        this.next();
        return this.subscripts(new Cola.AST_Proto({
            start      : start,
            expression : expr,
            property   : this.as_name(),
            end        : this.prev()
        }), allow_calls);
    }
    if (this.is("punc", "?.") && !this.is_js) {
        this.next();
        return this.subscripts(new Cola.AST_CondAccess({
            start      : start,
            expression : expr,
            property   : this.as_name(),
            end        : this.prev()
        }), allow_calls);
    }
    if (this.is("punc", "[")) {
        this.next();

        var prop, triple;
        if(this.is_js) prop = this.expression(true);
        else if(this.is("punc", "]")) prop = new Cola.AST_Noop();
        else {
            if(this.is("punc", "..") || this.is("punc", "...")) 
                prop = new Cola.AST_Number({ value : 0 });
            else if(this.is("operator", "%")) 
                prop = new Cola.AST_UnaryPrefix({ operator : "%", expression : (this.next(), this.expression(true, false, false)) });
            else 
                prop = this.expression(true, false, true);
            
            if(!(prop instanceof Cola.AST_UnaryPostfix && prop.operator == "%") && (this.is("punc", "..") || this.is("punc", "..."))){
                triple = this.is("punc", "...");
                this.next();
                prop = new Cola.AST_ArrayRange({
                    from   : prop,
                    to     : ( this.is("punc", "]") ? new Cola.AST_Noop() : this.expression(true, false, true) ),
                    triple : triple,
                    start  : prop.start,
                    end    : this.prev()
                });
            }
        }

        this.expect("]");
        return this.subscripts(new Cola.AST_Sub({
            start      : start,
            expression : expr,
            property   : prop,
            end        : this.prev()
        }), allow_calls);
    }
    if (allow_calls && this.is("punc", "(")) {
        this.next();

        var _this = this;
        return this.subscripts(new Cola.AST_Call({
            start      : start,
            expression : expr,
            args       : (function(args){
                    if (expr instanceof Cola.AST_Symbol && expr.name == "require" && args[0] instanceof Cola.AST_String)
                        Cola.push_uniq(_this.requiredModules, args[0].value);
                    return args;
                })(this.expr_list(")", false, false, !this.is_js)),
            end        : this.prev()
        }), true);
    }
    return expr;
};

Cola.Parser.prototype.maybe_unary = function(allow_calls) {
    var start = this.S.token;
    if (this.is("operator") && this.UNARY_PREFIX(start.value)) {
        this.next();
        this.handle_regexp();
        var ex = this.make_unary(Cola.AST_UnaryPrefix, start.value, this.maybe_unary(allow_calls));
        ex.start = start;
        ex.end = this.prev();
        return ex;
    }
    var val = this.expr_atom(allow_calls);

    while (this.is("operator") && this.UNARY_POSTFIX(this.S.token.value) && !this.S.token.nlb) {
        if(!this.is_js && this.is("operator", "?") && 
           !(this.next_is("punc", ";") || this.next_is("punc", ",") || this.next_is("punc", ":") || 
           this.next_is("punc", ")") || this.next_is("punc", "]") || this.next_is("punc", "}") ||
           this.next_is("operator", "?") || this.next_is("operator") && this.PRECEDENCE[this.peek().value])) break;

        val = this.make_unary(Cola.AST_UnaryPostfix, this.S.token.value, val);
        val.start = start;
        val.end = this.S.token;
        this.next();
    }
    return val;
};

Cola.Parser.prototype.make_unary = function (ctor, op, expr) {
    if ((op == "++" || op == "--") && !this.is_assignable(expr))
        this.croak("Invalid use of " + op + " operator");
    return new ctor({ operator: op, expression: expr });
};

/*
    a <= b < c == d
    
    as

    (((a <= b) && (b < c)) && c == d)

*/
Cola.Parser.prototype.expr_op = function(left, min_prec, no_in, is_comp, rightest) {
    var op = this.is("operator") ? this.S.token.value : null, cop = Cola.COMPARISON(op);
    if ((op == "in" || op == "of") && no_in) op = null;
    var prec = op != null ? this.PRECEDENCE[op] : null;
    if (!this.is_js && is_comp && cop) {
        this.next();
        var right = this.maybe_unary(true); 
        return this.expr_op(new Cola.AST_Binary({
            start    : left.start,
            left     : left,
            operator : "&&",
            right    : new Cola.AST_Binary({
                start    : rightest.start,
                left     : rightest,
                operator : op,
                right    : right,
                end      : right.end
            }),
            end      : right.end
        }), min_prec, no_in, true, right);
    }
    if (prec != null && prec > min_prec) {
        this.next();
        var right = !this.is_js && cop ? this.maybe_unary(true) : this.expr_op(this.maybe_unary(true), prec, no_in);
        return this.expr_op(new Cola.AST_Binary({
            start    : left.start,
            left     : left,
            operator : op,
            right    : right,
            end      : right.end
        }), min_prec, no_in, cop, right);
    }
    return left;
};

Cola.Parser.prototype.expr_ops = function (no_in) {
    return this.expr_op(this.maybe_unary(true), 0, no_in);
};

Cola.Parser.prototype.maybe_conditional = function(no_in) {
    var start = this.S.token;
    var expr = this.expr_ops(no_in);

    if (this.is("operator", "?")) {
        this.next();

        /*if(!this.is_js && (this.is("punc", ";") || this.is("punc", ",") || this.is("punc", ":") || 
           this.is("punc", ")") || this.is("punc", "]") || this.is("punc", "}") ||
           this.is("operator", "?") || this.PRECEDENCE[this.S.token.value]))
            return new Cola.AST_UnaryPostfix({
                operator   : "?",
                expression : expr
            });*/

        var yes = this.expression(false);

        return new Cola.AST_Conditional({
            start       : start,
            condition   : expr,
            consequent  : yes,
            alternative : this.is_js || this.is('punc',':') ? (this.expect(":"), this.expression(false, no_in)) : new Cola.AST_Noop(),
            end         : this.prev()
        });
    }
    return expr;
};

Cola.Parser.prototype.is_assignable = function (expr) {
    if (!this.options.strict) return true;
    if (expr instanceof Cola.AST_This) return false;
    return (expr instanceof Cola.AST_PropAccess || expr instanceof Cola.AST_Symbol);
};

Cola.Parser.prototype.maybe_assign = function(no_in) {
    var start = this.S.token;
    var left = this.maybe_conditional(no_in), val = this.S.token.value;
    if (this.is("operator") && this.ASSIGNMENT(val)) {
        if (this.is_assignable(left)) {
            this.next();
            return new Cola.AST_Assign({
                start    : start,
                left     : left,
                operator : val,
                right    : this.maybe_assign(no_in),
                end      : this.prev()
            });
        }
        this.croak("Invalid assignment");
    }
    return left;
};

Cola.Parser.prototype.cascade = function(expr, start) {
    var last, props = {
        start          : start,
        expression     : expr,
        subexpressions : []
    };
    while (this.next()) {
        if (this.is("name") || this.is("punc","[")) {
            last = this.expression(false, false, true);

            if (this.is("punc", ":")) {
                last = this.cascade(last, last.start);
                this.next();
            }
            props.subexpressions.push(last);
            if (!( last instanceof Cola.AST_SymbolRef 
                || last instanceof Cola.AST_Binary 
                || last instanceof Cola.AST_Call
                || last instanceof Cola.AST_PropAccess
                || last instanceof Cola.AST_Array 
                )) this.unexpected(last.start);
        }
        if (!this.is("punc", "..")) break;
    }
    props.end = this.S.token;
    return new Cola.AST_Cascade(props);
};

Cola.Parser.prototype.expression = function(commas, no_in, in_dd) {
    var start = this.S.token;
    var expr = this.maybe_assign(no_in);
    if (!in_dd && !this.is_js && this.is("punc", "..")) return this.cascade(expr, start);
    if (commas && this.is("punc", ",")) {
        if (expr instanceof Cola.AST_Assign && (expr.left instanceof Cola.AST_ArrayTemplate || expr.left instanceof Cola.AST_ObjectTemplate ||
           (expr.left instanceof Cola.AST_Array || expr.left instanceof Cola.AST_Object) && expr.left.template) && expr.left.vardef) this.unexpected();
        this.next();
        return new Cola.AST_Seq({
            start  : start,
            car    : expr,
            cdr    : this.expression(true, no_in),
            end    : this.peek()
        });
    }
    return expr;
};

Cola.Parser.prototype.in_loop = function (cont) {
    ++this.S.in_loop;
    var ret = cont.call(this);
    --this.S.in_loop;
    return ret;
};
