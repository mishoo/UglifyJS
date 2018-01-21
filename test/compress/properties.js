keep_properties: {
    options = {
        evaluate: true,
        properties: false,
    }
    input: {
        a["foo"] = "bar";
    }
    expect: {
        a["foo"] = "bar";
    }
}

dot_properties: {
    options = {
        evaluate: true,
        properties: true,
    }
    beautify = {
        ie8: true,
    }
    input: {
        a["foo"] = "bar";
        a["if"] = "if";
        a["*"] = "asterisk";
        a["\u0EB3"] = "unicode";
        a[""] = "whitespace";
        a["1_1"] = "foo";
    }
    expect: {
        a.foo = "bar";
        a["if"] = "if";
        a["*"] = "asterisk";
        a["\u0EB3"] = "unicode";
        a[""] = "whitespace";
        a["1_1"] = "foo";
    }
}

dot_properties_es5: {
    options = {
        evaluate: true,
        properties: true,
    }
    beautify = {
        ie8: false,
    }
    input: {
        a["foo"] = "bar";
        a["if"] = "if";
        a["*"] = "asterisk";
        a["\u0EB3"] = "unicode";
        a[""] = "whitespace";
    }
    expect: {
        a.foo = "bar";
        a.if = "if";
        a["*"] = "asterisk";
        a["\u0EB3"] = "unicode";
        a[""] = "whitespace";
    }
}

sub_properties: {
    options = {
        evaluate: true,
        properties: true,
    }
    input: {
        a[0] = 0;
        a["0"] = 1;
        a[3.14] = 2;
        a["3" + ".14"] = 3;
        a["i" + "f"] = 4;
        a["foo" + " bar"] = 5;
        a[0 / 0] = 6;
        a[null] = 7;
        a[undefined] = 8;
    }
    expect: {
        a[0] = 0;
        a[0] = 1;
        a[3.14] = 2;
        a[3.14] = 3;
        a.if = 4;
        a["foo bar"] = 5;
        a.NaN = 6;
        a.null = 7;
        a[void 0] = 8;
    }
}

evaluate_array_length: {
    options = {
        evaluate: true,
        properties: true,
        unsafe: true,
    }
    input: {
        a = [1, 2, 3].length;
        a = [1, 2, 3].join()["len" + "gth"];
        a = [1, 2, b].length;
        a = [1, 2, 3].join(b).length;
    }
    expect: {
        a = 3;
        a = 5;
        a = [1, 2, b].length;
        a = [1, 2, 3].join(b).length;
    }
}

evaluate_string_length: {
    options = {
        evaluate: true,
        properties: true,
        unsafe: true,
    }
    input: {
        a = "foo".length;
        a = ("foo" + "bar")["len" + "gth"];
        a = b.length;
        a = ("foo" + b).length;
    }
    expect: {
        a = 3;
        a = 6;
        a = b.length;
        a = ("foo" + b).length;
    }
}

mangle_properties: {
    mangle = {
        properties: {
            keep_quoted: false,
        },
    }
    input: {
        a["foo"] = "bar";
        a.color = "red";
        x = {"bar": 10};
        a.run(x.bar, a.foo);
        a['run']({color: "blue", foo: "baz"});
    }
    expect: {
        a["a"] = "bar";
        a.b = "red";
        x = {o: 10};
        a.r(x.o, a.a);
        a['r']({b: "blue", a: "baz"});
    }
}

mangle_unquoted_properties: {
    options = {
        evaluate: true,
        properties: false,
    }
    mangle = {
        properties: {
            builtins: true,
            keep_quoted: true,
        },
    }
    beautify = {
        beautify: false,
        quote_style: 3,
        keep_quoted_props: true,
    }
    input: {
        a.top = 1;
        function f1() {
            a["foo"] = "bar";
            a.color = "red";
            a.stuff = 2;
            x = {"bar": 10, size: 7};
            a.size = 9;
        }
        function f2() {
            a.foo = "bar";
            a['color'] = "red";
            x = {bar: 10, size: 7};
            a.size = 9;
            a.stuff = 3;
        }
    }
    expect: {
        a.a = 1;
        function f1() {
            a["foo"] = "bar";
            a.color = "red";
            a.r = 2;
            x = {"bar": 10, b: 7};
            a.b = 9;
        }
        function f2() {
            a.foo = "bar";
            a['color'] = "red";
            x = {bar: 10, b: 7};
            a.b = 9;
            a.r = 3;
        }
    }
}

mangle_debug: {
    mangle = {
        properties: {
            debug: "",
        },
    }
    input: {
        a.foo = "bar";
        x = { baz: "ban" };
    }
    expect: {
        a._$foo$_ = "bar";
        x = { _$baz$_: "ban" };
    }
}

mangle_debug_true: {
    mangle = {
        properties: {
            debug: true,
        },
    }
    input: {
        a.foo = "bar";
        x = { baz: "ban" };
    }
    expect: {
        a._$foo$_ = "bar";
        x = { _$baz$_: "ban" };
    }
}

mangle_debug_suffix: {
    mangle = {
        properties: {
            debug: "XYZ",
        },
    }
    input: {
        a.foo = "bar";
        x = { baz: "ban" };
    }
    expect: {
        a._$foo$XYZ_ = "bar";
        x = { _$baz$XYZ_: "ban" };
    }
}

mangle_debug_suffix_keep_quoted: {
    options = {
        evaluate: true,
        properties: false,
    }
    mangle = {
        properties: {
            builtins: true,
            debug: "XYZ",
            keep_quoted: true,
            reserved: [],
        },
    }
    beautify = {
        beautify: false,
        quote_style: 3,
        keep_quoted_props: true,
    }
    input: {
        a.top = 1;
        function f1() {
            a["foo"] = "bar";
            a.color = "red";
            a.stuff = 2;
            x = {"bar": 10, size: 7};
            a.size = 9;
        }
        function f2() {
            a.foo = "bar";
            a['color'] = "red";
            x = {bar: 10, size: 7};
            a.size = 9;
            a.stuff = 3;
        }
    }
    expect: {
        a._$top$XYZ_ = 1;
        function f1() {
            a["foo"] = "bar";
            a.color = "red";
            a._$stuff$XYZ_ = 2;
            x = {"bar": 10, _$size$XYZ_: 7};
            a._$size$XYZ_ = 9;
        }
        function f2() {
            a.foo = "bar";
            a['color'] = "red";
            x = {bar: 10, _$size$XYZ_: 7};
            a._$size$XYZ_ = 9;
            a._$stuff$XYZ_ = 3;
        }
    }
}

