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

rm -rf tmp/sucrase \
&& git clone https://github.com/alangpierce/sucrase.git tmp/sucrase \
&& cd tmp/sucrase \
&& rm -rf .git/hooks \
&& git checkout 38b66f3009feb76750a799deea211adcc83574f1 \
&& patch -l -p1 <<EOF
--- a/package.json
+++ b/package.json
@@ -25 +24,0 @@
-    "prepublishOnly": "yarn clean && yarn build",
@@ -65 +63,0 @@
-    "test262-harness": "^6.5.0",
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
@@ -66,3 +59,0 @@ async function buildSucrase(): Promise<void> {
-    // Also add in .d.ts files from tsc, which only need to be compiled once.
-    await run(\`\${TSC} --project ./src --outDir ./dist-types\`);
-    await mergeDirectoryContents("./dist-types/src", "./dist");
@@ -70 +61 @@ async function buildSucrase(): Promise<void> {
-    await run("yarn link");
+    await run("npm link");
--- a/src/identifyShadowedGlobals.ts
+++ b/src/identifyShadowedGlobals.ts
@@ -23,0 +24 @@ export default function identifyShadowedGlobals(
+export { identifyShadowedGlobals as HACK };
--- a/src/parser/tokenizer/state.ts
+++ b/src/parser/tokenizer/state.ts
@@ -100,0 +101 @@ export default class State {
+export { State as HACK };
--- a/src/transformers/JSXTransformer.ts
+++ b/src/transformers/JSXTransformer.ts
@@ -253,0 +254 @@ export default class JSXTransformer extends Transformer {
+export { JSXTransformer as HACK };
--- a/src/util/getClassInfo.ts
+++ b/src/util/getClassInfo.ts
@@ -164,0 +165 @@ export default function getClassInfo(
+export { getClassInfo as HACK };
--- a/src/util/getDeclarationInfo.ts
+++ b/src/util/getDeclarationInfo.ts
@@ -40,0 +41 @@ export default function getDeclarationInfo(tokens: TokenProcessor): DeclarationI
+export { getDeclarationInfo as HACK };
--- a/src/util/getJSXPragmaInfo.ts
+++ b/src/util/getJSXPragmaInfo.ts
@@ -14,0 +15 @@ export default function getJSXPragmaInfo(options: Options): JSXPragmaInfo {
+export { getJSXPragmaInfo as HACK };
EOF
ERR=$?; if [ "$ERR" != "0" ]; then echo "Error: $ERR"; exit $ERR; fi
npm_install esbuild-wasm@0.8.56 \
&& minify_in_situ "src" \
&& rm -rf node_modules \
&& npm_install \
&& npm run clean \
&& npm run build \
&& minify_in_situ "dist" \
&& minify_in_situ "dist-self-build" \
&& npm run test-only
