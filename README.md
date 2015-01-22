UnuglifyJS
==========

UnuglifyJS is a JavaScript tool that renames variables and parameters to names based on statistical model learnt from thousands of open source projects.
This is on open-source reimplementation of the [JS Nice](http://www.jsnice.org) tool which provides similar functionality.

The implementation of UnuglifyJS is based on [UglifyJS 2](https://github.com/mishoo/UglifyJS2) -- parser, minifier, compressor or beautifier toolkit for JavaScript. 

This page documents how to use the UnuglifyJS as a client of the [Nice 2 Predict](https://github.com/eth-srl/2Nice) framework to build statistical model learnt from thousands of open source projects, which is subsequently used to rename variables and parameters names of minified JavaScript files. An online demo of the Unuglify client is available at http://www.nice2predict.org.

Install UnuglifyJS
-------

First make sure you have installed the latest version of [node.js](http://nodejs.org/) and [NPM](https://www.npmjs.com/). (You may need to restart your computer after this step).

> sudo apt-get install nodejs npm

Download UnuglifyJS git repository:

> git clone https://github.com/eth-srl/UnuglifyJS.git
	
Once the sources are downloaded, install all the dependencies using NPM:

> sudo npm install

(Optional) Check that everything is installed correctly by running the tests:

> ./test/run-tests.js

Install Nice 2 Predict
-------

To install Nice 2 Predict framework please follow the instructions on the https://github.com/eth-srl/2Nice page.

Obtaining Training Dataset
-------

As a first step we need to obtain a large number of JavaScript files that can be used to train the statistical model. This can be easily achieved by downloading large amount of projects from GitHub or other repositories. 

To produce the training dataset, from the `UnuglifyJS` directory run the following script:

> ./extract_features.py --dir . > training_data

Here, the `--dir .` is used to specify which directory is searched for JavaScript files. In this demo we simply use the source files of the UnuglifyJS itself. While the script is runnig, you might notice output such as `Skipping minified file: './test/compress/issue-611.js'`. This is because our goal is to predict good variable names, therefore we do not want to train on already minified files.

### Program Representation & Format

Before we discuss how to train the statistical model, we briefly describe how the programs are represented and the format of the training dataset.

##### Program Representation
The role of the Unuglify client to perform a program analysis which transforms the input program into a representation that allows usage of machine learning algorithms provided by [Nice 2 Predict](https://github.com/eth-srl/2Nice).
Here, the program is represented as a set of features that relate known and unknown properties of the program.
We illustrate the program representation using the following code snippet `var a = s in _MAP;` where `_MAP` is a global variable. 

- Known properties are program constants, objects properties, methods and global variables – that is, program parts which cannot be (soundly) renamed (e.g. the DOM APIs). The known properties of the code snippet are:

	`_MAP`

- Unknown properties are all local variables. The unknown properties of the code snippet are:

	`a, s`
	
- Features relate properties. An example of feature function is `(s, _MAP) -> :Binaryin:` between properties `s` and `_MAP`, which captures the fact that they are used together as a left-hand and right-hand side of binary operator `in`. The features of the code snippet are:
 
```
	(a, s) -> :VarDef:Binaryin[0]
	(a, _MAP) -> :VarDef:Binaryin[1]
	(s, _MAP) -> :Binaryin:
```
	
##### Program Format

The program representation as described above is translated into a JSON format which the 2Nice server can process. 
The JSON consists of two parts `query` describing the features and `assign` describing the properties and their initial assignments with the attribute `giv` or `inf` for known and unknown properties respectively. That is, the JSON representation of the code snippet `var a = s in _MAP;` is:

```JSON
{
 "query":[
  {"a": 0,	"b": 1,	"f2": ":VarDef:Binaryin[0]"},
  {"a": 0,	"b": 2,	"f2": ":VarDef:Binaryin[1]"},
  {"a": 1,	"b": 2,	"f2": ":Binaryin:"}
 ],
 "assign":[
  {"v": 0,	"inf": "a"},
  {"v": 1,	"inf": "s"},
  {"v": 2,	"giv": "_MAP"}
 ]
}
```

##### Training Dataset Format

The training dataset produced by running UnuglifyJS simply consists of JSON program representations as shown above, one per line.

Training
-------
