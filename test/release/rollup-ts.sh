#!/bin/sh

alias uglify-js=$PWD/bin/uglifyjs
UGLIFY_OPTIONS=$@

minify_in_situ() {
    ARGS="$UGLIFY_OPTIONS --validate --in-situ"
    DIRS="$1"
    echo '> esbuild' $DIRS
    for i in `find $DIRS -type f -name '*.ts' | grep -v '\.d\.ts'`
    do
        echo "$i"
        CODE=`cat "$i"`
        node_modules/.bin/esbuild --loader=ts --target=esnext > "$i" <<EOF
$CODE
EOF
        ARGS="$ARGS $i"
    done
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
&& git clone --depth 1 --branch v2.39.1 https://github.com/rollup/rollup.git tmp/rollup \
&& cd tmp/rollup \
&& rm -rf .git/hooks \
&& patch -l -p1 <<EOF
--- a/package.json
+++ b/package.json
@@ -27,4 +26,0 @@
-    "postinstall": "husky install",
-    "postpublish": "pinst --enable",
-    "prepare": "npm run build",
-    "prepublishOnly": "pinst --disable && npm ci && npm run lint:nofix && npm run security && npm run build:bootstrap && npm run test:all",
@@ -93 +89 @@
-    "is-reference": "lukastaegert/is-reference#update-class-features",
+    "is-reference": "3.0.0",
--- a/test/cli/index.js
+++ b/test/cli/index.js
@@ -13,0 +14,3 @@ sander.rimrafSync(__dirname, 'node_modules');
+sander.rimrafSync(__dirname, 'samples', 'watch', 'bundle-error');
+sander.rimrafSync(__dirname, 'samples', 'watch', 'watch-config-error');
+sander.rimrafSync(__dirname, 'samples', 'watch', 'watch-config-initial-error');
EOF
ERR=$?; if [ "$ERR" != "0" ]; then echo "Error: $ERR"; exit $ERR; fi
npm_install esbuild-wasm@0.8.56 \
&& minify_in_situ "cli" \
&& minify_in_situ "src" \
&& rm -rf node_modules \
&& npm_install \
&& rm -rf dist \
&& npm run build \
&& minify_in_situ "dist" \
&& node_modules/.bin/mocha test/test.js \
&& node_modules/.bin/mocha test/browser/index.js
