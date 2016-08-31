'use strict';

const config = require('../config/auth'),
  helpers = require('../helpers'),
  MailHelper = require('./mail'),
  CoursesMapHelper = require('./courses-map'),
  Curl = require('node-libcurl').Curl,
  sendgrid = require('sendgrid')(process.env.NODE_ENV === 'production' ? config.sendgrid.prod : config.sendgrid.qa),
  Closeio = require('close.io'),
  closeio = new Closeio(config.closeio.prod);

module.exports.create = (params) => {
  let createCloseio = function (params) {
    let lead = {
      name: params.name,
      contacts: [{
        name: params.name,
        emails: [{
          type: 'office',
          email: params.email
        }]
      }]
    };

    let city = '';
    let codPhone = '';
    if (params.country) {
      switch (params.country) {
      case 'ar':
        city = 'Buenos Aires';
        codPhone = '+54';
        break;
      case 'cl':
        city = 'Santiago';
        codPhone = '+56';
        break;
      case 'uy':
        city = 'Montevideo';
        codPhone = '+598';
        break;
      }

      if (params.phone && params.phone !== '') {
        params.phone = params.phone.toString().indexOf(codPhone) !== -1 ? params.phone : codPhone + params.phone;
        lead.contacts[0].phones = [{
          'phone': params.phone,
          'phone_formatted': params.phone,
          'type': 'office'
        }];
      }

      lead.addresses = [{
        city: city,
        country: params.country
      }];
    }

    if (params.doc) {
      let mapsCourse = params.doc.titleCareer + ' - ' + params.doc.titleLevel;
      mapsCourse = CoursesMapHelper[mapsCourse] ? CoursesMapHelper[mapsCourse].title : mapsCourse;
      lead['B. Curso'] = mapsCourse;
    }

    lead.custom = {
      'A. Sede': city,
      'Q. Tipo de suscripción': params.type
    };

    if (params.doc) {
      let mapsCourse = params.doc.urlMap;
      mapsCourse = CoursesMapHelper[mapsCourse] ? CoursesMapHelper[mapsCourse].title : mapsCourse;
      lead.custom['B. Curso'] = mapsCourse;
    }

    if (params) {
      if (params.utm_source) {
        lead.custom['utm_source'] = params.utm_source;
      }
      if (params.utm_medium) {
        lead.custom['utm_medium'] = params.utm_medium;
      }
      if (params.utm_term) {
        lead.custom['utm_term'] = params.utm_term;
      }
      if (params.utm_content) {
        lead.custom['utm_content'] = params.utm_content;
      }
      if (params.utm_campaign) {
        lead.custom['utm_campaign'] = params.utm_campaign;
      }
    }

    closeio.lead.create(lead).then((lead) => {
      //console.log('Create lead closeio', lead);
      return closeio.lead.read(lead.id);
    }).then((search_results) => {
      //console.log('search_results', search_results);
    }, (err) => {
      console.log('closeio.lead.error', err);
    });
  };

  let createSendgrid = function (params) {
    let curl = new Curl();
    curl.setOpt('URL', 'https://api.sendgrid.com/v3/contactdb/recipients');
    let lead = [{
      email: params.email,
      first_name: params.name,
      last_name: params.last_name ? params.last_name : '',
      carrera: '',
      curso: '',
      pais: params.country,
      tel: params.phone || 0,
      tipo_de_suscripcion: params.type.toLowerCase()
    }];

    if (params.doc) {
      lead[0].carrera = params.doc.titleCareer;
      lead[0].curso = params.doc.titleCareer;
    }
    //console.log(lead[0]);
    lead = JSON.stringify(lead);
    curl.setOpt(Curl.option.HTTPAUTH, Curl.auth.BASIC);
    curl.setOpt(Curl.option.USERPWD, 'coderhouse:Coderina16!');
    curl.setOpt(Curl.option.CUSTOMREQUEST, 'POST');
    curl.setOpt(Curl.option.POST, 1);
    curl.setOpt(Curl.option.POSTFIELDS, lead);
    curl.on('end', function (statusCode, body, headers) {
      console.info(statusCode);
      console.info('---');
      console.info(body);
      console.info('---');
      console.info(this.getInfo('TOTAL_TIME'));
      this.close();
    });
    curl.on('error', curl.close.bind(curl));
    curl.perform();
    /*var request = sendgrid.emptyRequest();
    request.body = [{
      'email': params.email,
      'first_name': params.name,
      'last_name': '',
      'carrera': '',
      'curso': '',
      'pais': params.country,
      'tel': params.phone || 0,
      'tipo_de_suscripcion': params.type.capitalize()
    }];
    request.method = 'POST';
    request.path = '/v3/contactdb/recipients';
    sendgrid.API(request, function (response) {
      //console.log(response.statusCode);
      console.log('Sengrid API');
      console.log(response.body);
      //console.log(response.headers);
    });*/
  };

  createCloseio(params);

  if (helpers.isProd()) {
    createSendgrid(params);
  }
};
