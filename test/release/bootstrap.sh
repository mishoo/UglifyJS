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

rm -rf tmp/bootstrap \
&& git clone --depth 1 --branch v5.0.0-beta2 https://github.com/twbs/bootstrap.git tmp/bootstrap \
&& cd tmp/bootstrap \
&& rm -rf .git/hooks \
&& patch -p1 <<EOF
--- a/.babelrc.js
+++ /dev/null
@@ -1,12 +0,0 @@
-module.exports = {
-  presets: [
-    [
-      '@babel/preset-env',
-      {
-        loose: true,
-        bugfixes: true,
-        modules: false
-      }
-    ]
-  ]
-};
--- a/.gitattributes
+++ b/.gitattributes
@@ -5,0 +6 @@
+*.png binary
--- a/build/build-plugins.js
+++ b/build/build-plugins.js
@@ -14 +13,0 @@ const rollup = require('rollup')
-const { babel } = require('@rollup/plugin-babel')
@@ -19,6 +17,0 @@ const plugins = [
-  babel({
-    // Only transpile our source code
-    exclude: 'node_modules/**',
-    // Include the helpers in each file, at most one copy of each
-    babelHelpers: 'bundled'
-  })
--- a/build/rollup.config.js
+++ b/build/rollup.config.js
@@ -4 +3,0 @@ const path = require('path')
-const { babel } = require('@rollup/plugin-babel')
@@ -15,6 +13,0 @@ const plugins = [
-  babel({
-    // Only transpile our source code
-    exclude: 'node_modules/**',
-    // Include the helpers in the bundle, at most one copy of each
-    babelHelpers: 'bundled'
-  })
--- a/js/tests/integration/rollup.bundle.js
+++ b/js/tests/integration/rollup.bundle.js
@@ -3 +2,0 @@
-const { babel } = require('@rollup/plugin-babel')
@@ -18,4 +16,0 @@ module.exports = {
-    babel({
-      exclude: 'node_modules/**',
-      babelHelpers: 'bundled'
-    })
--- a/js/tests/karma.conf.js
+++ b/js/tests/karma.conf.js
@@ -7,2 +6,0 @@ const ip = require('ip')
-const { babel } = require('@rollup/plugin-babel')
-const istanbul = require('rollup-plugin-istanbul')
@@ -84,13 +81,0 @@ const conf = {
-      istanbul({
-        exclude: [
-          'node_modules/**',
-          'js/tests/unit/**/*.spec.js',
-          'js/tests/helpers/**/*.js'
-        ]
-      }),
-      babel({
-        // Only transpile our source code
-        exclude: 'node_modules/**',
-        // Inline the required helpers in each file
-        babelHelpers: 'inline'
-      }),
@@ -142 +126,0 @@ if (BROWSERSTACK) {
-    'karma-coverage-istanbul-reporter'
@@ -144 +127,0 @@ if (BROWSERSTACK) {
-  reporters.push('coverage-istanbul')
--- a/package.json
+++ b/package.json
@@ -23 +23 @@
-    "start": "npm-run-all --parallel watch docs-serve",
+    "start": "npm-run-all --parallel watch",
@@ -28,3 +27,0 @@
-    "css-lint": "npm-run-all --continue-on-error --parallel css-lint-*",
-    "css-lint-stylelint": "stylelint \"**/*.{css,scss}\" --cache --cache-location .cache/.stylelintcache --rd",
-    "css-lint-vars": "fusv scss/ site/assets/scss/",
@@ -44 +40,0 @@
-    "js-lint": "eslint --cache --cache-location .cache/.eslintcache --report-unused-disable-directives .",
@@ -46,3 +42,3 @@
-    "js-minify-standalone": "terser --compress passes=2 --mangle --comments \"/^!/\" --source-map \"content=dist/js/bootstrap.js.map,includeSources,url=bootstrap.min.js.map\" --output dist/js/bootstrap.min.js dist/js/bootstrap.js",
-    "js-minify-standalone-esm": "terser --compress passes=2 --mangle --comments \"/^!/\" --source-map \"content=dist/js/bootstrap.esm.js.map,includeSources,url=bootstrap.esm.min.js.map\" --output dist/js/bootstrap.esm.min.js dist/js/bootstrap.esm.js",
-    "js-minify-bundle": "terser --compress passes=2 --mangle --comments \"/^!/\" --source-map \"content=dist/js/bootstrap.bundle.js.map,includeSources,url=bootstrap.bundle.min.js.map\" --output dist/js/bootstrap.bundle.min.js dist/js/bootstrap.bundle.js",
+    "js-minify-standalone": "../../bin/uglifyjs --compress passes=2 --mangle --comments \"/^!/\" --source-map \"content=dist/js/bootstrap.js.map,includeSources,url=bootstrap.min.js.map\" --output dist/js/bootstrap.min.js dist/js/bootstrap.js",
+    "js-minify-standalone-esm": "../../bin/uglifyjs --compress passes=2 --mangle --comments \"/^!/\" --source-map \"content=dist/js/bootstrap.esm.js.map,includeSources,url=bootstrap.esm.min.js.map\" --output dist/js/bootstrap.esm.min.js dist/js/bootstrap.esm.js",
+    "js-minify-bundle": "../../bin/uglifyjs --compress passes=2 --mangle --comments \"/^!/\" --source-map \"content=dist/js/bootstrap.bundle.js.map,includeSources,url=bootstrap.bundle.min.js.map\" --output dist/js/bootstrap.bundle.min.js dist/js/bootstrap.bundle.js",
@@ -56,25 +52 @@
-    "lint": "npm-run-all --parallel js-lint css-lint lockfile-lint",
-    "docs": "npm-run-all docs-build docs-lint",
-    "docs-build": "hugo --cleanDestinationDir",
-    "docs-compile": "npm run docs-build",
-    "docs-linkinator": "linkinator _gh_pages --recurse --silent --skip \"^(?!http://localhost)\"",
-    "docs-vnu": "node build/vnu-jar.js",
-    "docs-lint": "npm-run-all --parallel docs-vnu docs-linkinator",
-    "docs-serve": "hugo server --port 9001 --disableFastRender",
-    "docs-serve-only": "npx sirv-cli _gh_pages --port 9001",
-    "lockfile-lint": "lockfile-lint --allowed-hosts npm --allowed-schemes https: --empty-hostname false --type npm --path package-lock.json",
-    "update-deps": "ncu -u -x karma-browserstack-launcher,terser && npm update && echo Manually update site/assets/js/vendor",
-    "release": "npm-run-all dist release-sri docs-build release-zip*",
-    "release-sri": "node build/generate-sri.js",
-    "release-version": "node build/change-version.js",
-    "release-zip": "cross-env-shell \"rm -rf bootstrap-\$npm_package_version-dist && cp -r dist/ bootstrap-\$npm_package_version-dist && zip -r9 bootstrap-\$npm_package_version-dist.zip bootstrap-\$npm_package_version-dist && rm -rf bootstrap-\$npm_package_version-dist\"",
-    "release-zip-examples": "node build/zip-examples.js",
-    "dist": "npm-run-all --parallel css js",
-    "test": "npm-run-all lint dist js-test docs-build docs-lint",
-    "netlify": "cross-env-shell HUGO_BASEURL=\$DEPLOY_PRIME_URL npm-run-all dist release-sri docs-build",
-    "watch": "npm-run-all --parallel watch-*",
-    "watch-css-main": "nodemon --watch scss/ --ext scss --exec \"npm-run-all css-lint css-compile css-prefix\"",
-    "watch-css-dist": "nodemon --watch dist/css/ --ext css --ignore \"dist/css/*.rtl.*\" --exec \"npm run css-rtl\"",
-    "watch-css-docs": "nodemon --watch site/assets/scss/ --ext scss --exec \"npm run css-lint\"",
-    "watch-js-main": "nodemon --watch js/src/ --ext js --exec \"npm-run-all js-lint js-compile\"",
-    "watch-js-docs": "nodemon --watch site/assets/js/ --ext js --exec \"npm run js-lint\""
+    "dist": "npm run css && npm run js"
@@ -103,3 +74,0 @@
-    "@babel/cli": "^7.12.13",
-    "@babel/core": "^7.12.13",
-    "@babel/preset-env": "^7.12.13",
@@ -107 +75,0 @@
-    "@rollup/plugin-babel": "^5.2.3",
@@ -115,4 +82,0 @@
-    "eslint": "^7.19.0",
-    "eslint-config-xo": "^0.34.0",
-    "eslint-plugin-import": "^2.22.1",
-    "eslint-plugin-unicorn": "^27.0.0",
@@ -122 +85,0 @@
-    "hugo-bin": "^0.68.0",
@@ -128 +90,0 @@
-    "karma-coverage-istanbul-reporter": "^3.0.3",
@@ -134,2 +95,0 @@
-    "linkinator": "^2.13.4",
-    "lockfile-lint": "^4.3.7",
@@ -141 +100,0 @@
-    "rollup-plugin-istanbul": "^3.0.0",
@@ -144,5 +103 @@
-    "shelljs": "^0.8.4",
-    "stylelint": "^13.9.0",
-    "stylelint-config-twbs-bootstrap": "^2.1.0",
-    "terser": "5.1.0",
-    "vnu-jar": "21.2.5"
+    "shelljs": "^0.8.4"
@@ -155,3 +109,0 @@
-  "hugo-bin": {
-    "buildTags": "extended"
-  },
EOF
ERR=$?; if [ "$ERR" != "0" ]; then echo "Error: $ERR"; exit $ERR; fi
rm -rf node_modules \
&& npm_install \
&& minify_in_situ "node_modules/@popperjs/core" \
&& rm -rf dist/js/* \
&& minify_in_situ "build" \
&& minify_in_situ "js" \
&& minify_in_situ "site" \
&& npm run dist \
&& minify_in_situ "dist" \
&& npm run js-test