first_256_chars_as_properties: {
    beautify = {
        ascii_only: true,
    }
    input: {
        // Note: some of these unicode character keys are not visible on github.com
        var o = {
            "\0":0,"":1,"":2,"":3,"":4,"":5,"":6,"":7,"\b":8,
            "\t":9,"\n":10,"\v":11,"\f":12,"\r":13,"":14,"":15,"":16,"":17,
            "":18,"":19,"":20,"":21,"":22,"":23,"":24,"":25,"":26,
            "":27,"":28,"":29,"":30,"":31," ":32,"!":33,'"':34,"#":35,
            $:36,"%":37,"&":38,"'":39,"(":40,")":41,"*":42,"+":43,",":44,
            "-":45,".":46,"/":47,"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,
            "8":56,"9":57,":":58,";":59,"<":60,"=":61,">":62,"?":63,"@":64,A:65,
            B:66,C:67,D:68,E:69,F:70,G:71,H:72,I:73,J:74,K:75,L:76,M:77,N:78,
            O:79,P:80,Q:81,R:82,S:83,T:84,U:85,V:86,W:87,X:88,Y:89,Z:90,"[":91,
            "\\":92,"]":93,"^":94,_:95,"`":96,a:97,b:98,c:99,d:100,e:101,
            f:102,g:103,h:104,i:105,j:106,k:107,l:108,m:109,n:110,o:111,p:112,
            q:113,r:114,s:115,t:116,u:117,v:118,w:119,x:120,y:121,z:122,"{":123,
            "|":124,"}":125,"~":126,"":127,"":128,"":129,"":130,"":131,
            "":132,"":133,"":134,"":135,"":136,"":137,"":138,"":139,
            "":140,"":141,"":142,"":143,"":144,"":145,"":146,"":147,
            "":148,"":149,"":150,"":151,"":152,"":153,"":154,"":155,
            "":156,"":157,"":158,"":159," ":160,"¡":161,"¢":162,"£":163,
            "¤":164,"¥":165,"¦":166,"§":167,"¨":168,"©":169,"ª":170,"«":171,
            "¬":172,"­":173,"®":174,"¯":175,"°":176,"±":177,"²":178,"³":179,
            "´":180,"µ":181,"¶":182,"·":183,"¸":184,"¹":185,"º":186,"»":187,
            "¼":188,"½":189,"¾":190,"¿":191,"À":192,"Á":193,"Â":194,"Ã":195,
            "Ä":196,"Å":197,"Æ":198,"Ç":199,"È":200,"É":201,"Ê":202,"Ë":203,
            "Ì":204,"Í":205,"Î":206,"Ï":207,"Ð":208,"Ñ":209,"Ò":210,"Ó":211,
            "Ô":212,"Õ":213,"Ö":214,"×":215,"Ø":216,"Ù":217,"Ú":218,"Û":219,
            "Ü":220,"Ý":221,"Þ":222,"ß":223,"à":224,"á":225,"â":226,"ã":227,
            "ä":228,"å":229,"æ":230,"ç":231,"è":232,"é":233,"ê":234,"ë":235,
            "ì":236,"í":237,"î":238,"ï":239,"ð":240,"ñ":241,"ò":242,"ó":243,
            "ô":244,"õ":245,"ö":246,"÷":247,"ø":248,"ù":249,"ú":250,"û":251,
            "ü":252,"ý":253,"þ":254,"ÿ":255
        };
    }
    expect: {
        var o = {
            "\0":0,"\x01":1,"\x02":2,"\x03":3,"\x04":4,"\x05":5,"\x06":6,
            "\x07":7,"\b":8,"\t":9,"\n":10,"\v":11,"\f":12,"\r":13,"\x0e":14,
            "\x0f":15,"\x10":16,"\x11":17,"\x12":18,"\x13":19,"\x14":20,"\x15":21,
            "\x16":22,"\x17":23,"\x18":24,"\x19":25,"\x1a":26,"\x1b":27,"\x1c":28,
            "\x1d":29,"\x1e":30,"\x1f":31," ":32,"!":33,'"':34,"#":35,$:36,
            "%":37,"&":38,"'":39,"(":40,")":41,"*":42,"+":43,",":44,"-":45,
            ".":46,"/":47,0:48,1:49,2:50,3:51,4:52,5:53,6:54,7:55,8:56,9:57,
            ":":58,";":59,"<":60,"=":61,">":62,"?":63,"@":64,A:65,B:66,C:67,
            D:68,E:69,F:70,G:71,H:72,I:73,J:74,K:75,L:76,M:77,N:78,O:79,P:80,
            Q:81,R:82,S:83,T:84,U:85,V:86,W:87,X:88,Y:89,Z:90,"[":91,"\\":92,
            "]":93,"^":94,_:95,"`":96,a:97,b:98,c:99,d:100,e:101,f:102,g:103,
            h:104,i:105,j:106,k:107,l:108,m:109,n:110,o:111,p:112,q:113,r:114,
            s:115,t:116,u:117,v:118,w:119,x:120,y:121,z:122,"{":123,"|":124,
            "}":125,"~":126,"\x7f":127,"\x80":128,"\x81":129,"\x82":130,"\x83":131,
            "\x84":132,"\x85":133,"\x86":134,"\x87":135,"\x88":136,"\x89":137,
            "\x8a":138,"\x8b":139,"\x8c":140,"\x8d":141,"\x8e":142,"\x8f":143,
            "\x90":144,"\x91":145,"\x92":146,"\x93":147,"\x94":148,"\x95":149,
            "\x96":150,"\x97":151,"\x98":152,"\x99":153,"\x9a":154,"\x9b":155,
            "\x9c":156,"\x9d":157,"\x9e":158,"\x9f":159,"\xa0":160,"\xa1":161,
            "\xa2":162,"\xa3":163,"\xa4":164,"\xa5":165,"\xa6":166,"\xa7":167,
            "\xa8":168,"\xa9":169,"\xaa":170,"\xab":171,"\xac":172,"\xad":173,
            "\xae":174,"\xaf":175,"\xb0":176,"\xb1":177,"\xb2":178,"\xb3":179,
            "\xb4":180,"\xb5":181,"\xb6":182,"\xb7":183,"\xb8":184,"\xb9":185,
            "\xba":186,"\xbb":187,"\xbc":188,"\xbd":189,"\xbe":190,"\xbf":191,
            "\xc0":192,"\xc1":193,"\xc2":194,"\xc3":195,"\xc4":196,"\xc5":197,
            "\xc6":198,"\xc7":199,"\xc8":200,"\xc9":201,"\xca":202,"\xcb":203,
            "\xcc":204,"\xcd":205,"\xce":206,"\xcf":207,"\xd0":208,"\xd1":209,
            "\xd2":210,"\xd3":211,"\xd4":212,"\xd5":213,"\xd6":214,"\xd7":215,
            "\xd8":216,"\xd9":217,"\xda":218,"\xdb":219,"\xdc":220,"\xdd":221,
            "\xde":222,"\xdf":223,"\xe0":224,"\xe1":225,"\xe2":226,"\xe3":227,
            "\xe4":228,"\xe5":229,"\xe6":230,"\xe7":231,"\xe8":232,"\xe9":233,
            "\xea":234,"\xeb":235,"\xec":236,"\xed":237,"\xee":238,"\xef":239,
            "\xf0":240,"\xf1":241,"\xf2":242,"\xf3":243,"\xf4":244,"\xf5":245,
            "\xf6":246,"\xf7":247,"\xf8":248,"\xf9":249,"\xfa":250,"\xfb":251,
            "\xfc":252,"\xfd":253,"\xfe":254,"\xff":255
        };
    }
}

