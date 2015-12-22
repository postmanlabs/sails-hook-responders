module.exports = function (sails) {
  var path = require('path'),
    util = require('sails-util'),
    /**
     * Responder hook definition
     * Conforms to http://sailsjs.org/documentation/concepts/extending-sails/hooks/hook-specification
     *
     * @type {Object}
     */
    responderPolicyHookDef = {
      /**
       * Defaults for the hook
       *
       * @type {Object}
       */
      defaults: {
        __configKey__: {
          /**
           * Path of the directory containing responders, relative to the project root
           * @type {String}
           */
          responderPath: path.join(sails.config.appPath, 'api/responders')
        }
      },

      /**
       * Initialize the hook
       *
       * @api public
       */
      initialize: function (cb) {
        var self = this;

        // Make the callback optional
        // If cb is not a function, then a noOp function is used instead
        cb = util.optional(cb);

        sails.log.verbose('Loading responder modules from app');

        // Load responders into the hooks middleware
        responderPolicyHookDef.loadResponders(
          /**
           * Takes all responders, and adds them to the hooks middleware object,
           * under the responders key.
           * This way the responders are required only once
           *
           * @param  {Object} [err]     The error, if any
           * @param  {Object} [modules] Responders defined in the sails project
           */
          function (err, modules) {
            if (err) { return cb(err); }

            self.middleware.responders = {};
            util.extend(self.middleware.responders, modules);
            self.mapping = self.buildResponderMap();

            sails.log.verbose('Finished loading responder middleware logic');
            return cb();
          }
        );
      },

      /**
       * Load all of the hooks response method into the hooks middleware
       */
      loadModules: function (cb) {
        var self = this;

        /**
         * Require all javascript/coffeescript scripts in ./responses
         */
        sails.modules.optional({
          dirname: path.join(__dirname, 'responses'),
          filter: /(.+)\.(js|coffee|litcoffee)$/,
          useGlobalIdForKeyName: true
        },
        /**
         * Bind the sails object to all responses and load all responses into the
         * hooks middleware
         *
         * @param  {Object} [err]   The error, if any
         * @param  {Array}  modules Responses required from the responses directory
         */
        function (err, modules) {
          if (err) { return cb(err); }

          util.each(modules, function (module) {
            module.sails = sails;
            util.bindAll(module);
          });

          self.middleware.responses = {};
          util.extend(self.middleware.responses, modules);

          return cb();
        });
      },

      /**
       * Require all responders from the responders directory
       */
      loadResponders: function (cb) {
        sails.modules.optional({
          dirname: sails.config.responders.responderPath,
          filter: /(.+)\.(js|coffee|litcoffee)$/,
          useGlobalIdForKeyName: true
        },
        /**
         * Bind the sails object to all responders
         *
         * @param  {Object} [err]   The error, if any
         * @param  {Array}  modules Responders defined in the project
         */
        function (err, modules) {
          if (err) { return cb(err); }

          util.each(modules, function (module) {
            module.sails = sails;
            util.bindAll(module);
          });

          return cb(null, modules);
        });
      },

      /**
       * Map responders to controller actions, as defined in config/responders.js
       *
       * @return {Object} Mapping of controller actions and responders
       */
      buildResponderMap: function () {
        /**
         * Mapping of controller actions and responders
         *
         * @type {Object}
         */
        var mapping = {};

        util.each(sails.config.responders, function (_responders, controllerId) {
          /**
           * The normalized controller id
           * If your controller is in api/controllers/UserController, the normalized controller id
           * is 'user'
           *
           * @type {String}
           */
          controllerId = util.normalizeControllerId(controllerId);

          // Noting to map if the controller does not exist, or if no responders have been mapped to
          // the controller actions
          if (!controllerId) { return; }
          if (!util.isDictionary(_responders)) { return; }

          mapping[controllerId] = {};

          util.each(_responders, function (__responders, actionId) {
            actionId = actionId.toLowerCase();
            mapping[controllerId][actionId] = this.normalizeResponder(__responders);
          }, this);
        }, this);

        return mapping;
      },

      /**
       * Normamalizes the responders for a particular controller action, and returns an array
       * that replaces each responder id with the responder function
       *
       * @param  {Array|String} responders An array of responders mapped to a controller action. Can be a string in
       *                                   case only one responder is mapped to the action
       * @return {Array}                   An array of responder functions
       */
      normalizeResponder: function (responders) {
        // If responders is a string, convert it into an array with one item(the original responders)
        if (util.isString(responders)) { responders = [responders]; }

        // If responders is not an array, then something is wrong. Throw an exception
        if (!util.isArray(responders)) {
          sails.log.error('Invalid responders: ', responders);
          throw new Error('Invalid responders');
        }

        /**
         * Array of responder methods
         *
         * @type {Array}
         */
        var responderChain = [],
          self = this;

        responders.forEach(function (responder) {
          responderChain.push(self.lookup(responder));
        });

        return responderChain;
      },

      /**
       * Take a responder id, and return the function associated with that responder
       *
       * @param  {String}   responderId Id of the responder
       * @return {Function}             Responder function
       */
      lookup: function (responderId) {
        // If no responder with the id passed exists, or if the responder is not a function,
        // then throw an error
        if (!util.isFunction(this.middleware.responders[responderId])) {
          sails.log.error('Unknown responder ', responderId);
          throw new Error('Unknown responder ' + responderId);
        }

        return this.middleware.responders[responderId];
      },

      routes: {
        before: {
          /**
           * Bind all response methods defined for this hook to the response object for a request
           *
           * @param {Object}   req  The request object
           * @param {Object}   res  The response object
           * @param {Function} next Callback method
           */
          'all /*': function addResponderMethod (req, res, next) {
            util.each(responderPolicyHookDef.middleware.responses, function (responseFn, name) {
              res[name] = util.bind(responseFn, {
                req: req,
                res: res
              });
            });

            return next();
          }
        }
      }
    };

  return responderPolicyHookDef;
};
