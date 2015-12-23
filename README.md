# sails-hook-responders

This is a installable [sailsjs](http://sailsjs.org/) hook that attaches policy like methods, called responders,
to controller actions.

## Installation

```bash
npm install sails-hook-responders --save
```

## Usage

### Create your responders, in `api/responders`, with the signature

```javascript
/**
 * Create users API token and add it to the response
 *
 * @param  {Object}   req     The request object
 * @param  {Object}   res     The response object
 * @param  {Object}   data    Data for the request. Global to all responders
 * @param  {Object}   options Response options, include what kind of response to send. Global to all responders
 * @param  {Function} next    [description]
 */
module.exports = function (req, res, data, options, next) {
  // Do something
  // Add any data you want sent back to the user to data object
  // For example,
  // data.response = 'Hi, this message was generated in a responder';
  // Set the type of response you want to be used
  // options.method = 'ok';
  // options is optional. By default it is set to `serverError` if there was an error,
  // else to `json`
  // If there is an error, call next with the error
  // next(err);
  var token;

  // Generate token

  data.token = token;
  next();
};
```

### Map responders to controller actions in `config/responders.js`

```javascript
/**
 * Mapping responders to a controller action
 * @type {Object}
 */
module.exports.responders = {
  UserController: {
    // responders should be put in an array, in the order they are meant to be run
    create: ['generateApiToken', 'sendWelcomeEmail'],
    // though if you only have one responder for an action, you can just use a string
    delete: 'sendGoodbyeEmail'
  },
  ...
  ...
};
```

### Return the responder in your controller action

A method, `respond`, is attached to the `res` object. It runs all the responders attached to a controller action
and sends the response back to the user. If no responder has been attached, it will simply return `res.ok`

```javascript
/**
 * User controller
 */

/**
 * The user controller
 * @type {Object}
 */
module.exports = {
  create: function (req, res) {
    // create user
    var data = {
      id: user.id,
      name: user.name
    };

    // options is optional, and so is data
    return res.respond(data);
  },

  delete: function (req, res) {
    // delete the user
    var data = {
        id: deletedUser.id
        name: deletedUser.name,
        message: 'Sorry to see you go ' + deletedUser.name
      };

    // You can pass a custom callback to `res.respond`, which will be called after the responders have been run
    return res.respond(data, function (err, req, res, data, options) {
      return res.view('user/goodbye', data);
    });
  },
  ...
  ...
};
```

---
This project is licensed under the [Apache 2.0](LICENSE.md) License.

For contributing, please check the [contributing guidelines](CONTRIBUTING.md).

Made with :heart: by [Postman](https://getpostman.com)
