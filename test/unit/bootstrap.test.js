var Sails = require('sails'),
  responders = require('../../index.js'),
  sails;

before(function (done) {
  Sails.load({
    environment: 'test',
    hooks: {
      grunt: false,
      responders: responders
    },
    log: {
      level: 'silent'
    }
  },
  function (err, _sails) {
    if (err) { return done(err); }
    sails = _sails;
    return done();
  });
});

after(function (done) {
  if (sails) { return sails.lower(done); }
  return done();
});