first_256_unicode_chars_as_properties: {
    input: {
        var o = {
            "\u0000":   0, "\u0001":   1, "\u0002":   2, "\u0003":   3, "\u0004":   4, "\u0005":   5,
            "\u0006":   6, "\u0007":   7, "\u0008":   8, "\u0009":   9, "\u000A":  10, "\u000B":  11,
            "\u000C":  12, "\u000D":  13, "\u000E":  14, "\u000F":  15, "\u0010":  16, "\u0011":  17,
            "\u0012":  18, "\u0013":  19, "\u0014":  20, "\u0015":  21, "\u0016":  22, "\u0017":  23,
            "\u0018":  24, "\u0019":  25, "\u001A":  26, "\u001B":  27, "\u001C":  28, "\u001D":  29,
            "\u001E":  30, "\u001F":  31, "\u0020":  32, "\u0021":  33, "\u0022":  34, "\u0023":  35,
            "\u0024":  36, "\u0025":  37, "\u0026":  38, "\u0027":  39, "\u0028":  40, "\u0029":  41,
            "\u002A":  42, "\u002B":  43, "\u002C":  44, "\u002D":  45, "\u002E":  46, "\u002F":  47,
            "\u0030":  48, "\u0031":  49, "\u0032":  50, "\u0033":  51, "\u0034":  52, "\u0035":  53,
            "\u0036":  54, "\u0037":  55, "\u0038":  56, "\u0039":  57, "\u003A":  58, "\u003B":  59,
            "\u003C":  60, "\u003D":  61, "\u003E":  62, "\u003F":  63, "\u0040":  64, "\u0041":  65,
            "\u0042":  66, "\u0043":  67, "\u0044":  68, "\u0045":  69, "\u0046":  70, "\u0047":  71,
            "\u0048":  72, "\u0049":  73, "\u004A":  74, "\u004B":  75, "\u004C":  76, "\u004D":  77,
            "\u004E":  78, "\u004F":  79, "\u0050":  80, "\u0051":  81, "\u0052":  82, "\u0053":  83,
            "\u0054":  84, "\u0055":  85, "\u0056":  86, "\u0057":  87, "\u0058":  88, "\u0059":  89,
            "\u005A":  90, "\u005B":  91, "\u005C":  92, "\u005D":  93, "\u005E":  94, "\u005F":  95,
            "\u0060":  96, "\u0061":  97, "\u0062":  98, "\u0063":  99, "\u0064": 100, "\u0065": 101,
            "\u0066": 102, "\u0067": 103, "\u0068": 104, "\u0069": 105, "\u006A": 106, "\u006B": 107,
            "\u006C": 108, "\u006D": 109, "\u006E": 110, "\u006F": 111, "\u0070": 112, "\u0071": 113,
            "\u0072": 114, "\u0073": 115, "\u0074": 116, "\u0075": 117, "\u0076": 118, "\u0077": 119,
            "\u0078": 120, "\u0079": 121, "\u007A": 122, "\u007B": 123, "\u007C": 124, "\u007D": 125,
            "\u007E": 126, "\u007F": 127, "\u0080": 128, "\u0081": 129, "\u0082": 130, "\u0083": 131,
            "\u0084": 132, "\u0085": 133, "\u0086": 134, "\u0087": 135, "\u0088": 136, "\u0089": 137,
            "\u008A": 138, "\u008B": 139, "\u008C": 140, "\u008D": 141, "\u008E": 142, "\u008F": 143,
            "\u0090": 144, "\u0091": 145, "\u0092": 146, "\u0093": 147, "\u0094": 148, "\u0095": 149,
            "\u0096": 150, "\u0097": 151, "\u0098": 152, "\u0099": 153, "\u009A": 154, "\u009B": 155,
            "\u009C": 156, "\u009D": 157, "\u009E": 158, "\u009F": 159, "\u00A0": 160, "\u00A1": 161,
            "\u00A2": 162, "\u00A3": 163, "\u00A4": 164, "\u00A5": 165, "\u00A6": 166, "\u00A7": 167,
            "\u00A8": 168, "\u00A9": 169, "\u00AA": 170, "\u00AB": 171, "\u00AC": 172, "\u00AD": 173,
            "\u00AE": 174, "\u00AF": 175, "\u00B0": 176, "\u00B1": 177, "\u00B2": 178, "\u00B3": 179,
            "\u00B4": 180, "\u00B5": 181, "\u00B6": 182, "\u00B7": 183, "\u00B8": 184, "\u00B9": 185,
            "\u00BA": 186, "\u00BB": 187, "\u00BC": 188, "\u00BD": 189, "\u00BE": 190, "\u00BF": 191,
            "\u00C0": 192, "\u00C1": 193, "\u00C2": 194, "\u00C3": 195, "\u00C4": 196, "\u00C5": 197,
            "\u00C6": 198, "\u00C7": 199, "\u00C8": 200, "\u00C9": 201, "\u00CA": 202, "\u00CB": 203,
            "\u00CC": 204, "\u00CD": 205, "\u00CE": 206, "\u00CF": 207, "\u00D0": 208, "\u00D1": 209,
            "\u00D2": 210, "\u00D3": 211, "\u00D4": 212, "\u00D5": 213, "\u00D6": 214, "\u00D7": 215,
            "\u00D8": 216, "\u00D9": 217, "\u00DA": 218, "\u00DB": 219, "\u00DC": 220, "\u00DD": 221,
            "\u00DE": 222, "\u00DF": 223, "\u00E0": 224, "\u00E1": 225, "\u00E2": 226, "\u00E3": 227,
            "\u00E4": 228, "\u00E5": 229, "\u00E6": 230, "\u00E7": 231, "\u00E8": 232, "\u00E9": 233,
            "\u00EA": 234, "\u00EB": 235, "\u00EC": 236, "\u00ED": 237, "\u00EE": 238, "\u00EF": 239,
            "\u00F0": 240, "\u00F1": 241, "\u00F2": 242, "\u00F3": 243, "\u00F4": 244, "\u00F5": 245,
            "\u00F6": 246, "\u00F7": 247, "\u00F8": 248, "\u00F9": 249, "\u00FA": 250, "\u00FB": 251,
            "\u00FC": 252, "\u00FD": 253, "\u00FE": 254, "\u00FF": 255
        };
    }
    expect: {
        var o = {
            "\0":0,"\x01":1,"\x02":2,"\x03":3,"\x04":4,"\x05":5,"\x06":6,
            "\x07":7,"\b":8,"\t":9,"\n":10,"\v":11,"\f":12,"\r":13,"\x0e":14,
            "\x0f":15,"\x10":16,"\x11":17,"\x12":18,"\x13":19,"\x14":20,"\x15":21,
            "\x16":22,"\x17":23,"\x18":24,"\x19":25,"\x1a":26,"\x1b":27,"\x1c":28,
            "\x1d":29,"\x1e":30,"\x1f":31," ":32,"!":33,'"':34,"#":35,$:36,
            "%":37,"&":38,"'":39,"(":40,")":41,"*":42,"+":43,",":44,"-":45,
            ".":46,"/":47,0:48,1:49,2:50,3:51,4:52,5:53,6:54,7:55,8:56,9:57,
            ":":58,";":59,"<":60,"=":61,">":62,"?":63,"@":64,A:65,B:66,C:67,
            D:68,E:69,F:70,G:71,H:72,I:73,J:74,K:75,L:76,M:77,N:78,O:79,P:80,
            Q:81,R:82,S:83,T:84,U:85,V:86,W:87,X:88,Y:89,Z:90,"[":91,"\\":92,
            "]":93,"^":94,_:95,"`":96,a:97,b:98,c:99,d:100,e:101,f:102,g:103,
            h:104,i:105,j:106,k:107,l:108,m:109,n:110,o:111,p:112,q:113,r:114,
            s:115,t:116,u:117,v:118,w:119,x:120,y:121,z:122,"{":123,"|":124,
            "}":125,"~":126,"\x7f":127,"\x80":128,"\x81":129,"\x82":130,"\x83":131,
            "\x84":132,"\x85":133,"\x86":134,"\x87":135,"\x88":136,"\x89":137,
            "\x8a":138,"\x8b":139,"\x8c":140,"\x8d":141,"\x8e":142,"\x8f":143,
            "\x90":144,"\x91":145,"\x92":146,"\x93":147,"\x94":148,"\x95":149,
            "\x96":150,"\x97":151,"\x98":152,"\x99":153,"\x9a":154,"\x9b":155,
            "\x9c":156,"\x9d":157,"\x9e":158,"\x9f":159,"\xa0":160,"\xa1":161,
            "\xa2":162,"\xa3":163,"\xa4":164,"\xa5":165,"\xa6":166,"\xa7":167,
            "\xa8":168,"\xa9":169,"\xaa":170,"\xab":171,"\xac":172,"\xad":173,
            "\xae":174,"\xaf":175,"\xb0":176,"\xb1":177,"\xb2":178,"\xb3":179,
            "\xb4":180,"\xb5":181,"\xb6":182,"\xb7":183,"\xb8":184,"\xb9":185,
            "\xba":186,"\xbb":187,"\xbc":188,"\xbd":189,"\xbe":190,"\xbf":191,
            "\xc0":192,"\xc1":193,"\xc2":194,"\xc3":195,"\xc4":196,"\xc5":197,
            "\xc6":198,"\xc7":199,"\xc8":200,"\xc9":201,"\xca":202,"\xcb":203,
            "\xcc":204,"\xcd":205,"\xce":206,"\xcf":207,"\xd0":208,"\xd1":209,
            "\xd2":210,"\xd3":211,"\xd4":212,"\xd5":213,"\xd6":214,"\xd7":215,
            "\xd8":216,"\xd9":217,"\xda":218,"\xdb":219,"\xdc":220,"\xdd":221,
            "\xde":222,"\xdf":223,"\xe0":224,"\xe1":225,"\xe2":226,"\xe3":227,
            "\xe4":228,"\xe5":229,"\xe6":230,"\xe7":231,"\xe8":232,"\xe9":233,
            "\xea":234,"\xeb":235,"\xec":236,"\xed":237,"\xee":238,"\xef":239,
            "\xf0":240,"\xf1":241,"\xf2":242,"\xf3":243,"\xf4":244,"\xf5":245,
            "\xf6":246,"\xf7":247,"\xf8":248,"\xf9":249,"\xfa":250,"\xfb":251,
            "\xfc":252,"\xfd":253,"\xfe":254,"\xff":255
        };
    }
}

