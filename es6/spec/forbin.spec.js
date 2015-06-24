import Controller from "../../index";
import flowsync from "flowsync";
import sinon from "sinon";

describe("Controller(...options)", () => {
	describe(".actionNames", () => {
		let clientController;

		class ClientController extends Controller {
			create(request, response) {}
			update(request, response) {}
			delete(request, response) {}
		}

		beforeEach(() => {
			clientController = new ClientController("foo", "bar");
		});

		it("should return an array of action names for extended controllers", () => {
			clientController.actionNames.should.eql(["create", "update", "delete"]);
		});
	});

	describe("(constructor hooks)", () => {
	let clientController,
		prefilterSpy,
		initializeSpy,
		setupSpy,
		filterSpy,
		initializeValues;

	class ApplicationController extends Controller {
		prefilters(...options) {
			prefilterSpy(...options);
		}

		initialize(...options) {
			initializeSpy(...options);
		}

		setup(...options) {
			setupSpy(...options);
		}

		filters(...options) {
			filterSpy(...options);
		}
	}

	class ClientController extends ApplicationController {}

	beforeEach(() => {
		filterSpy = sinon.spy();
		initializeSpy = sinon.spy();
		prefilterSpy = sinon.spy();
		setupSpy = sinon.spy();

		initializeValues = ["foo", "bar"];
		clientController = new ClientController(...initializeValues);
	});

	describe(".initialize(...options)", () => {
		it("should be called during construction", () => {
			initializeSpy.called.should.be.true;
		});

		it("should be called with the constructor values", () => {
			initializeSpy.calledWithExactly(...initializeValues).should.be.true;
		});
	});

	describe(".setup(...options)", () => {
		it("should be called during construction", () => {
			setupSpy.called.should.be.true;
		});

		it("should be called with the constructor values", () => {
			setupSpy.calledWithExactly(...initializeValues).should.be.true;
		});
	});

	describe(".filters(...options)", () => {
		it("should be called during construction", () => {
			filterSpy.called.should.be.true;
		});

		it("should be called with the constructor values", () => {
			filterSpy.calledWithExactly(...initializeValues).should.be.true;
		});
	});

	describe(".prefilters(...options)", () => {
		it("should be called during construction", () => {
			prefilterSpy.called.should.be.true;
		});

		it("should be called with the constructor values", () => {
			prefilterSpy.calledWithExactly(...initializeValues).should.be.true;
		});

		it("should be called before filters", () => {
			sinon.assert.callOrder(prefilterSpy, filterSpy);
		});
	});
	});

	describe("(before and after filters)", () => {
		const logRequest = Symbol(),
			authenticate = Symbol(),
			shredResponse = Symbol(),
			logResponse = Symbol();

		let logRequestSpy,
			clientController,
			createSpy,
			updateSpy,
			deleteSpy,
			authenticateSpy,
			mockRequest,
			mockResponse,
			clock,
			callClientControllerActions,
			logResponseSpy,
			shredResponseSpy;

		class ApplicationController extends Controller {
			filters(...options) {}

			[logRequest] (request, response, next) {
				logRequestSpy(request, response, next);
			}

			[authenticate] (request, response, next) {
				authenticateSpy(request, response, next);
			}

			[logResponse] (request, response, next) {
				logResponseSpy(request, response, next);
			}

			[shredResponse] (request, response, next) {
				shredResponseSpy(request, response, next);
			}
		}

		class ClientController extends ApplicationController {
			update(request, response) {
				updateSpy(request, response);
			}

			create(request, response) {
				createSpy(request, response);
			}

			delete(request, response) {
				deleteSpy(request, response);
			}
		}

		before(() => {
			callClientControllerActions = (controller, callback) => {
				flowsync.series([
					function createAction(next) {
						mockResponse = {
							end: () => {
							}
						};
						controller.create(mockRequest, mockResponse);
						clock.tick(1000);
						next();
					},
					function updateAction(next) {
						mockResponse = {
							end: () => {
							}
						};
						controller.update(mockRequest, mockResponse);
						clock.tick(1000);
						next();
					},
					function deleteAction(next) {
						mockResponse = {
							end: () => {
							}
						};
						controller.delete(mockRequest, mockResponse);
						clock.tick(1000);
						next();
					}],
					callback
				);
			};
		});

		beforeEach(() => {
			clock = sinon.useFakeTimers();

			/* FILTER SPIES */
			logRequestSpy = sinon.spy(function logRequestSpy(request, response, next) {
				next();
			});

			authenticateSpy = sinon.spy(function authenticateSpy(request, response, next) {
				next();
			});

			logResponseSpy = sinon.spy(function logResponseSpy(request, response, next) {
				next();
			});

			shredResponseSpy = sinon.spy(function shredResponseSpy(request, response, next) {
				next();
			});

			/* ACTION SPIES */
			createSpy = sinon.spy(function createSpy(request, response) {
				response.end();
			});

			updateSpy = sinon.spy(function updateSpy(request, response) {
				response.end();
			});

			deleteSpy = sinon.spy(function deleteSpy(request, response) {
				response.end();
			});

			mockRequest = {};

			mockResponse = {
				end: () => {
				}
			};

			clientController = new ClientController("foo", "bar");
		});

		afterEach(() => {
			clock.restore();
		});

		describe(".before(...options)", () => {
			describe("(with just a filter function)", () => {
				beforeEach(() => {
					clientController.before(clientController[logRequest]);
				});

				describe("(before all)", () => {
					it("should call a filter method before create", done => {
						mockResponse = {
							end: () => {
								sinon.assert.callOrder(logRequestSpy, createSpy);
								done();
							}
						};
						clientController.create(mockRequest, mockResponse);
					});

					it("should call a filter method before update", done => {
						mockResponse = {
							end: () => {
								sinon.assert.callOrder(logRequestSpy, updateSpy);
								done();
							}
						};
						clientController.update(mockRequest, mockResponse);
					});

					it("should call a filter method before delete", done => {
						mockResponse = {
							end: () => {
								sinon.assert.callOrder(logRequestSpy, deleteSpy);
								done();
							}
						};
						clientController.delete(mockRequest, mockResponse);
					});
				});

				describe("(order)", () => {
					beforeEach(() => {
						clientController.before(clientController[authenticate]);
					});

					describe("(before all)", () => {
						it("should call a filter before create action in the order they were added", done => {
							mockResponse = {
								end: () => {
									sinon.assert.callOrder(
										logRequestSpy,
										authenticateSpy,
										createSpy);
									done();
								}
							};

							clientController.create(mockRequest, mockResponse);
						});

						it("should call a filter before update action in the order they were added", done => {
							mockResponse = {
								end: () => {
									sinon.assert.callOrder(
										logRequestSpy,
										authenticateSpy,
										updateSpy);
									done();
								}
							};

							clientController.update(mockRequest, mockResponse);
						});

						it("should call a filter before delete action in the order they were added", done => {
							mockResponse = {
								end: () => {
									sinon.assert.callOrder(
										logRequestSpy,
										authenticateSpy,
										deleteSpy);
									done();
								}
							};

							clientController.delete(mockRequest, mockResponse);
						});
					});
				});
			});

			describe("(when calling with the action and the filter)", () => {
				beforeEach(() => {
					clientController.before(clientController.update, clientController[logRequest]);
				});

				describe("(before specific)", () => {
					it("should set a filter method to be called before a specific action", done => {
						mockResponse = {
							end: () => {
								sinon.assert.callOrder(
									logRequestSpy,
									updateSpy);
								done();
							}
						}
						clientController.update(mockRequest, mockResponse);
					});

					it("should set a filter method not to be called before another action", done => {
						mockResponse = {
							end: () => {
								logRequestSpy.called.should.be.false;
								done();
							}
						}
						clientController.create(mockRequest, mockResponse);
					});

					describe("(order)", () => {
						beforeEach(() => {
							clientController.before(clientController.update, clientController[authenticate]);
							clientController.before(clientController.delete, clientController[authenticate]);
							clientController.before(clientController.delete, clientController[logRequest]);
						});

						it("should set a filter method to be called before delete in the order they were added", done => {
							mockResponse = {
								end: () => {
									sinon.assert.callOrder(
										authenticateSpy,
										logRequestSpy,
										deleteSpy);
									done();
								}
							}
							clientController.delete(mockRequest, mockResponse);
						});
					});
				});
			});

			describe("(when calling with an action array and a filter)", () => {
				describe("(before specific array)", () => {
					beforeEach(() => {
						clientController.before([clientController.update, clientController.delete], clientController[logRequest]);
					});

					it("should set a filter method to be called before the create action as provided in the array", done => {
						mockResponse = {
							end: () => {
								sinon.assert.callOrder(createSpy);
								done();
							}
						}
						clientController.create(mockRequest, mockResponse);
					});

					it("should set a filter method to be called before the update action as provided in the array", done => {
						mockResponse = {
							end: () => {
								sinon.assert.callOrder(
									logRequestSpy,
									updateSpy);
								done();
							}
						}
						clientController.update(mockRequest, mockResponse);
					});

					it("should set a filter method to be called before the delete action as provided in the array", done => {
						mockResponse = {
							end: () => {
								sinon.assert.callOrder(
									logRequestSpy,
									deleteSpy);
								done();
							}
						}
						clientController.delete(mockRequest, mockResponse);
					});
				});
			});
		});

		//add sinon tick
		describe(".after(...options)", () => {
			describe("(with just a filter function)", () => {
				beforeEach(() => {
					clientController.after(clientController[logResponse]);
				});

				describe("(after all)", () => {

					it("should call a filter method after create", done => {
						logResponseSpy = sinon.spy(() => {
							sinon.assert.callOrder(createSpy, logResponseSpy);
							done();
						});

						clientController.create(mockRequest, mockResponse);
					});

					it("should call a filter method after update", done => {
						logResponseSpy = sinon.spy(() => {
							sinon.assert.callOrder(updateSpy, logResponseSpy);
							done();
						});
						clientController.update(mockRequest, mockResponse);
					});

					it("should call a filter method after delete", done => {
						logResponseSpy = sinon.spy(() => {
							sinon.assert.callOrder(deleteSpy, logResponseSpy);
							done();
						});
						clientController.delete(mockRequest, mockResponse);
					});
				});

				describe("(order)", () => {
					beforeEach(() => {
						clientController.after(clientController[shredResponse]);
					});

					describe("(after all)", () => {
						it("should call a filter after create action in the order they were added", done => {
							shredResponseSpy = sinon.spy(() => {
								sinon.assert.callOrder(createSpy, logResponseSpy, shredResponseSpy);
								done();
							});

							clientController.create(mockRequest, mockResponse);
						});
					});
				});
			});

			describe("(when calling with the action and the filter)", () => {
				beforeEach(() => {
					clientController.after(clientController.update, clientController[logResponse]);
				});

				it("should set a filter method to be called after the specified action", done => {
					logResponseSpy = sinon.spy(() => {
						sinon.assert.callOrder(updateSpy, logResponseSpy);
						done();
					});
					clientController.update(mockRequest, mockResponse);
				});

				describe("(order)", () => {
					beforeEach(() => {
						clientController.after(clientController.update, clientController[shredResponse]);
						clientController.after(clientController.delete, clientController[shredResponse]);
						clientController.after(clientController.delete, clientController[logResponse]);
					});

					it("should set a filter method to be called after a specific action in the order they were added", done => {
						logResponseSpy = sinon.spy(() => {
							sinon.assert.callOrder(deleteSpy, shredResponseSpy, logResponseSpy);
							done();
						});
						clientController.delete(mockRequest, mockResponse);
					});
				});
			});

			describe("(when calling with an action array and a filter)", () => {
				beforeEach(() => {
					clientController.after([clientController.update, clientController.delete], clientController[logResponse]);
				});

				it("should set a filter method to be called after the delete action provided in the array", done => {
					logResponseSpy = sinon.spy(() => {
						sinon.assert.callOrder(deleteSpy, logResponseSpy);
						done();
					});
					clientController.delete(mockRequest, mockResponse);
				});

				it("should set a filter method to be called after the delete action provided in the array", done => {
					logResponseSpy = sinon.spy(() => {
						sinon.assert.callOrder(updateSpy, logResponseSpy);
						done();
					});
					clientController.update(mockRequest, mockResponse);
				});
			});
		});

		describe(".skip(...options)", () => {
			describe("(with just the filter)", () => {
				describe("(when was applied to all)", () => {
					beforeEach(() => {
						clientController.before(clientController[logRequest]);
						clientController.before(clientController[logResponse]);
						clientController.skip(clientController[logRequest]);
						clientController.skip(clientController[logResponse]);
					});

					it("should skip a filter applied to all actions", done => {
						callClientControllerActions(
							clientController,
							() => {
								(logRequestSpy.called && logResponse.called).should.be.false;
								done();
							}
						);
					});
				});

				describe("(when was applied to just one)", () => {
					beforeEach(() => {
						clientController.before(clientController.update, clientController[logRequest]);
						clientController.before(clientController.delete, clientController[logResponse]);
						clientController.skip(clientController[logRequest]);
						clientController.skip(clientController[logResponse]);
					});

					it("should skip a filter applied to one action", done => {
						callClientControllerActions(
							clientController,
							() => {
								(logRequestSpy.called && logResponse.called).should.be.false;
								done();
							}
						);
					});
				});
			});

			describe("(with the specific action to skip the filter)", () => {

				describe("(when initially applied to all)", () => {
					beforeEach(() => {
						clientController.before(clientController[logRequest]);
						clientController.skip(clientController.update, clientController[logRequest]);
					});

					it("should skip the filter applied to all just for that action", done => {
						callClientControllerActions(
							clientController,
							() => {
								logRequestSpy.callCount.should.equals(2);
								done();
							}
						);
					});
				});

				describe("(when initially applied to a specific action)", () => {
					beforeEach(() => {
						clientController.before(clientController.update, clientController[logRequest]);
						clientController.skip(clientController.update, clientController[logRequest]);
					});

					it("should skip the filter applied to that specific action", done => {
						callClientControllerActions(
							clientController,
							() => {
								logRequestSpy.called.should.be.false;
								done();
							}
						);
					});
				});

				describe("(when skip an array of actions)", () => {
					beforeEach(() => {
						clientController.before(clientController[logRequest]);
						clientController.skip([clientController.update, clientController.delete], clientController[logRequest]);
					});

					it("should skip the filter applied to that specific action", done => {
						callClientControllerActions(
							clientController,
							() => {
								logRequestSpy.callCount.should.equals(1);
								done();
							}
						);
					});
				});
			});
		});
	});
});
