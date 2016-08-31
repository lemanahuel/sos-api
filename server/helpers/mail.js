'use strict';

const config = require('../config/auth'),
  fs = require('fs'),
  sendgrid = require('sendgrid')(process.env.NODE_ENV === 'production' ? config.sendgrid.prod : config.sendgrid.qa),
  _ = require('lodash');

const mails = {
  ar: 'hola@coderhouse.com',
  cl: 'chile@coderhouse.com',
  uy: 'uruguay@coderhouse.com',
  talent: 'talento@coderhouse.com'
};

const SEDES = {
  ar: {
    label: 'Argentina',
    email: mails.ar,
    phone: '+54 11 5252 9557',
    location: 'El Salvador 5220, piso 3, Oficina 308 Palermo, Buenos Aires, Argentina.',
    seller: 'chris.s@coderhouse.com'
  },
  cl: {
    label: 'Chile',
    email: mails.cl,
    phone: '+56 45 294 3951',
    location: 'General del Canto 182 Providencia, Santiago.',
    seller: 'stefany@coderhouse.com'
  },
  uy: {
    label: 'Uruguay',
    email: mails.uy,
    phone: '+598-092134525',
    location: 'Tiburcio Gómez 1330. piso 3 CP: 11200 Montevideo, Uruguay',
    seller: 'genesis@coderhouse.com'
  }
};

module.exports = class Mail {
  /**
    @params ObjectJson
  */
  static send(params, cb) {
    fs.readFile(params.tpl.path, (err, html) => {
      params.tpl.params.sede = SEDES[params.country || 'ar'];
      params.toEmail = params.toEmail || mails[params.country];
      params.fromEmail = params.fromEmail ? params.fromEmail : params.country ? mails[params.country] : mails.ar;

      if (params.tpl.params.type === 'inscripcion') {
        Mail.sendToSeller(params);
      }

      let mail = {
        to: params.toEmail,
        from: params.fromEmail,
        fromname: 'Coderhouse',
        subject: params.subject,
        html: _.template(html)(params.tpl.params)
      };

      if (params.bcc) {
        mail.bcc = params.bcc;
      }

      sendgrid.send(mail, (err, json) => {
        if (err) {
          console.log(err);
        }
        if (cb) {
          cb(err);
        }
      });
    });
  }

  static sendToSeller(params) {
    fs.readFile('./server/templates/subscriptions/contact-inscription.html', (err, html) => {
      let email = new sendgrid.Email({
        to: params.tpl.params.sede.seller || mails[params.country],
        from: params.country ? mails[params.country] : mails.ar,
        fromName: params.fromName ? params.fromName : 'Nueva inscripcion',
        subject: 'Nueva inscripcion',
        html: _.template(html)(params.tpl.params)
      });

      sendgrid.send(email, (err, json) => {
        if (err) {
          return console.log(err);
        }
      });
    });
  }
};
