#!/bin/sh

alias uglify-js=$PWD/bin/uglifyjs
UGLIFY_OPTIONS=$@

minify_in_situ() {
    DIRS="$1"
    echo '> uglify-js' $DIRS $UGLIFY_OPTIONS
    for i in `find $DIRS -name '*.js'`
    do
        echo "$i"
        uglify-js "$i" $UGLIFY_OPTIONS -o "$i"
    done
    for i in `find $DIRS -name '*.ts' | grep -v '\.d\.ts'`
    do
        echo "$i"
        node_modules/.bin/esbuild --loader=ts --target=node14 < "$i" \
            | uglify-js $UGLIFY_OPTIONS -o "$i"
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
EOF
ERR=$?; if [ "$ERR" != "0" ]; then echo "Error: $ERR"; exit $ERR; fi
npm install esbuild-wasm@0.8.56 \
&& minify_in_situ "cli" \
&& minify_in_situ "src" \
&& rm -rf node_modules \
&& npm ci \
&& rm -rf dist \
&& npm run build \
&& minify_in_situ "dist" \
&& node_modules/.bin/mocha test/test.js \
&& node_modules/.bin/mocha test/browser/index.js
