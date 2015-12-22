/**
 * Basic tests to check whether sails has successfully loaded with the responders mapped to the
 * correct controller actions
 */

var expect = require('expect.js'),
  util = require('sails-util');

/* global describe, it, sails */
describe('Basic hook test', function () {
  it('responders hook loads successfully', function () {
    expect(sails.hooks.responders).to.be.ok();
  });

  it('responders hook middleware has the respond methods attached', function () {
    var responseFunctions = [
      'respond'
    ];

    expect(sails.hooks.responders.middleware.responses).to.be.an('object');

    util.each(sails.hooks.responders.middleware.responses, function (responseFn, name) {
      expect(responseFunctions).to.contain(name);
      expect(responseFn).to.be.a('function');
    });
  });

  it('responders have all be loaded', function () {
    var responders = [
      'adjustUserCount',
      'generateToken',
      'sendEmail'
    ];

    expect(sails.hooks.responders.middleware.responders).to.be.an('object');

    util.each(sails.hooks.responders.middleware.responders, function (responderFn, name) {
      expect(responders).to.contain(name);
      expect(responderFn).to.be.a('function');
    });
  });

  it('controller action to responder mapping has been created', function () {
    expect(sails.hooks.responders.mapping).to.be.an('object');
    expect(sails.hooks.responders.mapping.user.create.length).to.be(3);
    expect(sails.hooks.responders.mapping.user.update[0]).to.be.a('function');
  });
});
