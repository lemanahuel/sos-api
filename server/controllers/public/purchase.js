'use strict';

const helpers = require('../helpers'),
  MailHelper = require('../helpers/mail'),
  Model = require('../models/purchase').model,
  Course = require('../models/course').model,
  _ = require('lodash'),
  isProd = helpers.isProd();
const MP = require('mercadopago');
const mpar = new MP('8093686802336383', 'm3WBjntiEu4qqjW6baRaGMCCNjczK9eL');
const mpcl = new MP('2828820284432801', 'fpiTAd9ymR5oJrZYqnXajmdeyD1qTIgZ');
const Stripe = require('stripe')(process.env.STRIPE_SECRET || 'sk_test_kkidlELKUu5ACTbGmmCsjTXX');

let getPreference = (params, currencyId) => {
  return {
    installments: 1,
    payment_method_id: 'visa',
    items: [{
      title: params.title,
      quantity: 1,
      currency_id: currencyId,
      unit_price: parseFloat(params.unit_price, 10)
    }],
    payer: {
      name: params.name,
      surname: params.last_name,
      email: params.email
    }
  };
};

let setEmail = (params, state) => {
  let tpl = 'pay-effective';

  switch (state) {
  case 'payCardOk':
    tpl = 'pay-card-ok';
    break;
  case 'payCardFail':
    tpl = 'pay-card-fail';
    break;
  default:
    tpl = 'pay-effective';
    break;
  }

  MailHelper.send({
    toEmail: isProd ? params.to : 'it@coderhouse.com',
    country: params.country || 'ar',
    subject: 'Bienvenido a Coderhouse!',
    tpl: {
      path: './server/templates/subscriptions/' + tpl + '.html',
      params: params
    }
  });
};

module.exports = class Purchase {

  static create(req, res, next) {
    let params = req.body;
    mpar.sandboxMode(!isProd);

    let convertMoney = (currency_id, cb) => {
      mpar.getConvertMoney(currency_id, 'ARS').then((pref) => {
        params.unit_price = params.unit_price * pref.response.ratio;
        if (cb) {
          cb();
        }
      });
    };

    let setPurchase = (currency_id) => {
      let mpCountry = params.country === 'cl' ? mpcl : mpar;
      let preference = mpCountry.createPreference(getPreference(params, currency_id || 'ARS'), (err) => {
        if (err) {
          console.log(err);
        }
      });

      preference.then((pref) => {
        Model.create({
          name: params.name,
          last_name: params.last_name,
          email: params.email,
          phone: params.phone,
          id_course: params.id_course,
          know: params.know,
          gateway: params.gateway || 1,
          pay: params.pay || 'proccess',
          way_to_pay: params.way_to_pay || 'card',
          country: params.country || 'ar'
        }, (err, doc) => {
          helpers.handleResponse(res, null, {
            idPurchase: doc._id,
            responseMP: preference,
            init_point: isProd ? pref.response.init_point : pref.response.sandbox_init_point,
            sandbox_init_point: pref.response.sandbox_init_point
          }, next);
        });
      });
    };

    switch (params.country) {
    case 'uy':
      Purchase.createUY(req, res);
      convertMoney('UYU', setPurchase);
      break;
    case 'cl':
      setPurchase('CLP');
      break;
    default:
      if (params.currency_id === 'UYU') {
        convertMoney('UYU', setPurchase);
      } else {
        setPurchase('ARS');
      }
    }
  }

  static effective(req, res, next) {
    let params = req.body;
    params.gateway = 0;
    params.way_to_pay = 'effective';
    params.type = 'inscripcion';

    Model.create(params).exec((err, doc) => {
      params.to = params.email;
      console.log(params);
      setEmail(params);
      helpers.handleResponse(res, null, {
        msg: 'Ok'
      }, next);
    });

    Course.findOne({
        _id: params.course
      })
      .populate({
        path: 'career',
        model: 'Career'
      })
      .populate({
        path: 'level',
        model: 'Level'
      })
      .lean().exec((err, doc) => {
        var leadsParams = params;
        doc.urlMap = (doc.level && doc.level !== null) ? doc.level.url : doc.career.url;
        doc.titleCareer = doc.career.title;
        doc.titleLevel = doc.level && doc.level !== null ? doc.level.title : 'Carrera';
        leadsParams.doc = doc;

        helpers.createLead(leadsParams);
      });
  }

  static payOk(req, res, next) {
    setEmail(req.body, 'payCardOk');

    helpers.handleResponse(res, null, {
      msg: 'Ok'
    }, next);
  }

  static payFail(req, res, next) {
    setEmail(req.body, 'payCardFail');

    helpers.handleResponse(res, null, {
      msg: 'Ok'
    }, next);
  }


  static payStripe(req, res, next) {
    // (Assuming you're using express - expressjs.com)
    // Get the credit card details submitted by the form
    var params = req.body;
    var charge = Stripe.charges.create({
      amount: params.amount, // amount in cents, again
      currency: 'usd',
      source: params.stripeToken,
      description: params.description
    }, function (err, charge) {
      console.log(charge);
      if (err && err.type === 'StripeCardError') {
        // The card has been declined
        console.log(err);
      }

      if (params.email && params.email !== '') {
        MailHelper.send({
          toEmail: isProd ? params.email : 'it@coderhouse.com',
          country: params.country || 'ar',
          subject: '¡Gracias por tu inscripción!',
          fromname: 'Coderhouse',
          tpl: {
            path: './server/templates/subscriptions/inscription-remote-email.html',
            params: params
          }
        });
      }

      helpers.handleResponse(res, err, charge, next);
    });
  }
};
