"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _flowsync = require("flowsync");

var _flowsync2 = _interopRequireDefault(_flowsync);

var _incognito = require("incognito");

var _incognito2 = _interopRequireDefault(_incognito);

var setupFilters = Symbol("setupFilters"),
    setupDynamicProperties = Symbol("setupDynamicProperties"),
    actionNames = Symbol("actionNames"),
    setupFilterProcessor = Symbol("setupFilterProcessor"),
    processFilters = Symbol("processFilters"),
    processBeforeFilters = Symbol("processBeforeFilters"),
    processAfterFilters = Symbol("processAfterFilters"),
    addFilter = Symbol("addFilter"),
    getFilters = Symbol("getFilters");

/**
 * Request/Response controller with filters.
 *
 * @class Controller
 */

var Controller = (function () {

  /**
   * @constructor
   */

  function Controller() {
    for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
      options[_key] = arguments[_key];
    }

    _classCallCheck(this, Controller);

    this[setupDynamicProperties]();
    this[setupFilters]();

    this.prefilters.apply(this, options);
    this.filters.apply(this, options);
    this.setup.apply(this, options);
    this.initialize.apply(this, options);
  }

  _createClass(Controller, [{
    key: "before",

    /**
     * Set a function to be called before the specified action.
     * @method before
     */
    value: function before() {
      for (var _len2 = arguments.length, options = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        options[_key2] = arguments[_key2];
      }

      this[addFilter].apply(this, [(0, _incognito2["default"])(this)._filters.before].concat(options));
    }
  }, {
    key: "after",

    /**
     * Set a function to be called after the specified action.
     */
    value: function after() {
      for (var _len3 = arguments.length, options = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        options[_key3] = arguments[_key3];
      }

      this[addFilter].apply(this, [(0, _incognito2["default"])(this)._filters.after].concat(options));
    }
  }, {
    key: "skip",
    value: function skip() {
      var _this = this;

      for (var _len4 = arguments.length, options = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        options[_key4] = arguments[_key4];
      }

      var filterToAvoid = undefined,
          actionsToAvoid = undefined;

      switch (options.length) {
        case 1:
          //just the filter
          actionsToAvoid = [];
          filterToAvoid = options[0];
          break;
        case 2:
          //action and filter
          actionsToAvoid = options[0];
          filterToAvoid = options[1];
          if (Array.isArray(actionsToAvoid) === false) {
            actionsToAvoid = [actionsToAvoid];
          }
          break;
      }

      var _ = (0, _incognito2["default"])(this);

      _._filters.after.concat(_._filters.before).forEach(function (filterDetails) {
        if (filterDetails.filter === filterToAvoid && actionsToAvoid.length === 0) {
          filterDetails.skip = true;
        } else {
          actionsToAvoid.forEach(function (actionToAvoid) {
            if (filterDetails.filter === filterToAvoid && filterDetails.action === actionToAvoid) {
              filterDetails.skip = true;
            }
          }, _this);
        }
      }, this);
    }
  }, {
    key: "setup",

    //stub functions
    value: function setup() {}
  }, {
    key: "initialize",
    value: function initialize() {}
  }, {
    key: "prefilters",
    value: function prefilters() {}
  }, {
    key: "filters",
    value: function filters() {}
  }, {
    key: addFilter,

    /* Private Methods */
    value: function (owner) {
      var _this2 = this;

      for (var _len5 = arguments.length, options = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
        options[_key5 - 1] = arguments[_key5];
      }

      var filter = null;
      switch (options.length) {
        case 1:
          filter = options[0];
          // Filter to run before all actions, no skip available
          this.actionNames.forEach(function (actionName) {
            owner.push({
              action: _this2[actionName],
              filter: filter
            });
          }, this);
          break;
        case 2:
          if (Array.isArray(options[0])) {
            // A. Filter to run before all actions, with skip available
            var actionArray = options[0];
            filter = options[1];
            actionArray.forEach(function (action) {
              owner.push({
                action: action,
                filter: filter
              });
            }, this);
          } else {
            // B. Filter to run before a specific action, no skip available
            var action = options[0];
            filter = options[1];

            owner.push({
              action: action,
              filter: filter
            });
          }
          break;
      }
    }
  }, {
    key: setupDynamicProperties,
    value: function () {
      Object.defineProperties(this, {
        "actionNames": {
          get: this[actionNames]
        }
      });
    }
  }, {
    key: setupFilters,
    value: function () {
      var _ = (0, _incognito2["default"])(this);
      _._filters = {
        before: [],
        after: []
      };

      this.actionNames.forEach(this[setupFilterProcessor], this);
    }
  }, {
    key: setupFilterProcessor,
    value: function (actionName) {
      var originalAction = this[actionName];
      var self = this;

      this[actionName] = function (request, response) {
        var originalEnd = response.end;
        _flowsync2["default"].series([function beforeFilters(next) {
          self[processBeforeFilters](actionName, request, response, next);
        }, function action(next) {
          var _this3 = this;

          response.end = function () {
            for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
              args[_key6] = arguments[_key6];
            }

            originalEnd.apply.apply(originalEnd, [_this3].concat(args));
            next();
          };
          originalAction(request, response);
        }, function afterFilters(next) {
          self[processAfterFilters](actionName, request, response, next);
        }]);
      };
    }
  }, {
    key: processFilters,
    value: function (filters, request, response, callback) {
      _flowsync2["default"].eachSeries(filters, function processFilter(filterDetails, next) {
        //call filter if not skipped
        if (filterDetails.skip !== true) {
          filterDetails.filter(request, response, next);
        } else {
          next();
        }
      }, function finalizeFilters(errors, results) {
        callback(errors, results);
      });
    }
  }, {
    key: getFilters,
    value: function (action, filterObject) {
      var _this4 = this;

      return filterObject.filter(function (filter) {
        return filter.action === _this4[action];
      });
    }
  }, {
    key: processBeforeFilters,
    value: function (action, request, response, callback) {
      this[processFilters](this[getFilters](action, (0, _incognito2["default"])(this)._filters.before), request, response, callback);
    }
  }, {
    key: processAfterFilters,
    value: function (action, request, response, callback) {
      this[processFilters](this[getFilters](action, (0, _incognito2["default"])(this)._filters.after), request, response, callback);
    }
  }, {
    key: actionNames,
    value: function () {
      return Object.getOwnPropertyNames(this.constructor.prototype).filter(function (propertyName) {
        switch (propertyName) {
          case "constructor":
          case "filters":
          case "initialize":
            break;
          default:
            return propertyName;
        }
      });
    }
  }]);

  return Controller;
})();

exports["default"] = Controller;
module.exports = exports["default"];