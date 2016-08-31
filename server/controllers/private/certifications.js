'use strict';
const helpers = require('../../helpers'),
  MailHelper = require('../../helpers/mail'),
  momentTz = require('moment-timezone'),
  _ = require('lodash'),
  async = require('async'),
  fs = require('fs'),
  Model = require('../../models/certification').model,
  CamadaModel = require('../../models/admin/camada').model,
  isProd = helpers.isProd();

let amountOfCertificaciones = [];
let amountOfIncompleteCertificaciones = [];

let sendMail = (params, cb) => {
  MailHelper.send({
    toEmail: params.toEmail,
    fromEmail: params.from,
    subject: params.subject,
    tpl: params.tpl
  }, cb);
};

let sendVerificationMail = (certifications, incompleteCertificaciones, cb) => {
  sendMail({
    toEmail: 'it@coderhouse.com',
    from: 'alumnos@coderhouse.com',
    subject: 'Verificacion de Certificados enviados',
    tpl: {
      params: {
        certifications: certifications,
        incompleteCertificaciones: incompleteCertificaciones,
        date: momentTz().tz('America/Argentina/Buenos_Aires').format('DD-MM-YYYY')
      },
      path: './server/templates/certifications/tpls/certifications-verification.tpl.html'
    }
  }, cb);
};

let sendCertificationMail = (params, cb) => {
  params = params || {};
  params.tpl = params.tpl || {};
  params.tpl.path = './server/templates/certifications/tpls/certification-mail.tpl.html';
  params.subject = 'Felicitaciones! mirá el certificado online';
  sendMail(params, cb);
};

let sendIncompleteProfileMail = (params, cb) => {
  params = params || {};
  params.tpl = params.tpl || {};
  params.tpl.path = './server/templates/certifications/tpls/certification-error.tpl.html';
  params.subject = 'No pudimos generar tu certificado online';
  sendMail(params, cb);
};

let getName = (user) => {
  if (user.profile && (user.profile.first_name || user.profile.last_name)) {
    return user.profile.first_name || user.profile.last_name;
  } else if (user.email) {
    return user.email.split('@')[0];
  }
  return user.email;
};

let getEmailParams = (user, camada, certUrl, certId) => {
  let toEmail = 'it@coderhouse.com';
  let certLinkedin = 'https://www.linkedin.com/profile/add';

  if (isProd) {
    toEmail = user.email;
  }

  certLinkedin += '?_ed=0_JhwrBa9BO0xNXajaEZH4qchmXj_bl7e8YUqBLyHMpFamjuhvQxj9mAY5hdRFzAvUaSgvthvZk7wTBMS3S-m0L6A6mLjErM6PJiwMkk6nYZylU7__75hCVwJdOTZCAkdv';
  certLinkedin += '&pfCertificationName=' + camada.class.name;
  certLinkedin += '&pfCertificationUrl=' + certUrl;
  certLinkedin += '&pfLicenseNo=' + certId;
  certLinkedin += '&pfCertStartDate=201601';
  certLinkedin += '&pfCertFuture=201612';
  certLinkedin += '&trk=onsite_html';

  return {
    toEmail: toEmail,
    from: 'alumnos@coderhouse.com',
    tpl: {
      params: {
        email: user.email,
        camadas_id: camada._id,
        className: camada.class.name,
        studentName: getName(user),
        certLinkedin: certLinkedin,
        certUrl: certUrl
      }
    }
  };
};

let setCert = (params, cb) => {
  Model.findOne({
    user: params.user,
    camada: params.camada,
    class: params.class
  }).populate('user camada class').lean().exec((err, doc) => {
    if (!err && !doc) {
      Model.create({
        user: params.user,
        camada: params.camada,
        class: params.class
      }, (err, certDoc) => {
        if (!err && certDoc) {
          Model.findByIdAndUpdate(certDoc._id, {
            $set: {
              url: 'https://www.coderhouse.com/certificados/' + certDoc._id
            }
          }, {
            new: true
          }).populate('user camada class').lean().exec((err, newCertDoc) => {
            if (!err && newCertDoc) {
              cb(err, newCertDoc);
            } else {
              cb(err, newCertDoc);
            }
          });
        } else {
          cb(err, certDoc);
        }
      });
    } else {
      cb(err, false);
    }
  });
};

let sendCertification = (user, camada, cb) => {
  if (user.profile && user.profile.first_name && user.profile.last_name) {
    setCert({
      user: user._id,
      camada: camada._id,
      class: camada.class._id
    }, (err, doc) => {
      if (!err && doc) {
        amountOfCertificaciones.push(doc);
        if (isProd) {
          sendCertificationMail(getEmailParams(user, camada, doc.url, doc._id), cb);
        } else {
          cb();
        }
      } else {
        cb();
      }
    });
  } else {
    amountOfIncompleteCertificaciones.push({
      user: user,
      camada: camada,
      class: camada.class
    });
    if (isProd) {
      sendIncompleteProfileMail(getEmailParams(user, camada, null, null), cb);
    } else {
      cb();
    }
  }
};

let isValidCamada = (camada) => {
  let className = camada.class.name ? camada.class.name.toLowerCase() : camada.class.name;
  if (className.indexOf('objetivos') === -1 && className.indexOf('nivelación') === -1 && className.indexOf('onbording') === -1) {
    return true;
  }
  return false;
};

module.exports = class Certifications {

  static createByCamada(camadaId) {
    let count = 100000;
    amountOfCertificaciones = [];
    amountOfIncompleteCertificaciones = [];
    CamadaModel.findById(camadaId)
      .populate('class students').lean().exec((err, camada) => {
        if (isValidCamada(camada)) {
          async.each(camada.students, (user, cb) => {
            if (isProd) {
              if (user.email) {
                sendCertification(user, camada, cb);
              } else {
                console.log('user-without-email', user);
                cb();
              }
            } else if (count) {
              sendCertification(user, camada, cb);
            } else {
              cb();
            }
          }, (err) => {
            console.log('amountOfCertificaciones', amountOfCertificaciones.length);
            console.log('amountOfIncompleteCertificaciones', amountOfIncompleteCertificaciones.length);
            if (amountOfCertificaciones.length || amountOfIncompleteCertificaciones.length) {
              sendVerificationMail(amountOfCertificaciones, amountOfIncompleteCertificaciones);
            }
            console.log('FINISH', camadaId);
          });
        }
      });
  }
};
