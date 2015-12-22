var userCount = 0;

module.exports = function (req, res, data, options, next) {
  process.nextTick(function () {
    userCount++;
    data.userCount = userCount;

    return next();
  });
};
