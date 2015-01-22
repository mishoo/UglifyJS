UnglifyJS
==========

UnglifyJS is a JavaScript tool that renames variables and parameters to names based on statistical model learnt from thousands of open source projects.
This is on open-source reimplementation of the [JS Nice](http://www.jsnice.org) tool which provides similar functionality.

The implementation of UnglifyJS is based on [UglifyJS 2](https://github.com/mishoo/UglifyJS2) -- parser, minifier, compressor or beautifier toolkit for JavaScript. 

This page documents how to use the UnglifyJS as a client of the [Nice 2 Predict](https://github.com/eth-srl/2Nice) framework to build statistical model learnt from thousands of open source projects, which is subsequently used to rename variables and parameters names of minified JavaScript files.

Install UnuglifyJS
-------

First make sure you have installed the latest version of [node.js](http://nodejs.org/) and [NPM](https://www.npmjs.com/). (You may need to restart your computer after this step).

	sudo apt-get install nodejs npm

Download UnuglifyJS git repository:

	git clone https://github.com/eth-srl/UnuglifyJS.git
	
Once you downloaded the sources, install all the dependencies using NPM:

	sudo npm install

(Optional) Check that everything is installed correctly by running the tests:

	./test/run-tests.js

Install Nice 2 Predict
-------

To install Nice 2 Predict framework please follow the instructions on the https://github.com/eth-srl/2Nice page.
