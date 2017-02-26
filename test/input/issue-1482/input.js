if (x) foo();
if (x) foo(); else baz();
if (x) foo(); else if (y) bar(); else baz();
if (x) if (y) foo(); else bar(); else baz();
if (x) foo(); else if (y) bar(); else if (z) baz(); else moo();
function f() {
if (x) foo();
if (x) foo(); else baz();
if (x) foo(); else if (y) bar(); else baz();
if (x) if (y) foo(); else bar(); else baz();
if (x) foo(); else if (y) bar(); else if (z) baz(); else moo();
}
