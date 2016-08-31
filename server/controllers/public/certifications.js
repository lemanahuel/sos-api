'use strict';

const helpers = require('../../helpers'),
  fs = require('fs'),
  pdf = require('html-pdf'),
  Model = require('../../models/certification').model,
  _ = require('lodash');

let getName = (user) => {
  if (user.profile && (user.profile.first_name || user.profile.last_name)) {
    var first_name = user.profile.first_name;
    if (user.profile.last_name) {
      first_name += ' ' + user.profile.last_name;
    }
    return first_name;
  } else if (user.email) {
    return user.email.split('@')[0];
  }

  return user.email;
};

let getClassLogo = (className) => {
  var logo = null;
  var style = null;
  className = className.toLowerCase();

  if (className.indexOf('diseñador') !== -1) {
    style = 'disenador-web';
    logo = 'http://res.cloudinary.com/hdsqazxtw/image/upload/v1470182840/disenador-web_cgdjko.png';
  } else if (className.indexOf('programador') !== -1) {
    style = 'programador-web';
    logo = 'http://res.cloudinary.com/hdsqazxtw/image/upload/v1470182837/programador-web_bj9xzn.png';
  } else if (className.indexOf('frontend') !== -1) {
    style = 'frontend';
    logo = 'http://res.cloudinary.com/hdsqazxtw/image/upload/v1470182835/experto-frontend_mssacz.png';
  } else if (className.indexOf('fullstack') !== -1) {
    style = 'fullstack';
    logo = 'http://res.cloudinary.com/hdsqazxtw/image/upload/v1470182836/experto-full-stack_pldrr8.png';
  } else if (className.indexOf('mobile') !== -1) {
    style = 'movil';
    logo = 'http://res.cloudinary.com/hdsqazxtw/image/upload/v1470182836/experto-movil_a8kzhj.png';
  } else if (className.indexOf('gráfico') !== -1) {
    style = 'disenador-grafico';
    logo = 'http://res.cloudinary.com/hdsqazxtw/image/upload/v1470240226/diseno-grafico_otphco.png';
  } else if (className.indexOf('ux design') !== -1) {
    style = 'diseno-ux';
    logo = 'http://res.cloudinary.com/hdsqazxtw/image/upload/v1470182835/diseno-ux_ddfwvs.png';
  } else if (className.indexOf('marketing digital avanzado') !== -1) {
    style = 'marketing2';
    logo = 'http://res.cloudinary.com/hdsqazxtw/image/upload/v1470182837/marketing-digital-avanzado_deqez7.png';
  } else if (className.indexOf('marketing digital') !== -1) {
    style = 'marketing1';
    logo = 'http://res.cloudinary.com/hdsqazxtw/image/upload/v1470182837/marketing-digital-basico_zttnji.png';
  } else if (className.indexOf('wordpress avanzado') !== -1) {
    style = 'wordpress2';
    logo = 'http://res.cloudinary.com/hdsqazxtw/image/upload/v1470182839/wordpress-avanzado_up7wyi.png';
  } else if (className.indexOf('wordpress') !== -1) {
    style = 'wordpress1';
    logo = 'http://res.cloudinary.com/hdsqazxtw/image/upload/v1470182839/wordpress-basico_pml6oo.png';
  } else if (className.indexOf('angular 2') !== -1) {
    style = 'diseno';
    logo = 'http://res.cloudinary.com/hdsqazxtw/image/upload/v1470240266/angular_tcrxmh.png';
  } else if (className.indexOf('html y css') !== -1) {
    style = 'disenador-web';
    logo = 'http://res.cloudinary.com/hdsqazxtw/image/upload/v1470240266/htmlcss_y5qoai.png';
  } else if (className.indexOf('react') !== -1) {
    style = 'wordpress1';
    logo = 'http://res.cloudinary.com/hdsqazxtw/image/upload/v1470240265/react_i8twyj.png';
  }

  return {
    logo: logo,
    style: style
  };
};

let getById = (id, cb) => {
  Model.findById(id)
    .populate('user', 'email profile')
    .populate('class')
    .select('-camada -enable')
    .lean().exec(cb);
};

let getCert = (cert, cb) => {
  fs.readFile('./server/templates/certifications/certification.tpl.html', (err, html) => {
    if (err) {
      return cb(err);
    }
    let classParams = getClassLogo(cert.class.name);
    let parseClassName = (className) => {
      if (className && className.toLowerCase().indexOf('(versión 2)') !== -1) {
        return className.replace('(Versión 2)', '');
      }
      return className;
    };

    html = _.template(html)({
      studentName: getName(cert.user),
      className: parseClassName(cert.class.name),
      classLogoPath: classParams.logo,
      classStyle: classParams.style,
      url: cert.url
    });

    pdf.create(html, {
      width: '842px',
      height: '595px'
    }).toFile('./server/templates/certifications/' + cert._id + '.pdf', cb);
  });
};

module.exports = class Certifications {

  static read(req, res, next) {
    getById(req.params.certificationId, (err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static print(req, res, next) {
    getById(req.params.certificationId, (err, doc) => {
      getCert(doc, (err, file) => {
        if (err) {
          return console.log(err);
        }
        res.header('content-type', 'application/pdf');
        res.sendFile(file.filename);
      });
    });
  }

  static download(req, res, next) {
    getById(req.params.certificationId, (err, doc) => {
      getCert(doc, (err, file) => {
        if (err) {
          return console.log(err);
        }
        res.header('content-type', 'application/pdf');
        res.download(file.filename, doc._id + '.pdf');
      });
    });
  }
};