first_256_hex_chars_as_properties: {
    input: {
        var o = {
            "\x00":   0, "\x01":   1, "\x02":   2, "\x03":   3, "\x04":   4, "\x05":   5,
            "\x06":   6, "\x07":   7, "\x08":   8, "\x09":   9, "\x0A":  10, "\x0B":  11,
            "\x0C":  12, "\x0D":  13, "\x0E":  14, "\x0F":  15, "\x10":  16, "\x11":  17,
            "\x12":  18, "\x13":  19, "\x14":  20, "\x15":  21, "\x16":  22, "\x17":  23,
            "\x18":  24, "\x19":  25, "\x1A":  26, "\x1B":  27, "\x1C":  28, "\x1D":  29,
            "\x1E":  30, "\x1F":  31, "\x20":  32, "\x21":  33, "\x22":  34, "\x23":  35,
            "\x24":  36, "\x25":  37, "\x26":  38, "\x27":  39, "\x28":  40, "\x29":  41,
            "\x2A":  42, "\x2B":  43, "\x2C":  44, "\x2D":  45, "\x2E":  46, "\x2F":  47,
            "\x30":  48, "\x31":  49, "\x32":  50, "\x33":  51, "\x34":  52, "\x35":  53,
            "\x36":  54, "\x37":  55, "\x38":  56, "\x39":  57, "\x3A":  58, "\x3B":  59,
            "\x3C":  60, "\x3D":  61, "\x3E":  62, "\x3F":  63, "\x40":  64, "\x41":  65,
            "\x42":  66, "\x43":  67, "\x44":  68, "\x45":  69, "\x46":  70, "\x47":  71,
            "\x48":  72, "\x49":  73, "\x4A":  74, "\x4B":  75, "\x4C":  76, "\x4D":  77,
            "\x4E":  78, "\x4F":  79, "\x50":  80, "\x51":  81, "\x52":  82, "\x53":  83,
            "\x54":  84, "\x55":  85, "\x56":  86, "\x57":  87, "\x58":  88, "\x59":  89,
            "\x5A":  90, "\x5B":  91, "\x5C":  92, "\x5D":  93, "\x5E":  94, "\x5F":  95,
            "\x60":  96, "\x61":  97, "\x62":  98, "\x63":  99, "\x64": 100, "\x65": 101,
            "\x66": 102, "\x67": 103, "\x68": 104, "\x69": 105, "\x6A": 106, "\x6B": 107,
            "\x6C": 108, "\x6D": 109, "\x6E": 110, "\x6F": 111, "\x70": 112, "\x71": 113,
            "\x72": 114, "\x73": 115, "\x74": 116, "\x75": 117, "\x76": 118, "\x77": 119,
            "\x78": 120, "\x79": 121, "\x7A": 122, "\x7B": 123, "\x7C": 124, "\x7D": 125,
            "\x7E": 126, "\x7F": 127, "\x80": 128, "\x81": 129, "\x82": 130, "\x83": 131,
            "\x84": 132, "\x85": 133, "\x86": 134, "\x87": 135, "\x88": 136, "\x89": 137,
            "\x8A": 138, "\x8B": 139, "\x8C": 140, "\x8D": 141, "\x8E": 142, "\x8F": 143,
            "\x90": 144, "\x91": 145, "\x92": 146, "\x93": 147, "\x94": 148, "\x95": 149,
            "\x96": 150, "\x97": 151, "\x98": 152, "\x99": 153, "\x9A": 154, "\x9B": 155,
            "\x9C": 156, "\x9D": 157, "\x9E": 158, "\x9F": 159, "\xA0": 160, "\xA1": 161,
            "\xA2": 162, "\xA3": 163, "\xA4": 164, "\xA5": 165, "\xA6": 166, "\xA7": 167,
            "\xA8": 168, "\xA9": 169, "\xAA": 170, "\xAB": 171, "\xAC": 172, "\xAD": 173,
            "\xAE": 174, "\xAF": 175, "\xB0": 176, "\xB1": 177, "\xB2": 178, "\xB3": 179,
            "\xB4": 180, "\xB5": 181, "\xB6": 182, "\xB7": 183, "\xB8": 184, "\xB9": 185,
            "\xBA": 186, "\xBB": 187, "\xBC": 188, "\xBD": 189, "\xBE": 190, "\xBF": 191,
            "\xC0": 192, "\xC1": 193, "\xC2": 194, "\xC3": 195, "\xC4": 196, "\xC5": 197,
            "\xC6": 198, "\xC7": 199, "\xC8": 200, "\xC9": 201, "\xCA": 202, "\xCB": 203,
            "\xCC": 204, "\xCD": 205, "\xCE": 206, "\xCF": 207, "\xD0": 208, "\xD1": 209,
            "\xD2": 210, "\xD3": 211, "\xD4": 212, "\xD5": 213, "\xD6": 214, "\xD7": 215,
            "\xD8": 216, "\xD9": 217, "\xDA": 218, "\xDB": 219, "\xDC": 220, "\xDD": 221,
            "\xDE": 222, "\xDF": 223, "\xE0": 224, "\xE1": 225, "\xE2": 226, "\xE3": 227,
            "\xE4": 228, "\xE5": 229, "\xE6": 230, "\xE7": 231, "\xE8": 232, "\xE9": 233,
            "\xEA": 234, "\xEB": 235, "\xEC": 236, "\xED": 237, "\xEE": 238, "\xEF": 239,
            "\xF0": 240, "\xF1": 241, "\xF2": 242, "\xF3": 243, "\xF4": 244, "\xF5": 245,
            "\xF6": 246, "\xF7": 247, "\xF8": 248, "\xF9": 249, "\xFA": 250, "\xFB": 251,
            "\xFC": 252, "\xFD": 253, "\xFE": 254, "\xFF": 255
        };
    }
    expect: {
        var o = {
            "\0":0,"\x01":1,"\x02":2,"\x03":3,"\x04":4,"\x05":5,"\x06":6,
            "\x07":7,"\b":8,"\t":9,"\n":10,"\v":11,"\f":12,"\r":13,"\x0e":14,
            "\x0f":15,"\x10":16,"\x11":17,"\x12":18,"\x13":19,"\x14":20,"\x15":21,
            "\x16":22,"\x17":23,"\x18":24,"\x19":25,"\x1a":26,"\x1b":27,"\x1c":28,
            "\x1d":29,"\x1e":30,"\x1f":31," ":32,"!":33,'"':34,"#":35,$:36,
            "%":37,"&":38,"'":39,"(":40,")":41,"*":42,"+":43,",":44,"-":45,
            ".":46,"/":47,0:48,1:49,2:50,3:51,4:52,5:53,6:54,7:55,8:56,9:57,
            ":":58,";":59,"<":60,"=":61,">":62,"?":63,"@":64,A:65,B:66,C:67,
            D:68,E:69,F:70,G:71,H:72,I:73,J:74,K:75,L:76,M:77,N:78,O:79,P:80,
            Q:81,R:82,S:83,T:84,U:85,V:86,W:87,X:88,Y:89,Z:90,"[":91,"\\":92,
            "]":93,"^":94,_:95,"`":96,a:97,b:98,c:99,d:100,e:101,f:102,g:103,
            h:104,i:105,j:106,k:107,l:108,m:109,n:110,o:111,p:112,q:113,r:114,
            s:115,t:116,u:117,v:118,w:119,x:120,y:121,z:122,"{":123,"|":124,
            "}":125,"~":126,"\x7f":127,"\x80":128,"\x81":129,"\x82":130,"\x83":131,
            "\x84":132,"\x85":133,"\x86":134,"\x87":135,"\x88":136,"\x89":137,
            "\x8a":138,"\x8b":139,"\x8c":140,"\x8d":141,"\x8e":142,"\x8f":143,
            "\x90":144,"\x91":145,"\x92":146,"\x93":147,"\x94":148,"\x95":149,
            "\x96":150,"\x97":151,"\x98":152,"\x99":153,"\x9a":154,"\x9b":155,
            "\x9c":156,"\x9d":157,"\x9e":158,"\x9f":159,"\xa0":160,"\xa1":161,
            "\xa2":162,"\xa3":163,"\xa4":164,"\xa5":165,"\xa6":166,"\xa7":167,
            "\xa8":168,"\xa9":169,"\xaa":170,"\xab":171,"\xac":172,"\xad":173,
            "\xae":174,"\xaf":175,"\xb0":176,"\xb1":177,"\xb2":178,"\xb3":179,
            "\xb4":180,"\xb5":181,"\xb6":182,"\xb7":183,"\xb8":184,"\xb9":185,
            "\xba":186,"\xbb":187,"\xbc":188,"\xbd":189,"\xbe":190,"\xbf":191,
            "\xc0":192,"\xc1":193,"\xc2":194,"\xc3":195,"\xc4":196,"\xc5":197,
            "\xc6":198,"\xc7":199,"\xc8":200,"\xc9":201,"\xca":202,"\xcb":203,
            "\xcc":204,"\xcd":205,"\xce":206,"\xcf":207,"\xd0":208,"\xd1":209,
            "\xd2":210,"\xd3":211,"\xd4":212,"\xd5":213,"\xd6":214,"\xd7":215,
            "\xd8":216,"\xd9":217,"\xda":218,"\xdb":219,"\xdc":220,"\xdd":221,
            "\xde":222,"\xdf":223,"\xe0":224,"\xe1":225,"\xe2":226,"\xe3":227,
            "\xe4":228,"\xe5":229,"\xe6":230,"\xe7":231,"\xe8":232,"\xe9":233,
            "\xea":234,"\xeb":235,"\xec":236,"\xed":237,"\xee":238,"\xef":239,
            "\xf0":240,"\xf1":241,"\xf2":242,"\xf3":243,"\xf4":244,"\xf5":245,
            "\xf6":246,"\xf7":247,"\xf8":248,"\xf9":249,"\xfa":250,"\xfb":251,
            "\xfc":252,"\xfd":253,"\xfe":254,"\xff":255
        };
    }
}

