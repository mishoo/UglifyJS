#!/usr/bin/env sh

tsc --sourceMap --inlineSources file.ts
sed -i '' 's/file/mapping/g' file.js
mv file.js.map mapping.js.map

tsc --sourceMap --inlineSources file.ts --out file2.js
sed -i '' 's/file2/mapping2/g' file2.js
sed -i '' -e '$ d' file2.js
mv file2.js.map mapping2.js.map

tsc --sourceMap --inlineSources file.ts --out file3.js
sed -i '' 's/file3/mapping2/g' file3.js
sed -i '' -e '$ d' file3.js
mv file3.js.map mapping2.js.map

tsc --inlineSourceMap --inlineSources inline.ts

tsc --sourceMap --inlineSources infer1.ts
sed -i '' -e '$ d' infer1.js

tsc --sourceMap --inlineSources infer2.ts
sed -i '' -e '$ d' infer2.js
mv infer2.js.map infer2.map
