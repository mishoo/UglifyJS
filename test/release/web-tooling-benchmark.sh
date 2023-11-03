#!/bin/sh

alias uglify-js="node --max-old-space-size=8192 $PWD/bin/uglifyjs"
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

rm -rf tmp/web-tooling-benchmark \
&& git clone --depth 1 --branch v0.5.3 https://github.com/v8/web-tooling-benchmark.git tmp/web-tooling-benchmark \
&& cd tmp/web-tooling-benchmark \
&& rm -rf .git/hooks \
&& patch -l -p1 <<EOF
--- a/package.json
+++ b/package.json
@@ -12 +11,0 @@
-    "postinstall": "npm run build:terser-bundled && npm run build:uglify-js-bundled && npm run build",
--- a/src/bootstrap.js
+++ b/src/bootstrap.js
@@ -6 +6 @@ const gmean = require("compute-gmean");
-const package = require("../package.json");
+const package_json = require("../package.json");
@@ -65 +65 @@ function initialize() {
-  document.title = \`Web Tooling Benchmark v\${package.version}\`;
+  document.title = \`Web Tooling Benchmark v\${package_json.version}\`;
@@ -68 +68 @@ function initialize() {
-  versionDiv.innerHTML = \`v\${package.version}\`;
+  versionDiv.innerHTML = \`v\${package_json.version}\`;
--- a/src/cli-flags-helper.js
+++ b/src/cli-flags-helper.js
@@ -7 +6,0 @@ const targetList = new Set([
-  "chai",
--- a/src/cli.js
+++ b/src/cli.js
@@ -18,0 +19 @@ suite.on("error", event => {
+  global.process.exitCode = 42;
EOF
ERR=$?; if [ "$ERR" != "0" ]; then echo "Error: $ERR"; exit $ERR; fi
minify_in_situ "src" \
&& minify_in_situ "third_party" \
&& rm -rf node_modules \
&& npm_install --package-lock \
&& rm -rf build/* \
&& npm run build:terser-bundled \
&& npm run build:uglify-js-bundled \
&& minify_in_situ "build" \
&& rm -rf dist \
&& npm run build \
&& minify_in_situ "dist" \
&& node dist/cli.js
