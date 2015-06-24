import flowsync from "flowsync";

const setupFilters = Symbol("setupFilters"),
    setupDynamicProperties = Symbol("setupDynamicProperties"),
    actionNames = Symbol("actionNames"),
    setupFilterProcessor = Symbol("setupFilterProcessor"),
    processFilters = Symbol("processFilters"),
    processBeforeFilters = Symbol("processBeforeFilters"),
    processAfterFilters = Symbol("processAfterFilters"),
    actions = Symbol("actions"),
    addFilter = Symbol("addFilter");

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
    this[addFilter](this._filters.before, ...options);
  }

  /**
   * Set a function to be called after the specified action.
   */
  after(...options) {
    this[addFilter](this._filters.after, ...options);
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

    this._filters.after.concat(this._filters.before).forEach(
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
    switch(options.length) {
      case 1:
        const filter = options[0];
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
          const   actionArray = options[0],
              filter = options[1];
          actionArray.forEach((action) => {
            owner.push({
              action: action,
              filter: filter
            });
          }, this);
        } else {
          // B. Filter to run before a specific action, no skip available
          const   action = options[0],
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
    Object.defineProperties(
      this,
      {
        "_filters": {
          writable: true,
          enumerable: false,
          value: {
            before: [],
            after: []
          }
        }
      }
    );

    this.actionNames.forEach(this[setupFilterProcessor], this);
  }

  [setupFilterProcessor](actionName) {
    const originalAction = this[actionName];
    const self = this;

    this[actionName] = (request, response) => {
      const originalEnd = response.end;
      flowsync.series([
        function beforeFilters(next) {
          self[processBeforeFilters](
            actionName,
            request,
            response,
            next
          );
        },
        function action(next) {
          response.end = (...args) => {
            originalEnd.apply(this, ...args);
            next();
          };
          originalAction(request, response);
        },
        function afterFilters(next) {
          self[processAfterFilters](
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
    flowsync.eachSeries(
      filters,
      function processFilter(filterDetails, next) {
        //call filter if not skipped
        if(filterDetails.skip !== true) {
          filterDetails.filter(request, response, next);
        } else {
          next();
        }
      },
      function finalizeFilters(errors, results) {
        callback(errors, results);
      }
    );
  }

  [processBeforeFilters](action, request, response, callback) {
    const applicableFilters = this._filters.before.filter((filter) => {
      return (filter.action === this[action]);
    });
    this[processFilters](applicableFilters, request, response, callback);
  }

  [processAfterFilters](action, request, response, callback) {
    const applicableFilters = this._filters.after.filter((filter) => {
      return (filter.action === this[action]);
    });
    this[processFilters](applicableFilters, request, response, callback);
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
