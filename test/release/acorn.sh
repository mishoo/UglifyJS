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

rm -rf tmp/acorn \
&& git clone https://github.com/acornjs/acorn.git tmp/acorn \
&& cd tmp/acorn \
&& rm -rf .git/hooks \
&& git checkout 74b59384320ced82e09da2e8fdbed16810f7379a \
&& patch -l -p1 <<EOF
diff --git a/acorn-loose/rollup.config.js b/acorn-loose/rollup.config.js
index d2389b2..c37882b 100644
--- a/acorn-loose/rollup.config.js
+++ b/acorn-loose/rollup.config.js
@@ -1,2 +0,0 @@
-import buble from "rollup-plugin-buble"
-
@@ -23 +20,0 @@ export default {
-    buble({transforms: {dangerousForOf: true}})
diff --git a/acorn-walk/rollup.config.js b/acorn-walk/rollup.config.js
index 67dd613..8c28807 100644
--- a/acorn-walk/rollup.config.js
+++ b/acorn-walk/rollup.config.js
@@ -1,2 +0,0 @@
-import buble from "rollup-plugin-buble"
-
@@ -19 +16,0 @@ export default {
-    buble({transforms: {dangerousForOf: true}})
diff --git a/acorn/rollup.config.bin.js b/acorn/rollup.config.bin.js
index 8a082b0..b3eda60 100644
--- a/acorn/rollup.config.bin.js
+++ b/acorn/rollup.config.bin.js
@@ -1,2 +0,0 @@
-import buble from "rollup-plugin-buble"
-
@@ -11 +9 @@ export default {
-  plugins: [buble()]
+  plugins: []
diff --git a/acorn/rollup.config.js b/acorn/rollup.config.js
index c775a0c..cfd4c68 100644
--- a/acorn/rollup.config.js
+++ b/acorn/rollup.config.js
@@ -1,2 +0,0 @@
-import buble from "rollup-plugin-buble"
-
@@ -19 +16,0 @@ export default {
-    buble({transforms: {dangerousForOf: true}})
diff --git a/package.json b/package.json
index 382f59e..4612a75 100644
--- a/package.json
+++ b/package.json
@@ -24,4 +24 @@
-    "prepare": "npm run test",
-    "test": "node test/run.js && node test/lint.js",
-    "pretest": "npm run build:main && npm run build:loose",
-    "test:test262": "node bin/run_test262.js",
+    "test": "node test/run.js",
@@ -32,2 +29 @@
-    "build:bin": "rollup -c acorn/rollup.config.bin.js",
-    "lint": "eslint acorn/src/ acorn-walk/src/ acorn-loose/src/"
+    "build:bin": "rollup -c acorn/rollup.config.bin.js"
@@ -36,6 +31,0 @@
-    "eslint": "^4.10.0",
-    "eslint-config-standard": "^10.2.1",
-    "eslint-plugin-import": "^2.2.0",
-    "eslint-plugin-node": "^5.2.1",
-    "eslint-plugin-promise": "^3.5.0",
-    "eslint-plugin-standard": "^3.0.1",
@@ -43,4 +32,0 @@
-    "rollup-plugin-buble": "^0.19.0",
-    "test262": "git+https://github.com/tc39/test262.git#a6c819ad0f049f23f1a37af6b89dbb79fe3b9216",
-    "test262-parser-runner": "^0.5.0",
-    "test262-stream": "^1.2.1",
EOF
ERR=$?; if [ "$ERR" != "0" ]; then echo "Error: $ERR"; exit $ERR; fi
minify_in_situ "acorn/src" \
&& minify_in_situ "acorn-loose/src" \
&& minify_in_situ "acorn-walk/src" \
&& rm -rf node_modules \
&& npm_install \
&& rm -rf acorn/dist acorn-loose/dist acorn-walk/dist \
&& npm run build \
&& minify_in_situ "acorn/dist" \
&& minify_in_situ "acorn-loose/dist" \
&& minify_in_situ "acorn-walk/dist" \
&& npm test
