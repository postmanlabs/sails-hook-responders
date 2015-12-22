module.exports = function (req, res, data, options, next) {
  process.nextTick(function () {
    data.emailSent = true;
    return next();
  });
};
