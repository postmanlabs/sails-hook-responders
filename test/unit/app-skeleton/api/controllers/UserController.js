/**
 * TestController
 *
 * @description :: Controller to test responders
 */

var baseUser = {
  name: 'Arthur Dent',
  id: 1,
  occupation: 'Blundering Human',
  passtimes: [
    'drinking tea',
    'making sandwiches',
    'flying',
    'getting into trouble'
  ]
};

module.exports = {
  create: function (req, res) {
    var user = baseUser;

    return res.respond({
      user: user
    });
  },

  update: function (req, res) {
    var changes = req.body,
      user = baseUser;

    Object.keys(changes).forEach(function (prop) {
      user.hasOwnProperty(prop) && (user[prop] = changes[prop]);
    });

    return res.respond({
      user: user
    });
  },

  delete: function (req, res) {
    var user = baseUser;

    return res.respond({
      user: user
    }, function (err, req, res, data) {
      var msg = 'Sorry to see you go, ' + data.user.name;

      return res.send(msg);
    });
  }
};
