module.exports.responders = {
  UserController: {
    create: ['generateToken', 'sendEmail', 'adjustUserCount'],
    update: 'sendEmail',
    delete: ['sendEmail']
  }
};