native_prototype: {
    options = {
        unsafe_proto: true,
    }
    input: {
        Array.prototype.splice.apply(a, [1, 2, b, c]);
        Function.prototype.call.apply(console.log, console, [ "foo" ]);
        Number.prototype.toFixed.call(Math.PI, 2);
        Object.prototype.hasOwnProperty.call(d, "foo");
        RegExp.prototype.test.call(/foo/, "bar");
        String.prototype.indexOf.call(e, "bar");
    }
    expect: {
        [].splice.apply(a, [1, 2, b, c]);
        (function() {}).call.apply(console.log, console, [ "foo" ]);
        0..toFixed.call(Math.PI, 2);
        ({}).hasOwnProperty.call(d, "foo");
        /t/.test.call(/foo/, "bar");
        "".indexOf.call(e, "bar");
    }
}

native_prototype_lhs: {
    options = {
        unsafe_proto: true,
    }
    input: {
        console.log(function() {
            Function.prototype.bar = "PASS";
            return function() {};
        }().bar);
    }
    expect: {
        console.log(function() {
            Function.prototype.bar = "PASS";
            return function() {};
        }().bar);
    }
    expect_stdout: "PASS"
}

accessor_boolean: {
    input: {
        var a = 1;
        var b = {
            get true() {
                return a;
            },
            set false(c) {
                a = c;
            }
        };
        console.log(b.true, b.false = 2, b.true);
    }
    expect_exact: 'var a=1;var b={get true(){return a},set false(c){a=c}};console.log(b.true,b.false=2,b.true);'
    expect_stdout: "1 2 2"
}

accessor_get_set: {
    input: {
        var a = 1;
        var b = {
            get set() {
                return a;
            },
            set get(c) {
                a = c;
            }
        };
        console.log(b.set, b.get = 2, b.set);
    }
    expect_exact: 'var a=1;var b={get set(){return a},set get(c){a=c}};console.log(b.set,b.get=2,b.set);'
    expect_stdout: "1 2 2"
}

accessor_null_undefined: {
    input: {
        var a = 1;
        var b = {
            get null() {
                return a;
            },
            set undefined(c) {
                a = c;
            }
        };
        console.log(b.null, b.undefined = 2, b.null);
    }
    expect_exact: 'var a=1;var b={get null(){return a},set undefined(c){a=c}};console.log(b.null,b.undefined=2,b.null);'
    expect_stdout: "1 2 2"
}

