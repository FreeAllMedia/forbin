# Forbin.js [![npm version](https://img.shields.io/npm/v/forbin.svg)](https://www.npmjs.com/package/forbin) [![license type](https://img.shields.io/npm/l/forbin.svg)](https://github.com/FreeAllMedia/forbin.git/blob/master/LICENSE) [![npm downloads](https://img.shields.io/npm/dm/forbin.svg)](https://www.npmjs.com/package/forbin) ![ECMAScript 6](https://img.shields.io/badge/ECMAScript-6-red.svg)

ES6 Component for controllers with filter support.

```javascript
import Controller from "forbin";

const logRequest = Symbol(),
	authenticate = Symbol(),
	logResponse = Symbol();

class ApplicationController extends Controller {
	filters(...options) {
		this.before(this[logRequest]);
		this.before([this.changePassword, this.changeUsername], this[authenticate]);
		this.after(this.changePassword, this[logResponse]);
		this.skip(this.changePassword, this[logRequest]);
	}

	[logRequest](request, response, next) {
		//log request before every action on the controller
		next();
	}

	[logResponse](request, response, next) {
		//log response after some action
		next();
	}

	[authenticate](request, response, next) {
		//authenticate user
		next();
	}

	changeUsername(request, response) {
		//here the request is logged and the client authenticated
		//do your action and send the response
	}

	changePassword(request, response) {
		//here the client is authenticated but the log skipped
		//do your action and send the response
		//after this action the response will be logged
	}

	getInfo(request, response) {
		//here the request is logged but is a public operation
		//do your action and send the response
	}
}
```

# Quality and Compatibility

[![Build Status](https://travis-ci.org/FreeAllMedia/forbin.png?branch=master)](https://travis-ci.org/FreeAllMedia/forbin) [![Coverage Status](https://coveralls.io/repos/FreeAllMedia/forbin/badge.svg)](https://coveralls.io/r/FreeAllMedia/forbin) [![Code Climate](https://codeclimate.com/github/FreeAllMedia/forbin/badges/gpa.svg)](https://codeclimate.com/github/FreeAllMedia/forbin) [![Dependency Status](https://david-dm.org/FreeAllMedia/forbin.png?theme=shields.io)](https://david-dm.org/FreeAllMedia/forbin?theme=shields.io) [![Dev Dependency Status](https://david-dm.org/FreeAllMedia/forbin/dev-status.svg)](https://david-dm.org/FreeAllMedia/forbin?theme=shields.io#info=devDependencies)

*Every single build and release is automatically tested on the following platforms:*

![node 0.12.x](https://img.shields.io/badge/node-0.12.x-brightgreen.svg) ![node 0.11.x](https://img.shields.io/badge/node-0.11.x-brightgreen.svg) ![node 0.10.x](https://img.shields.io/badge/node-0.10.x-brightgreen.svg)
![iojs 2.x.x](https://img.shields.io/badge/iojs-2.x.x-brightgreen.svg) ![iojs 1.x.x](https://img.shields.io/badge/iojs-1.x.x-brightgreen.svg)

<!--
[![Sauce Test Status](https://saucelabs.com/browser-matrix/forbin.svg)](https://saucelabs.com/u/forbin)
-->

*If your platform is not listed above, you can test your local environment for compatibility by copying and pasting the following commands into your terminal:*

```
npm install forbin
cd node_modules/forbin
gulp test-local
```

# Installation

Copy and paste the following command into your terminal to install Forbin:

```
npm install forbin --save
```

## Import / Require

```
// ES6
import Controller from "forbin";
```

```
// ES5
var Controller = require("forbin");
```

```
// Require.js
define(["require"] , function (require) {
    var Controller = require("forbin");
});
```

# Getting Started

## Using it

You should extend the base Controller provided within forbin in order to apply filters and take advantage of the provided functionality.

As the above example shows, you can define a specific filter to every action on the controller, to a specific one, or to an array of actions.

There are three filter functions available right now:
* before
* after
* skip

All those functions share the same interface:

```javascript
before(filterToApply); //this will apply a before filter to all actions
before(functionToApplyTheFilterTo, filterToApply); //this will apply a before filter to a specific action
before(arrayOfFunctionsToApplyTheFilterTo, filterToApply); //this will apply the filter to the provided array of actions

after(filterToApply); //this will apply an after filter to all actions
after(functionToApplyTheFilterTo, filterToApply); //this will apply an after filter to a specific action
after(arrayOfFunctionsToApplyTheFilterTo, filterToApply); //this will apply the filter to the provided array of actions

skip(filterToApply); //this will skip a filter on all actions
skip(functionToApplyTheFilterTo, filterToApply); //this will skip a filter on a specific action
skip(arrayOfFunctionsToApplyTheFilterTo, filterToApply); //this will skip the filter on the provided array of actions
```


# How to Contribute

See something that could use improvement? Have a great feature idea? We listen!

You can submit your ideas through our [issues system](https://github.com/FreeAllMedia/forbin/issues), or make the modifications yourself and submit them to us in the form of a [GitHub pull request](https://help.github.com/articles/using-pull-requests/).

We always aim to be friendly and helpful.

## Running Tests

It's easy to run the test suite locally, and *highly recommended* if you're using Forbin.js on a platform we aren't automatically testing for.

```
npm test
```

<!--
### SauceLabs Credentials

We've setup our tests to automatically detect whether or not you have our saucelabs credentials installed in your environment (`process.env.SAUCE_USERNAME`).

If our saucelabs credentials are not installed, the tests are setup to automatically detect all browsers you have installed on your local system, then use them to run the tests.

#### Obtaining Our SauceLabs Credentials

If you'd like to develop Forbin.js using SauceLabs, you need only create a new entry in our [issue tracker](https://github.com/FreeAllMedia/forbin/issues) asking for our SauceLabs credentials.

We'll send over all credentials specific to this project so that you can perform comprehensive cross-platform tests.


## Public Shared Floobits Workspace

Whenever we're working on Forbin.js, we connect to a public workspace on FlooBits that lets you see and interact with the developers. Feel free to stop by, say hello, and offer suggestions!

https://floobits.com/FreeAllMedia/forbin
-->
