import flowsync from "flowsync";
import privateData from "incognito";

const setupFilters = Symbol("setupFilters"),
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
export default class Controller {

  /**
   * @constructor
   */
  constructor(...options) {
    this[setupDynamicProperties]();
    this[setupFilters]();

    this.prefilters(...options);
    this.filters(...options);
    this.setup(...options);
    this.initialize(...options);
  }

  /**
   * Set a function to be called before the specified action.
   * @method before
   */
  before(...options) {
    this[addFilter](privateData(this)._filters.before, ...options);
  }

  /**
   * Set a function to be called after the specified action.
   */
  after(...options) {
    this[addFilter](privateData(this)._filters.after, ...options);
  }

  skip(...options) {
    let filterToAvoid,
      actionsToAvoid;

    switch(options.length) {
      case 1:
        //just the filter
        actionsToAvoid = [];
        filterToAvoid = options[0];
      break;
      case 2:
        //action and filter
        actionsToAvoid = options[0];
        filterToAvoid = options[1];
        if(Array.isArray(actionsToAvoid) === false) {
          actionsToAvoid = [actionsToAvoid];
        }
      break;
    }

    const _ = privateData(this);

    _._filters.after.concat(_._filters.before).forEach(
      (filterDetails) => {
        if(filterDetails.filter === filterToAvoid && actionsToAvoid.length === 0) {
          filterDetails.skip = true;
        } else {
          actionsToAvoid.forEach(
            (actionToAvoid) => {
              if(filterDetails.filter === filterToAvoid
                && filterDetails.action === actionToAvoid) {
                filterDetails.skip = true;
              }
            },
            this
          );
        }
      },
      this
    );
  }

  //stub functions
  setup() {}
  initialize() {}
  prefilters() {}
  filters () {}

  /* Private Methods */
  [addFilter](owner, ...options) {
    let filter = null;
    switch(options.length) {
      case 1:
        filter = options[0];
        // Filter to run before all actions, no skip available
        this.actionNames.forEach((actionName) => {
          owner.push({
            action: this[actionName],
            filter: filter
          });
        }, this);
        break;
      case 2:
        if (Array.isArray(options[0])) {
          // A. Filter to run before all actions, with skip available
          const actionArray = options[0];
          filter = options[1];
          actionArray.forEach((action) => {
            owner.push({
              action: action,
              filter: filter
            });
          }, this);
        } else {
          // B. Filter to run before a specific action, no skip available
          const action = options[0];
          filter = options[1];

          owner.push({
            action: action,
            filter: filter
          });
        }
        break;
    }
  }

  [setupDynamicProperties]() {
    Object.defineProperties(
      this,
      {
        "actionNames": {
          get: this[actionNames]
        }
      }
    );
  }

  [setupFilters]() {
    const _ = privateData(this);
    _._filters = {
      before: [],
      after: []
    };

    this.actionNames.forEach(this[setupFilterProcessor], this);
  }

  [setupFilterProcessor](actionName) {
    const originalAction = this[actionName];
    const self = this;

    this[actionName] = (request, response) => {
      let originalEnd;
      if(response && response.end) {
         originalEnd = response.end;
      }

      flowsync.series([
        function beforeFilters(next) {
          self[processBeforeFilters].call(self,
            actionName,
            request,
            response,
            next
          );
        },
        function action(next) {
          if(originalEnd) {
            response.end = (...args) => {
              originalEnd.apply(self, ...args);
              next();
            };
          }

          originalAction.call(self, request, response);
        },
        function afterFilters(next) {
          self[processAfterFilters].call(self,
            actionName,
            request,
            response,
            next
          );
        }
      ]);
    };

  }

  [processFilters](filters, request, response, callback) {
    const self = this;
    flowsync.eachSeries(
      filters,
      function processFilter(filterDetails, next) {
        //call filter if not skipped
        if(filterDetails.skip !== true) {
          filterDetails.filter.call(self, request, response, next);
        } else {
          next();
        }
      },
      function finalizeFilters(errors, results) {
        callback(errors, results);
      }
    );
  }

  [getFilters](action, filterObject) {
    return filterObject.filter((filter) => {
      return (filter.action === this[action]);
    });
  }

  [processBeforeFilters](action, request, response, callback) {
    this[processFilters](this[getFilters](action, privateData(this)._filters.before), request, response, callback);
  }

  [processAfterFilters](action, request, response, callback) {
    this[processFilters](this[getFilters](action, privateData(this)._filters.after), request, response, callback);
  }

  [actionNames]() {
    return Object.getOwnPropertyNames(this.constructor.prototype).filter((propertyName) => {
      switch(propertyName){
        case "constructor":
        case "filters":
        case "initialize":
          break;
        default:
          return propertyName;
      }
    });
  }
}
