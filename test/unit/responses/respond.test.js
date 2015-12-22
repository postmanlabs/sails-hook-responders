/**
 * Unit tests to check that the responders are running correctly
 */

var expect = require('expect.js'),
  request = require('supertest');

/* global describe, it, sails */
describe('test whether responders are run', function () {
  it('multiple responders of UserController.create are run', function (done) {
    request(sails.hooks.http.app)
      .post('/user/create')
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .end(function (err, res) {
        if (err) { return done(err); }

        expect(res.body).to.be.an('object');
        expect(res.body.user).to.be.an('object');
        expect(res.body.user.name).to.be('Arthur Dent');
        expect(res.body.token).to.be('human#1');
        expect(res.body.emailSent).to.be.ok();
        expect(res.body.userCount).to.be(1);

        return done();
      });
  });

  it('single responder of UserController.update, defined as a string is run', function (done) {
    request(sails.hooks.http.app)
      .put('/user/update')
      .send({
        occupation: 'Sandwich Maker'
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .end(function (err, res) {
        if (err) { return done(err); }

        expect(res.body).to.be.an('object');
        expect(res.body.user).to.be.an('object');
        expect(res.body.user.occupation).to.be('Sandwich Maker');
        expect(res.body.emailSent).to.be.ok();

        return done();
      });
  });

  it('single responder with custom callback for UserController.delete is run', function (done) {
    request(sails.hooks.http.app)
      .delete('/user/delete')
      .expect(200)
      .expect('Content-Type', /html/)
      .end(function (err, res) {
        expect(res.text).to.be.a('string');
        expect(res.text).to.match(/Sorry\ to\ see\ you\ go,\ Arthur\ Dent/);

        return done();
      });
  });
});
