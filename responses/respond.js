var async = require('async'),
  util = require('sails-util');

/**
 * The response method to run responders
 *
 * @param  {Object}   [data]    [description]
 * @param  {Object}   [options] [description]
 * @param  {Function} [done]    [description]
 */
module.exports = function respond (data, options, done) {
  var req = this.req,
    res = this.res,
    sails = req._sails,
    controller = req.options.controller,
    action = req.options.action,
    /**
     * A list of responders attached to the controller action
     *
     * @type {Array}
     */
    responders = sails.hooks.responders.mapping[controller] && sails.hooks.responders.mapping[controller][action] || [];

  // If responders is not an array, then something went wrong, and an error should be thrown
  if (!util.isArray(responders)) {
    sails.log.error('No valid responders registered for ', controller, '.', action);

    throw new Error({
      type: 'terminate',
      message: 'Invalid responders'
    });
  }

  /**
   * The method that finally returns the response to the user, after all the responders have run,
   * or there was an error in the execution.
   *
   * If the done method has not been passed, then use a default function.
   *
   * @type {Function}
   */
  done = (util.isFunction(data) && data) || (util.isFunction(options) && options) || (util.isFunction(done) && done) ||
    function respondCallback (err, req, res, data, options) {
      if (err) { sails.log.error(err); }

      /**
       * Name of the response method to use. If not set in options, use a default value
       * The default is 'json', unless there was an error, in which case it is 'serverError'
       *
       * @type {String}
       */
      var resMethod = options.method || (err && 'serverError') || 'json';

      sails.log.silly('res.respond() :: Running done running');
      return res[resMethod](data);
    };

  // Ensure that data and options have values and are objects
  data = (!util.isFunction(data) && util.isObject(data) && data) || {};
  options = (!util.isFunction(options) && util.isObject(options) && options) || {};

  sails.log.silly('res.respond() :: Running responders');

  // Run the responders and return the response
  // Each responder is run in series, and after all have been run or an error occurs, the callback method is run,
  // which returns the response and ends the request
  async.eachSeries(responders,
    function (responder, next) {
      return responder(req, res, data, options, next);
    },
    /**
     * Ensure that the data object is available to the final callback
     */
    function (err) {
      return done(err, req, res, data, options);
    });
};