accessor_number: {
    input: {
        var a = 1;
        var b = {
            get 42() {
                return a;
            },
            set 42(c) {
                a = c;
            }
        };
        console.log(b[42], b[42] = 2, b[42]);
    }
    expect_exact: 'var a=1;var b={get 42(){return a},set 42(c){a=c}};console.log(b[42],b[42]=2,b[42]);'
    expect_stdout: "1 2 2"
}

accessor_string: {
    input: {
        var a = 1;
        var b = {
            get "a-b"() {
                return a;
            },
            set "a-b"(c) {
                a = c;
            }
        };
        console.log(b["a-b"], b["a-b"] = 2, b["a-b"]);
    }
    expect_exact: 'var a=1;var b={get"a-b"(){return a},set"a-b"(c){a=c}};console.log(b["a-b"],b["a-b"]=2,b["a-b"]);'
    expect_stdout: "1 2 2"
}

accessor_this: {
    input: {
        var a = 1;
        var b = {
            get this() {
                return a;
            },
            set this(c) {
                a = c;
            }
        };
        console.log(b.this, b.this = 2, b.this);
    }
    expect_exact: 'var a=1;var b={get this(){return a},set this(c){a=c}};console.log(b.this,b.this=2,b.this);'
    expect_stdout: "1 2 2"
}

issue_2208_1: {
    options = {
        inline: true,
        properties: true,
        side_effects: true,
    }
    input: {
        console.log({
            p: function() {
                return 42;
            }
        }.p());
    }
    expect: {
        console.log(42);
    }
    expect_stdout: "42"
}

issue_2208_2: {
    options = {
        inline: true,
        properties: true,
        side_effects: true,
    }
    input: {
        console.log({
            a: 42,
            p: function() {
                return this.a;
            }
        }.p());
    }
    expect: {
        console.log({
            a: 42,
            p: function() {
                return this.a;
            }
        }.p());
    }
    expect_stdout: "42"
}

issue_2208_3: {
    options = {
        inline: true,
        properties: true,
        side_effects: true,
    }
    input: {
        a = 42;
        console.log({
            p: function() {
                return function() {
                    return this.a;
                }();
            }
        }.p());
    }
    expect: {
        a = 42;
        console.log(function() {
            return this.a;
        }());
    }
    expect_stdout: "42"
}

issue_2208_4: {
    options = {
        inline: true,
        properties: true,
        side_effects: true,
    }
    input: {
        function foo() {}
        console.log({
            a: foo(),
            p: function() {
                return 42;
            }
        }.p());
    }
    expect: {
        function foo() {}
        console.log((foo(), function() {
            return 42;
        })());
    }
    expect_stdout: "42"
}

issue_2208_5: {
    options = {
        inline: true,
        properties: true,
        side_effects: true,
    }
    input: {
        console.log({
            p: "FAIL",
            p: function() {
                return 42;
            }
        }.p());
    }
    expect: {
        console.log(42);
    }
    expect_stdout: "42"
}

issue_2208_6: {
    options = {
        inline: true,
        properties: true,
        side_effects: true,
    }
    input: {
        console.log({
            p: () => 42
        }.p());
    }
    expect: {
        console.log(42);
    }
    expect_stdout: "42"
    node_version: ">=4"
}

issue_2208_7: {
    options = {
        ecma: 6,
        inline: true,
        properties: true,
        side_effects: true,
        unsafe_arrows: true,
    }
    input: {
        console.log({
            p() {
                return 42;
            }
        }.p());
    }
    expect: {
        console.log(42);
    }
    expect_stdout: "42"
    node_version: ">=4"
}

issue_2208_8: {
    options = {
        ecma: 6,
        inline: true,
        properties: true,
        side_effects: true,
        unsafe_arrows: true,
    }
    input: {
        console.log({
            *p() {
                return x();
            }
        }.p());
        console.log({
            async p() {
                return await x();
            }
        }.p());
    }
    expect: {
        console.log({
            *p() {
                return x();
            }
        }.p());
        console.log((async () => {
            return await x();
        })());
    }
}

issue_2208_9: {
    options = {
        inline: true,
        properties: true,
        side_effects: true,
    }
    input: {
        a = 42;
        console.log({
            p: () => {
                return function() {
                    return this.a;
                }();
            }
        }.p());
    }
    expect: {
        a = 42;
        console.log(function() {
            return this.a;
        }());
    }
    expect_stdout: "42"
    node_version: ">=4"
}

methods_keep_quoted_true: {
    options = {
        arrows: true,
        ecma: 6,
        unsafe_methods: true,
    }
    mangle = {
        properties: {
            keep_quoted: true,
        },
    }
    input: {
        class C { "Quoted"(){} Unquoted(){} }
        f1({ "Quoted"(){}, Unquoted(){}, "Prop": 3 });
        f2({ "Quoted": function(){} });
        f3({ "Quoted": ()=>{} });
    }
    expect_exact: "class C{Quoted(){}o(){}}f1({Quoted(){},o(){},Prop:3});f2({Quoted(){}});f3({Quoted(){}});"
}

methods_keep_quoted_false: {
    options = {
        arrows: true,
        ecma: 6,
        unsafe_methods: true,
    }
    mangle = {
        properties: {
            keep_quoted: false,
        },
    }
    input: {
        class C { "Quoted"(){} Unquoted(){} }
        f1({ "Quoted"(){}, Unquoted(){}, "Prop": 3 });
        f2({ "Quoted": function(){} });
        f3({ "Quoted": ()=>{} });
    }
    expect_exact: "class C{o(){}d(){}}f1({o(){},d(){},e:3});f2({o(){}});f3({o(){}});"
}

methods_keep_quoted_from_dead_code: {
    options = {
        arrows: true,
        booleans: true,
        conditionals: true,
        dead_code: true,
        ecma: 6,
        evaluate: true,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        unsafe_methods: true,
    }
    mangle = {
        properties: {
            keep_quoted: true,
        },
    }
    input: {
        class C { Quoted(){} Unquoted(){} }
        f1({ Quoted(){}, Unquoted(){}, "Prop": 3 });
        f2({ Quoted: function(){} });
        f3({ Quoted: ()=>{} });
        0 && obj["Quoted"];
    }
    expect_exact: "class C{Quoted(){}o(){}}f1({Quoted(){},o(){},Prop:3});f2({Quoted(){}});f3({Quoted(){}});"
}

issue_2256: {
    options = {
        side_effects: true,
    }
    mangle = {
        properties: {
            keep_quoted: true,
        },
    }
    input: {
        ({ "keep": 1 });
        g.keep = g.change;
    }
    expect: {
        g.keep = g.g;
    }
}

issue_2321: {
    options = {
        ecma: 6,
        unsafe_methods: false,
    }
    input: {
        var f = {
            foo: function(){ console.log("foo") },
            bar() { console.log("bar") }
        };
        var foo = new f.foo();
        var bar =     f.bar();
    }
    expect: {
        var f = {
            foo: function() {
                console.log("foo");
            },
            bar() {
                console.log("bar");
            }
        };
        var foo = new f.foo();
        var bar = f.bar();
    }
    expect_stdout: [
        "foo",
        "bar",
    ]
    node_version: ">=6"
}

