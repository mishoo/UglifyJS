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

rm -rf tmp/rollup \
&& git clone https://github.com/rollup/rollup.git tmp/rollup \
&& cd tmp/rollup \
&& rm -rf .git/hooks \
&& git checkout 3d80c06f895eab41e648ee99786fa68c72458b80 \
&& patch -l -p1 <<EOF
--- a/package.json
+++ b/package.json
@@ -23 +22,0 @@
-    "prepublishOnly": "npm run lint && npm run test:only && npm run test:leak",
--- a/rollup.config.js
+++ b/rollup.config.js
@@ -1,5 +1,4 @@
 import { readFileSync } from 'fs';
-import buble from 'rollup-plugin-buble';
 import resolve from 'rollup-plugin-node-resolve';
 import commonjs from 'rollup-plugin-commonjs';
 import json from 'rollup-plugin-json';
@@ -25,12 +24,6 @@ export default [
         input: 'src/node-entry.js',
         plugins: [
             json(),
-            buble({
-                include: ['src/**', 'node_modules/acorn/**'],
-                target: {
-                    node: '4'
-                }
-            }),
             resolve(),
             commonjs()
         ],
@@ -48,12 +41,6 @@ export default [
         input: 'src/browser-entry.js',
         plugins: [
             json(),
-            buble({
-                include: ['src/**', 'node_modules/acorn/**'],
-                target: {
-                    node: '4'
-                }
-            }),
             resolve(),
             commonjs(),
             {
@@ -80,7 +67,6 @@ export default [
         plugins: [
             string({ include: '**/*.md' }),
             json(),
-            buble({ target: { node: 4 } }),
             commonjs({
                 include: 'node_modules/**'
             }),
--- a/test/mocha.opts
+++ b/test/mocha.opts
@@ -1,2 +1 @@
---require buble/register
 test/test.js
EOF
ERR=$?; if [ "$ERR" != "0" ]; then echo "Error: $ERR"; exit $ERR; fi
minify_in_situ "bin" \
&& minify_in_situ "browser" \
&& minify_in_situ "src" \
&& rm -rf node_modules \
&& npm_install \
&& rm -rf dist \
&& npm run build \
&& minify_in_situ "dist" \
&& node_modules/.bin/mocha
