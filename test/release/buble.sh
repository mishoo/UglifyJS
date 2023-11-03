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

rm -rf tmp/buble \
&& git clone https://github.com/bublejs/buble.git tmp/buble \
&& cd tmp/buble \
&& rm -rf .git/hooks \
&& git checkout dcc5ab02c9af6ddaad94e587c4911677340ec100 \
&& patch -l -p1 <<EOF
--- a/package.json
+++ b/package.json
@@ -29 +28,0 @@
-    "prepublish": "npm test",
@@ -67,3 +66 @@
-    "source-map-support": "^0.5.16",
-    "test262": "git+https://github.com/tc39/test262.git#4f1155c566a222238fd86f179c6635ecb4c289bb",
-    "test262-stream": "^1.3.0"
+    "source-map-support": "^0.5.16"
--- a/src/program/BlockStatement.js
+++ b/src/program/BlockStatement.js
@@ -309 +309 @@ export default class BlockStatement extends Node {
-                               let cont = false; // TODO implement proper continue...
+                               let cont = !declarations; // TODO implement proper continue...
--- a/src/program/types/VariableDeclaration.js
+++ b/src/program/types/VariableDeclaration.js
@@ -38 +38 @@ export default class VariableDeclaration extends Node {
-                                               code.remove(c, declarator.id.start);
+                                               code.remove(c, declarator.id.start, lastDeclaratorIsPattern);
EOF
ERR=$?; if [ "$ERR" != "0" ]; then echo "Error: $ERR"; exit $ERR; fi
minify_in_situ "src" \
&& rm -rf node_modules \
&& npm_install \
&& rm -rf dist \
&& npm run build \
&& minify_in_situ "dist" \
&& node_modules/.bin/mocha