unsafe_methods_regex: {
    options = {
        ecma: 6,
        unsafe_methods: /^[A-Z1]/,
    }
    input: {
        var f = {
            123: function(){ console.log("123") },
            foo: function(){ console.log("foo") },
            bar() { console.log("bar") },
            Baz: function(){ console.log("baz") },
            BOO: function(){ console.log("boo") },
            null: function(){ console.log("null") },
            undefined: function(){ console.log("undefined") },
        };
        f[123]();
        new f.foo();
        f.bar();
        f.Baz();
        f.BOO();
        new f.null();
        new f.undefined();
    }
    expect: {
        var f = {
            123() { console.log("123") },
            foo: function(){ console.log("foo") },
            bar() { console.log("bar"); },
            Baz() { console.log("baz") },
            BOO() { console.log("boo") },
            null: function(){ console.log("null") },
            undefined: function(){ console.log("undefined") },
        };
        f[123]();
        new f.foo();
        f.bar();
        f.Baz();
        f.BOO();
        new f.null();
        new f.undefined();
    }
    expect_stdout: [
        "123",
        "foo",
        "bar",
        "baz",
        "boo",
        "null",
        "undefined",
    ]
    node_version: ">=6"
}

lhs_prop_1: {
    options = {
        evaluate: true,
        properties: true,
    }
    input: {
        console.log(++{
            a: 1
        }.a);
    }
    expect: {
        console.log(++{
            a: 1
        }.a);
    }
    expect_stdout: "2"
}

lhs_prop_2: {
    options = {
        evaluate: true,
        inline: true,
        properties: true,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        [1][0] = 42;
        (function(a) {
            a.b = "g";
        })("abc");
        (function(a) {
            a[2] = "g";
        })("def");
        (function(a) {
            a[""] = "g";
        })("ghi");
    }
    expect: {
        [1][0] = 42;
        "abc".b = "g";
        "def"[2] = "g";
        "ghi"[""] = "g";
    }
}

literal_duplicate_key_side_effects: {
    options = {
        properties: true,
        side_effects: true,
    }
    input: {
        console.log({
            a: "FAIL",
            a: console.log ? "PASS" : "FAIL"
        }.a);
    }
    expect: {
        console.log(console.log ? "PASS" : "FAIL");
    }
    expect_stdout: "PASS"
}

prop_side_effects_1: {
    options = {
        evaluate: true,
        inline: true,
        properties: true,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var C = 1;
        console.log(C);
        var obj = {
            bar: function() {
                return C + C;
            }
        };
        console.log(obj.bar());
    }
    expect: {
        console.log(1);
        var obj = {
            bar: function() {
                return 2;
            }
        };
        console.log(obj.bar());
    }
    expect_stdout: [
        "1",
        "2",
    ]
}

prop_side_effects_2: {
    options = {
        evaluate: true,
        inline: true,
        passes: 2,
        properties: true,
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var C = 1;
        console.log(C);
        var obj = {
            "": function() {
                return C + C;
            }
        };
        console.log(obj[""]());
    }
    expect: {
        console.log(1);
        console.log(2);
    }
    expect_stdout: [
        "1",
        "2",
    ]
}

accessor_1: {
    options = {
        properties: true,
    }
    input: {
        console.log({
            a: "FAIL",
            get a() {
                return "PASS";
            }
        }.a);
    }
    expect: {
        console.log({
            a: "FAIL",
            get a() {
                return "PASS";
            }
        }.a);
    }
    expect_stdout: "PASS"
    node_version: ">=4"
}

accessor_2: {
    options = {
        properties: true,
    }
    input: {
        console.log({
            get a() {
                return "PASS";
            },
            set a(v) {},
            a: "FAIL"
        }.a);
    }
    expect: {
        console.log({
            get a() {
                return "PASS";
            },
            set a(v) {},
            a: "FAIL"
        }.a);
    }
    expect_stdout: true
}

array_hole: {
    options = {
        properties: true,
        side_effects: true,
    }
    input: {
        console.log(
            [ 1, 2, , 3][1],
            [ 1, 2, , 3][2],
            [ 1, 2, , 3][3]
        );
    }
    expect: {
        console.log(2, void 0, 3);
    }
    expect_stdout: "2 undefined 3"
}

computed_property: {
    options = {
        properties: true,
        side_effects: true,
    }
    input: {
        console.log({
            a: "bar",
            [console.log("foo")]: 42,
        }.a);
    }
    expect: {
        console.log([
            "bar",
            console.log("foo")
        ][0]);
    }
    expect_stdout: [
        "foo",
        "bar"
    ]
    node_version: ">=4"
}

new_this: {
    options = {
        properties: true,
        side_effects: true,
    }
    input: {
        new {
            f: function(a) {
                this.a = a;
            }
        }.f(42);
    }
    expect: {
        new function(a) {
            this.a = a;
        }(42);
    }
}

issue_2513: {
    options = {
        evaluate: true,
        properties: true,
    }
    input: {
        !function(Infinity, NaN, undefined) {
            console.log("a"[1/0], "b"["Infinity"]);
            console.log("c"[0/0], "d"["NaN"]);
            console.log("e"[void 0], "f"["undefined"]);
        }(0, 0, 0);
    }
    expect: {
        !function(Infinity, NaN, undefined) {
            console.log("a"[1/0], "b"[1/0]);
            console.log("c".NaN, "d".NaN);
            console.log("e"[void 0], "f"[void 0]);
        }(0, 0, 0);
    }
    expect_stdout: [
        "undefined undefined",
        "undefined undefined",
        "undefined undefined",
    ]
}

const_prop_assign_strict: {
    options = {
        pure_getters: "strict",
        side_effects: true,
    }
    input: {
        function Simulator() {
            /abc/.index = 1;
            this._aircraft = [];
        }
        (function() {}).prototype.destroy = x();
    }
    expect: {
        function Simulator() {
            this._aircraft = [];
        }
        x();
    }
}

const_prop_assign_pure: {
    options = {
        pure_getters: true,
        side_effects: true,
    }
    input: {
        function Simulator() {
            /abc/.index = 1;
            this._aircraft = [];
        }
        (function() {}).prototype.destroy = x();
    }
    expect: {
        function Simulator() {
            this._aircraft = [];
        }
        x();
    }
}

join_object_assignments_1: {
    options = {
        evaluate: true,
        join_vars: true,
    }
    input: {
        console.log(function() {
            var x = {
                a: 1,
                c: (console.log("c"), "C"),
            };
            x.b = 2;
            x[3] = function() {
                console.log(x);
            },
            x["a"] = /foo/,
            x.bar = x;
            return x;
        }());
    }
    expect: {
        console.log(function() {
            var x = {
                a: 1,
                c: (console.log("c"), "C"),
                b: 2,
                3: function() {
                    console.log(x);
                },
                a: /foo/,
            };
            x.bar = x;
            return x;
        }());
    }
    expect_stdout: true
}

join_object_assignments_2: {
    options = {
        evaluate: true,
        hoist_props: true,
        join_vars: true,
        passes: 3,
        reduce_vars: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var o = {
            foo: 1,
        };
        o.bar = 2;
        o.baz = 3;
        console.log(o.foo, o.bar + o.bar, o.foo * o.bar * o.baz);
    }
    expect: {
        console.log(1, 4, 6);
    }
    expect_stdout: "1 4 6"
}

join_object_assignments_3: {
    options = {
        evaluate: true,
        join_vars: true,
    }
    input: {
        console.log(function() {
            var o = {
                a: "PASS",
            }, a = o.a;
            o.a = "FAIL";
            return a;
        }());
    }
    expect: {
        console.log(function() {
            var o = {
                a: "PASS",
            }, a = o.a;
            o.a = "FAIL";
            return a;
        }());
    }
    expect_stdout: "PASS"
}

