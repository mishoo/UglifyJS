#!/bin/sh

alias uglify-js=$PWD/bin/uglifyjs
UGLIFY_OPTIONS=$@

minify_in_situ() {
    ARGS="$UGLIFY_OPTIONS --validate --in-situ"
    DIRS="$1"
    echo '> uglify-js' $DIRS $UGLIFY_OPTIONS
    for i in `find $DIRS -type f -name '*.js'`
    do
        ARGS="$ARGS $i"
    done
    uglify-js $ARGS
}

npm_install() {
    PKG="$1"
    while !(npm install $PKG); do
        while !(npm cache clean --force); do echo "'npm cache clean' failed - retrying..."; done
    done
}

rm -rf tmp/butternut \
&& git clone https://github.com/Rich-Harris/butternut.git tmp/butternut \
&& cd tmp/butternut \
&& rm -rf .git/hooks \
&& patch -l -p1 <<EOF
--- a/package.json
+++ b/package.json
@@ -25 +24,0 @@
-    "prepublish": "npm run test:min",
--- a/rollup.config.js
+++ b/rollup.config.js
@@ -1 +0,0 @@
-import buble from 'rollup-plugin-buble';
@@ -28,6 +26,0 @@ const config = {
-               buble({
-                       include: ['src/**', 'node_modules/acorn/**'],
-                       transforms: {
-                               dangerousForOf: true
-                       }
-               }),
EOF
ERR=$?; if [ "$ERR" != "0" ]; then echo "Error: $ERR"; exit $ERR; fi
minify_in_situ "src" \
&& rm -rf node_modules \
&& npm_install \
&& rm -rf dist \
&& npm run build \
&& minify_in_situ "dist" \
&& node_modules/.bin/mocha test/test.js
