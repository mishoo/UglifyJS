#!/usr/bin/env bash

#echo '(function() { class Foo {} Foo.bar; class Bar {} Bar.foo; })();' | ./bin/uglifyjs -m reserved=['Foo'],keep_classnames
echo '(function() { class Foo {} Foo.bar; class Bar {} Bar.foo;})();' | ./bin/uglifyjs -m reserved=['Foo']
