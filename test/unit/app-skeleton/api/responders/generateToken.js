module.exports = function (req, res, data, options, next) {
  process.nextTick(function () {
    data.token = 'human#1';
    return next();
  });
};
