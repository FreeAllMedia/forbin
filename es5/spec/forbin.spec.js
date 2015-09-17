"use strict";

var _bind = Function.prototype.bind;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _index = require("../../index");

var _index2 = _interopRequireDefault(_index);

var _flowsync = require("flowsync");

var _flowsync2 = _interopRequireDefault(_flowsync);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

describe("Controller(...options)", function () {
	describe(".actionNames", function () {
		var clientController = undefined;

		var ClientController = (function (_Controller) {
			function ClientController() {
				_classCallCheck(this, ClientController);

				if (_Controller != null) {
					_Controller.apply(this, arguments);
				}
			}

			_inherits(ClientController, _Controller);

			_createClass(ClientController, [{
				key: "create",
				value: function create() {}
			}, {
				key: "update",
				value: function update() {}
			}, {
				key: "delete",
				value: function _delete() {}
			}]);

			return ClientController;
		})(_index2["default"]);

		beforeEach(function () {
			clientController = new ClientController("foo", "bar");
		});

		it("should return an array of action names for extended controllers", function () {
			clientController.actionNames.should.eql(["create", "update", "delete"]);
		});
	});

	describe("(constructor hooks)", function () {
		var clientController = undefined,
		    prefilterSpy = undefined,
		    initializeSpy = undefined,
		    setupSpy = undefined,
		    filterSpy = undefined,
		    initializeValues = undefined;

		var ApplicationController = (function (_Controller2) {
			function ApplicationController() {
				_classCallCheck(this, ApplicationController);

				if (_Controller2 != null) {
					_Controller2.apply(this, arguments);
				}
			}

			_inherits(ApplicationController, _Controller2);

			_createClass(ApplicationController, [{
				key: "prefilters",
				value: function prefilters() {
					for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
						options[_key] = arguments[_key];
					}

					prefilterSpy.apply(undefined, options);
				}
			}, {
				key: "initialize",
				value: function initialize() {
					for (var _len2 = arguments.length, options = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
						options[_key2] = arguments[_key2];
					}

					initializeSpy.apply(undefined, options);
				}
			}, {
				key: "setup",
				value: function setup() {
					for (var _len3 = arguments.length, options = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
						options[_key3] = arguments[_key3];
					}

					setupSpy.apply(undefined, options);
				}
			}, {
				key: "filters",
				value: function filters() {
					for (var _len4 = arguments.length, options = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
						options[_key4] = arguments[_key4];
					}

					filterSpy.apply(undefined, options);
				}
			}]);

			return ApplicationController;
		})(_index2["default"]);

		var ClientController = (function (_ApplicationController) {
			function ClientController() {
				_classCallCheck(this, ClientController);

				if (_ApplicationController != null) {
					_ApplicationController.apply(this, arguments);
				}
			}

			_inherits(ClientController, _ApplicationController);

			return ClientController;
		})(ApplicationController);

		beforeEach(function () {
			filterSpy = _sinon2["default"].spy();
			initializeSpy = _sinon2["default"].spy();
			prefilterSpy = _sinon2["default"].spy();
			setupSpy = _sinon2["default"].spy();

			initializeValues = ["foo", "bar"];
			clientController = new (_bind.apply(ClientController, [null].concat(_toConsumableArray(initializeValues))))();
		});

		describe(".initialize(...options)", function () {
			it("should be called during construction", function () {
				initializeSpy.called.should.be["true"];
			});

			it("should be called with the constructor values", function () {
				initializeSpy.calledWithExactly.apply(initializeSpy, _toConsumableArray(initializeValues)).should.be["true"];
			});
		});

		describe(".setup(...options)", function () {
			it("should be called during construction", function () {
				setupSpy.called.should.be["true"];
			});

			it("should be called with the constructor values", function () {
				setupSpy.calledWithExactly.apply(setupSpy, _toConsumableArray(initializeValues)).should.be["true"];
			});
		});

		describe(".filters(...options)", function () {
			it("should be called during construction", function () {
				filterSpy.called.should.be["true"];
			});

			it("should be called with the constructor values", function () {
				filterSpy.calledWithExactly.apply(filterSpy, _toConsumableArray(initializeValues)).should.be["true"];
			});
		});

		describe(".prefilters(...options)", function () {
			it("should be called during construction", function () {
				prefilterSpy.called.should.be["true"];
			});

			it("should be called with the constructor values", function () {
				prefilterSpy.calledWithExactly.apply(prefilterSpy, _toConsumableArray(initializeValues)).should.be["true"];
			});

			it("should be called before filters", function () {
				_sinon2["default"].assert.callOrder(prefilterSpy, filterSpy);
			});
		});
	});

	describe("(before and after filters)", function () {
		var logRequest = Symbol(),
		    authenticate = Symbol(),
		    shredResponse = Symbol(),
		    logResponse = Symbol();

		var logRequestSpy = undefined,
		    clientController = undefined,
		    createSpy = undefined,
		    updateSpy = undefined,
		    deleteSpy = undefined,
		    authenticateSpy = undefined,
		    mockRequest = undefined,
		    mockResponse = undefined,
		    clock = undefined,
		    callClientControllerActions = undefined,
		    logResponseSpy = undefined,
		    shredResponseSpy = undefined;

		var ApplicationController = (function (_Controller3) {
			function ApplicationController() {
				_classCallCheck(this, ApplicationController);

				if (_Controller3 != null) {
					_Controller3.apply(this, arguments);
				}
			}

			_inherits(ApplicationController, _Controller3);

			_createClass(ApplicationController, [{
				key: "filters",
				value: function filters() {
					for (var _len5 = arguments.length, options = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
						options[_key5] = arguments[_key5];
					}
				}
			}, {
				key: logRequest,
				value: function (request, response, next) {
					logRequestSpy(request, response, next);
				}
			}, {
				key: authenticate,
				value: function (request, response, next) {
					authenticateSpy(request, response, next);
				}
			}, {
				key: logResponse,
				value: function (request, response, next) {
					logResponseSpy(request, response, next);
				}
			}, {
				key: shredResponse,
				value: function (request, response, next) {
					shredResponseSpy(request, response, next);
				}
			}]);

			return ApplicationController;
		})(_index2["default"]);

		var ClientController = (function (_ApplicationController2) {
			function ClientController() {
				_classCallCheck(this, ClientController);

				if (_ApplicationController2 != null) {
					_ApplicationController2.apply(this, arguments);
				}
			}

			_inherits(ClientController, _ApplicationController2);

			_createClass(ClientController, [{
				key: "update",
				value: function update(request, response) {
					updateSpy(request, response);
				}
			}, {
				key: "create",
				value: function create(request, response) {
					createSpy(request, response);
				}
			}, {
				key: "delete",
				value: function _delete(request, response) {
					deleteSpy(request, response);
				}
			}]);

			return ClientController;
		})(ApplicationController);

		before(function () {
			callClientControllerActions = function (controller, callback) {
				_flowsync2["default"].series([function createAction(next) {
					mockResponse = {
						end: function end() {}
					};
					controller.create(mockRequest, mockResponse);
					clock.tick(1000);
					next();
				}, function updateAction(next) {
					mockResponse = {
						end: function end() {}
					};
					controller.update(mockRequest, mockResponse);
					clock.tick(1000);
					next();
				}, function deleteAction(next) {
					mockResponse = {
						end: function end() {}
					};
					controller["delete"](mockRequest, mockResponse);
					clock.tick(1000);
					next();
				}], callback);
			};
		});

		beforeEach(function () {
			clock = _sinon2["default"].useFakeTimers();

			/* FILTER SPIES */
			logRequestSpy = _sinon2["default"].spy(function logRequestSpy(request, response, next) {
				next();
			});

			authenticateSpy = _sinon2["default"].spy(function authenticateSpy(request, response, next) {
				next();
			});

			logResponseSpy = _sinon2["default"].spy(function logResponseSpy(request, response, next) {
				next();
			});

			shredResponseSpy = _sinon2["default"].spy(function shredResponseSpy(request, response, next) {
				next();
			});

			/* ACTION SPIES */
			createSpy = _sinon2["default"].spy(function createSpy(request, response) {
				response.end();
			});

			updateSpy = _sinon2["default"].spy(function updateSpy(request, response) {
				response.end();
			});

			deleteSpy = _sinon2["default"].spy(function deleteSpy(request, response) {
				response.end();
			});

			mockRequest = {};

			mockResponse = {
				end: function end() {}
			};

			clientController = new ClientController("foo", "bar");
		});

		afterEach(function () {
			clock.restore();
		});

		describe(".before(...options)", function () {
			describe("(with just a filter function)", function () {
				beforeEach(function () {
					clientController.before(clientController[logRequest]);
				});

				describe("(before all)", function () {
					it("should call a filter method before create", function (done) {
						mockResponse = {
							end: function end() {
								_sinon2["default"].assert.callOrder(logRequestSpy, createSpy);
								done();
							}
						};
						clientController.create(mockRequest, mockResponse);
					});

					it("should call a filter method before update", function (done) {
						mockResponse = {
							end: function end() {
								_sinon2["default"].assert.callOrder(logRequestSpy, updateSpy);
								done();
							}
						};
						clientController.update(mockRequest, mockResponse);
					});

					it("should call a filter method before delete", function (done) {
						mockResponse = {
							end: function end() {
								_sinon2["default"].assert.callOrder(logRequestSpy, deleteSpy);
								done();
							}
						};
						clientController["delete"](mockRequest, mockResponse);
					});
				});

				describe("(order)", function () {
					beforeEach(function () {
						clientController.before(clientController[authenticate]);
					});

					describe("(before all)", function () {
						it("should call a filter before create action in the order they were added", function (done) {
							mockResponse = {
								end: function end() {
									_sinon2["default"].assert.callOrder(logRequestSpy, authenticateSpy, createSpy);
									done();
								}
							};

							clientController.create(mockRequest, mockResponse);
						});

						it("should call a filter before update action in the order they were added", function (done) {
							mockResponse = {
								end: function end() {
									_sinon2["default"].assert.callOrder(logRequestSpy, authenticateSpy, updateSpy);
									done();
								}
							};

							clientController.update(mockRequest, mockResponse);
						});

						it("should call a filter before delete action in the order they were added", function (done) {
							mockResponse = {
								end: function end() {
									_sinon2["default"].assert.callOrder(logRequestSpy, authenticateSpy, deleteSpy);
									done();
								}
							};

							clientController["delete"](mockRequest, mockResponse);
						});
					});
				});
			});

			describe("(when calling with the action and the filter)", function () {
				beforeEach(function () {
					clientController.before(clientController.update, clientController[logRequest]);
				});

				describe("(before specific)", function () {
					it("should set a filter method to be called before a specific action", function (done) {
						mockResponse = {
							end: function end() {
								_sinon2["default"].assert.callOrder(logRequestSpy, updateSpy);
								done();
							}
						};
						clientController.update(mockRequest, mockResponse);
					});

					it("should set a filter method not to be called before another action", function (done) {
						mockResponse = {
							end: function end() {
								logRequestSpy.called.should.be["false"];
								done();
							}
						};
						clientController.create(mockRequest, mockResponse);
					});

					describe("(order)", function () {
						beforeEach(function () {
							clientController.before(clientController.update, clientController[authenticate]);
							clientController.before(clientController["delete"], clientController[authenticate]);
							clientController.before(clientController["delete"], clientController[logRequest]);
						});

						it("should set a filter method to be called before delete in the order they were added", function (done) {
							mockResponse = {
								end: function end() {
									_sinon2["default"].assert.callOrder(authenticateSpy, logRequestSpy, deleteSpy);
									done();
								}
							};
							clientController["delete"](mockRequest, mockResponse);
						});
					});
				});
			});

			describe("(when calling with an action array and a filter)", function () {
				describe("(before specific array)", function () {
					beforeEach(function () {
						clientController.before([clientController.update, clientController["delete"]], clientController[logRequest]);
					});

					it("should set a filter method to be called before the create action as provided in the array", function (done) {
						mockResponse = {
							end: function end() {
								_sinon2["default"].assert.callOrder(createSpy);
								done();
							}
						};
						clientController.create(mockRequest, mockResponse);
					});

					it("should set a filter method to be called before the update action as provided in the array", function (done) {
						mockResponse = {
							end: function end() {
								_sinon2["default"].assert.callOrder(logRequestSpy, updateSpy);
								done();
							}
						};
						clientController.update(mockRequest, mockResponse);
					});

					it("should set a filter method to be called before the delete action as provided in the array", function (done) {
						mockResponse = {
							end: function end() {
								_sinon2["default"].assert.callOrder(logRequestSpy, deleteSpy);
								done();
							}
						};
						clientController["delete"](mockRequest, mockResponse);
					});
				});
			});
		});

		//add sinon tick
		describe(".after(...options)", function () {
			describe("(with just a filter function)", function () {
				beforeEach(function () {
					clientController.after(clientController[logResponse]);
				});

				describe("(after all)", function () {

					it("should call a filter method after create", function (done) {
						logResponseSpy = _sinon2["default"].spy(function () {
							_sinon2["default"].assert.callOrder(createSpy, logResponseSpy);
							done();
						});

						clientController.create(mockRequest, mockResponse);
					});

					it("should call a filter method after update", function (done) {
						logResponseSpy = _sinon2["default"].spy(function () {
							_sinon2["default"].assert.callOrder(updateSpy, logResponseSpy);
							done();
						});
						clientController.update(mockRequest, mockResponse);
					});

					it("should call a filter method after delete", function (done) {
						logResponseSpy = _sinon2["default"].spy(function () {
							_sinon2["default"].assert.callOrder(deleteSpy, logResponseSpy);
							done();
						});
						clientController["delete"](mockRequest, mockResponse);
					});
				});

				describe("(order)", function () {
					beforeEach(function () {
						clientController.after(clientController[shredResponse]);
					});

					describe("(after all)", function () {
						it("should call a filter after create action in the order they were added", function (done) {
							shredResponseSpy = _sinon2["default"].spy(function () {
								_sinon2["default"].assert.callOrder(createSpy, logResponseSpy, shredResponseSpy);
								done();
							});

							clientController.create(mockRequest, mockResponse);
						});
					});
				});
			});

			describe("(when calling with the action and the filter)", function () {
				beforeEach(function () {
					clientController.after(clientController.update, clientController[logResponse]);
				});

				it("should set a filter method to be called after the specified action", function (done) {
					logResponseSpy = _sinon2["default"].spy(function () {
						_sinon2["default"].assert.callOrder(updateSpy, logResponseSpy);
						done();
					});
					clientController.update(mockRequest, mockResponse);
				});

				describe("(order)", function () {
					beforeEach(function () {
						clientController.after(clientController.update, clientController[shredResponse]);
						clientController.after(clientController["delete"], clientController[shredResponse]);
						clientController.after(clientController["delete"], clientController[logResponse]);
					});

					it("should set a filter method to be called after a specific action in the order they were added", function (done) {
						logResponseSpy = _sinon2["default"].spy(function () {
							_sinon2["default"].assert.callOrder(deleteSpy, shredResponseSpy, logResponseSpy);
							done();
						});
						clientController["delete"](mockRequest, mockResponse);
					});
				});
			});

			describe("(when calling with an action array and a filter)", function () {
				beforeEach(function () {
					clientController.after([clientController.update, clientController["delete"]], clientController[logResponse]);
				});

				it("should set a filter method to be called after the delete action provided in the array", function (done) {
					logResponseSpy = _sinon2["default"].spy(function () {
						_sinon2["default"].assert.callOrder(deleteSpy, logResponseSpy);
						done();
					});
					clientController["delete"](mockRequest, mockResponse);
				});

				it("should set a filter method to be called after the delete action provided in the array", function (done) {
					logResponseSpy = _sinon2["default"].spy(function () {
						_sinon2["default"].assert.callOrder(updateSpy, logResponseSpy);
						done();
					});
					clientController.update(mockRequest, mockResponse);
				});
			});
		});

		describe(".skip(...options)", function () {
			describe("(with just the filter)", function () {
				describe("(when was applied to all)", function () {
					beforeEach(function () {
						clientController.before(clientController[logRequest]);
						clientController.before(clientController[logResponse]);
						clientController.skip(clientController[logRequest]);
						clientController.skip(clientController[logResponse]);
					});

					it("should skip a filter applied to all actions", function (done) {
						callClientControllerActions(clientController, function () {
							(logRequestSpy.called && logResponse.called).should.be["false"];
							done();
						});
					});
				});

				describe("(when was applied to just one)", function () {
					beforeEach(function () {
						clientController.before(clientController.update, clientController[logRequest]);
						clientController.before(clientController["delete"], clientController[logResponse]);
						clientController.skip(clientController[logRequest]);
						clientController.skip(clientController[logResponse]);
					});

					it("should skip a filter applied to one action", function (done) {
						callClientControllerActions(clientController, function () {
							(logRequestSpy.called && logResponse.called).should.be["false"];
							done();
						});
					});
				});
			});

			describe("(with the specific action to skip the filter)", function () {

				describe("(when initially applied to all)", function () {
					beforeEach(function () {
						clientController.before(clientController[logRequest]);
						clientController.skip(clientController.update, clientController[logRequest]);
					});

					it("should skip the filter applied to all just for that action", function (done) {
						callClientControllerActions(clientController, function () {
							logRequestSpy.callCount.should.equals(2);
							done();
						});
					});
				});

				describe("(when initially applied to a specific action)", function () {
					beforeEach(function () {
						clientController.before(clientController.update, clientController[logRequest]);
						clientController.skip(clientController.update, clientController[logRequest]);
					});

					it("should skip the filter applied to that specific action", function (done) {
						callClientControllerActions(clientController, function () {
							logRequestSpy.called.should.be["false"];
							done();
						});
					});
				});

				describe("(when skip an array of actions)", function () {
					beforeEach(function () {
						clientController.before(clientController[logRequest]);
						clientController.skip([clientController.update, clientController["delete"]], clientController[logRequest]);
					});

					it("should skip the filter applied to that specific action", function (done) {
						callClientControllerActions(clientController, function () {
							logRequestSpy.callCount.should.equals(1);
							done();
						});
					});
				});
			});
		});

		describe("(binding)", function () {
			var clean = Symbol("clean"),
			    throwIt = Symbol("throwIt"),
			    actionSpy = undefined,
			    actionObject = undefined,
			    beforeFilterSpy = undefined,
			    afterFilterSpy = undefined,
			    beforeFilterObject = undefined,
			    afterFilterObject = undefined,
			    appleController = undefined;

			var AppleController = (function (_Controller4) {
				function AppleController() {
					_classCallCheck(this, AppleController);

					if (_Controller4 != null) {
						_Controller4.apply(this, arguments);
					}
				}

				_inherits(AppleController, _Controller4);

				_createClass(AppleController, [{
					key: "filters",
					value: function filters() {
						this.before(this[clean]);
						this.after(this[throwIt]);
					}
				}, {
					key: clean,
					value: function (request, response, next) {
						beforeFilterSpy(this);
						next();
					}
				}, {
					key: throwIt,
					value: function (request, response, next) {
						afterFilterSpy(this);
						next();
					}
				}, {
					key: "eat",
					value: function eat(request, response) {
						actionSpy(this);
						response.end();
					}
				}]);

				return AppleController;
			})(_index2["default"]);

			before(function (done) {
				actionSpy = _sinon2["default"].spy(function (object) {
					actionObject = object;
				});

				beforeFilterSpy = _sinon2["default"].spy(function (object) {
					beforeFilterObject = object;
				});

				afterFilterSpy = _sinon2["default"].spy(function (object) {
					afterFilterObject = object;
				});

				appleController = new AppleController();
				appleController.eat({}, { end: done });
			});

			it("should allow to access this on the action", function () {
				actionObject.should.eql(appleController);
			});

			it("should allow to access this on the before filter", function () {
				beforeFilterObject.should.eql(appleController);
			});

			it("should allow to access this on the after filter", function () {
				afterFilterObject.should.eql(appleController);
			});
		});
	});
});