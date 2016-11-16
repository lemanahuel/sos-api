const helpers = require('../../helpers');
const Model = require('../../models/private/user').model;

module.exports = class Auth {

  static authenticate(req, res) {
    //TODO this should be a hash on an env variable
    Model.findOne({
      email: req.body.email,
      password: req.body.password
    }).lean().exec((err, doc) => {
      if (!err && doc) {
        let token = helpers.createToken('coderhouse');
        res.send({
          token: token,
          user: {
            email: doc.email,
            name: doc.name,
            rol: doc.rol
          }
        });
      } else {
        console.log(err, doc);
        res.send({
          error: 'could not authenticate'
        });
      }
    });
  }

  static logout(req, res) {
    req.session.destroy();
    res.send({
      msg: 'user logged out'
    });
  }

  static getToken(req, res) {
    res.send({
      token: helpers.createToken('coderhouse')
    });
  }
};
