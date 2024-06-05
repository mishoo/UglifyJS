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
    for i in `find $DIRS -type f -name '*.mjs'`
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

workaround() {
    FILE="$1"
    echo 'Monkey patching' $FILE
    CODE=`cat $FILE`
    sed -E 's/for ?\((var [^;{]+;)/\1for\(;/g' > $FILE <<EOF
$CODE
EOF
}

rm -rf tmp/sucrase \
&& git clone https://github.com/alangpierce/sucrase.git tmp/sucrase \
&& cd tmp/sucrase \
&& rm -rf .git/hooks \
&& git checkout 7284b3733aa114b3f4f5371e36ff5a4704ec860e \
&& patch -l -p1 <<EOF
--- a/package.json
+++ b/package.json
@@ -25 +24,0 @@
-    "prepublishOnly": "yarn clean && yarn build",
@@ -69 +67,0 @@
-    "test262-harness": "^10.0.0",
--- a/script/build.ts
+++ b/script/build.ts
@@ -16 +15,0 @@ async function main(): Promise<void> {
-    () => buildBenchmark(),
@@ -18,5 +16,0 @@ async function main(): Promise<void> {
-    () => buildIntegration("./integrations/gulp-plugin"),
-    () => buildIntegration("./integrations/jest-plugin"),
-    () => buildIntegration("./integrations/webpack-loader"),
-    () => buildIntegration("./integrations/webpack-object-rest-spread-plugin"),
-    () => buildWebsite(),
@@ -62,3 +55,0 @@ async function buildSucrase(): Promise<void> {
-    // Also add in .d.ts files from tsc, which only need to be compiled once.
-    await run(\`\${TSC} --project ./src --outDir ./dist-types\`);
-    await mergeDirectoryContents("./dist-types/src", "./dist/types");
@@ -66 +57 @@ async function buildSucrase(): Promise<void> {
-    await run("yarn link");
+    await run("npm link");
--- a/src/identifyShadowedGlobals.ts
+++ b/src/identifyShadowedGlobals.ts
@@ -23,0 +24 @@ export default function identifyShadowedGlobals(
+export { identifyShadowedGlobals as HACK };
--- a/src/parser/tokenizer/state.ts
+++ b/src/parser/tokenizer/state.ts
@@ -106,0 +107 @@ export default class State {
+export { State as HACK };
--- a/src/transformers/JSXTransformer.ts
+++ b/src/transformers/JSXTransformer.ts
@@ -560,0 +561 @@ export default class JSXTransformer extends Transformer {
+export { JSXTransformer as HACK };
--- a/src/util/getClassInfo.ts
+++ b/src/util/getClassInfo.ts
@@ -195,0 +196 @@ export default function getClassInfo(
+export { getClassInfo as HACK };
--- a/src/util/getDeclarationInfo.ts
+++ b/src/util/getDeclarationInfo.ts
@@ -40,0 +41 @@ export default function getDeclarationInfo(tokens: TokenProcessor): DeclarationI
+export { getDeclarationInfo as HACK };
--- a/src/util/getImportExportSpecifierInfo.ts
+++ b/src/util/getImportExportSpecifierInfo.ts
@@ -87,0 +88 @@ export default function getImportExportSpecifierInfo(
+export { getImportExportSpecifierInfo as HACK };
--- a/src/util/getJSXPragmaInfo.ts
+++ b/src/util/getJSXPragmaInfo.ts
@@ -14,0 +15 @@ export default function getJSXPragmaInfo(options: Options): JSXPragmaInfo {
+export { getJSXPragmaInfo as HACK };
--- a/test/source-maps-test.ts
+++ b/test/source-maps-test.ts
@@ -26,0 +27 @@ var _a = require('./a'); var _a2 = _interopRequireDefault(_a);
+delete result.sourceMap.ignoreList;
EOF
ERR=$?; if [ "$ERR" != "0" ]; then echo "Error: $ERR"; exit $ERR; fi
npm_install esbuild-wasm@0.8.56 \
&& minify_in_situ "src" \
&& workaround src/parser/plugins/typescript.ts\
&& workaround src/transformers/CJSImportTransformer.ts\
&& rm -rf node_modules \
&& npm_install \
&& npm run clean \
&& npm run build \
&& minify_in_situ "dist" \
&& minify_in_situ "dist-self-build" \
&& npm run test-only