join_object_assignments_return_1: {
    options = {
        join_vars: true,
    }
    input: {
        console.log(function() {
            var o = {
                p: 3
            };
            return o.q = "foo";
        }());
    }
    expect: {
        console.log(function() {
            var o = {
                p: 3,
                q: "foo"
            };
            return o.q;
        }());
    }
    expect_stdout: "foo"
}

join_object_assignments_return_2: {
    options = {
        join_vars: true,
    }
    input: {
        console.log(function() {
            var o = {
                p: 3
            };
            return o.q = /foo/,
            o.r = "bar";
        }());
    }
    expect: {
        console.log(function() {
            var o = {
                p: 3,
                q: /foo/,
                r: "bar"
            };
            return o.r;
        }());
    }
    expect_stdout: "bar"
}

join_object_assignments_return_3: {
    options = {
        join_vars: true,
    }
    input: {
        console.log(function() {
            var o = {
                p: 3
            };
            return o.q = "foo",
            o.p += "",
            console.log(o.q),
            o.p;
        }());
    }
    expect: {
        console.log(function() {
            var o = {
                p: 3,
                q: "foo"
            };
            return o.p += "",
            console.log(o.q),
            o.p;
        }());
    }
    expect_stdout: [
        "foo",
        "3",
    ]
}

join_object_assignments_for: {
    options = {
        join_vars: true,
    }
    input: {
        console.log(function() {
            var o = {
                p: 3
            };
            for (o.q = "foo"; console.log(o.q););
            return o.p;
        }());
    }
    expect: {
        console.log(function() {
            for (var o = {
                p: 3,
                q: "foo"
            }; console.log(o.q););
            return o.p;
        }());
    }
    expect_stdout: [
        "foo",
        "3",
    ]
}

join_object_assignments_if: {
    options = {
        join_vars: true,
    }
    input: {
        console.log(function() {
            var o = {};
            if (o.a = "PASS") return o.a;
        }())
    }
    expect: {
        console.log(function() {
            var o = { a: "PASS" };
            if (o.a) return o.a;
        }());
    }
    expect_stdout: "PASS"
}

join_object_assignments_forin: {
    options = {
        join_vars: true,
    }
    input: {
        console.log(function() {
            var o = {};
            for (var a in o.a = "PASS", o)
                return o[a];
        }())
    }
    expect: {
        console.log(function() {
            var o = { a: "PASS" };
            for (var a in o)
                return o[a];
        }());
    }
    expect_stdout: "PASS"
}

join_object_assignments_negative: {
    options = {
        evaluate: true,
        join_vars: true,
        properties: true,
    }
    input: {
        var o = {};
        o[0] = 0;
        o[-0] = 1;
        o[-1] = 2;
        console.log(o[0], o[-0], o[-1]);
    }
    expect: {
        var o = {
            0: 0,
            0: 1,
            "-1": 2
        };
        console.log(o[0], o[-0], o[-1]);
    }
    expect_stdout: "1 1 2"
}

join_object_assignments_NaN_1: {
    options = {
        join_vars: true,
    }
    input: {
        var o = {};
        o[NaN] = 1;
        o[0/0] = 2;
        console.log(o[NaN], o[NaN]);
    }
    expect: {
        var o = {};
        o[NaN] = 1;
        o[0/0] = 2;
        console.log(o[NaN], o[NaN]);
    }
    expect_stdout: "2 2"
}

join_object_assignments_NaN_2: {
    options = {
        evaluate: true,
        join_vars: true,
        properties: true,
    }
    input: {
        var o = {};
        o[NaN] = 1;
        o[0/0] = 2;
        console.log(o[NaN], o[NaN]);
    }
    expect: {
        var o = {
            NaN: 1,
            NaN: 2
        };
        console.log(o.NaN, o.NaN);
    }
    expect_stdout: "2 2"
}

join_object_assignments_null_0: {
    options = {
        join_vars: true,
    }
    input: {
        var o = {};
        o[null] = 1;
        console.log(o[null]);
    }
    expect: {
        var o = {};
        o[null] = 1;
        console.log(o[null]);
    }
    expect_stdout: "1"
}

join_object_assignments_null_1: {
    options = {
        evaluate: true,
        join_vars: true,
        properties: true,
    }
    input: {
        var o = {};
        o[null] = 1;
        console.log(o[null]);
    }
    expect: {
        var o = {
            null: 1
        };
        console.log(o.null);
    }
    expect_stdout: "1"
}

join_object_assignments_void_0: {
    options = {
        evaluate: true,
        join_vars: true,
    }
    input: {
        var o = {};
        o[void 0] = 1;
        console.log(o[void 0]);
    }
    expect: {
        var o = {
            undefined: 1
        };
        console.log(o[void 0]);
    }
    expect_stdout: "1"
}

join_object_assignments_undefined_1: {
    options = {
        join_vars: true,
    }
    input: {
        var o = {};
        o[undefined] = 1;
        console.log(o[undefined]);
    }
    expect: {
        var o = {};
        o[void 0] = 1;
        console.log(o[void 0]);
    }
    expect_stdout: "1"
}

join_object_assignments_undefined_2: {
    options = {
        evaluate: true,
        join_vars: true,
        properties: true,
    }
    input: {
        var o = {};
        o[undefined] = 1;
        console.log(o[undefined]);
    }
    expect: {
        var o = {
            undefined : 1
        };
        console.log(o[void 0]);
    }
    expect_stdout: "1"
}

join_object_assignments_Infinity: {
    options = {
        evaluate: true,
        join_vars: true,
        properties: true,
    }
    input: {
        var o = {};
        o[Infinity] = 1;
        o[1/0] = 2;
        o[-Infinity] = 3;
        o[-1/0] = 4;
        console.log(o[Infinity], o[1/0], o[-Infinity], o[-1/0]);
    }
    expect: {
        var o = {
            Infinity: 1,
            Infinity: 2,
            "-Infinity": 3,
            "-Infinity": 4
        };
        console.log(o[1/0], o[1/0], o[-1/0], o[-1/0]);
    }
    expect_stdout: "2 2 4 4"
}

join_object_assignments_regex: {
    options = {
        evaluate: true,
        join_vars: true,
        properties: true,
    }
    input: {
        var o = {};
        o[/rx/] = 1;
        console.log(o[/rx/]);
    }
    expect: {
        var o = {
            "/rx/": 1
        };
        console.log(o[/rx/]);
    }
    expect_stdout: "1"
}

issue_2816: {
    options = {
        join_vars: true,
    }
    input: {
        "use strict";
        var o = {
            a: 1
        };
        o.b = 2;
        o.a = 3;
        o.c = 4;
        console.log(o.a, o.b, o.c);
    }
    expect: {
        "use strict";
        var o = {
            a: 1,
            b: 2
        };
        o.a = 3;
        o.c = 4;
        console.log(o.a, o.b, o.c);
    }
    expect_stdout: "3 2 4"
}

issue_2816_ecma6: {
    options = {
        ecma: "6",
        join_vars: true,
    }
    input: {
        "use strict";
        var o = {
            a: 1
        };
        o.b = 2;
        o.a = 3;
        o.c = 4;
        console.log(o.a, o.b, o.c);
    }
    expect: {
        "use strict";
        var o = {
            a: 1,
            b: 2,
            a: 3,
            c: 4
        };
        console.log(o.a, o.b, o.c);
    }
    expect_stdout: "3 2 4"
    node_version: ">=4"
}
