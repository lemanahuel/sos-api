'use strict';

const helpers = require('../helpers'),
  MailHelper = require('../helpers/mail'),
  Subscriptions = require('./subscriptions'),
  Model = require('../models/job').model,
  isQA = process.env.ENV_QA,
  isProd = helpers.isProd(),
  fromEmail = 'talento@coderhouse.com';

let getBaseUrl = (jobUrl) => {
  let base = 'localhost:3040';
  base = isQA ? 'ch-www-qa.herokuapp.com' : base;
  base = isProd ? 'www.coderhouse.com' : base;
  return 'https://' + base + '/empleos/' + jobUrl;
};

let sendJobToCandidate = (job, candidate) => {
  MailHelper.send({
    toEmail: isProd ? candidate.email : 'it@coderhouse.com',
    fromEmail: fromEmail,
    subject: 'Te postulaste a un ' + job.title + '!',
    tpl: {
      path: './server/templates/jobs/new-candidate.html',
      params: {
        job: job,
        jobUrl: getBaseUrl(job.url),
        candidate: candidate
      }
    }
  });
};

let sendNewJobToRecruiter = (job, recruiter) => {
  MailHelper.send({
    toEmail: isProd ? recruiter.contact : 'it@coderhouse.com',
    fromEmail: fromEmail,
    subject: 'Tu busqueda de un ' + job.title + ' ha sido agregada',
    tpl: {
      path: './server/templates/jobs/new-job-to-recruiter.html',
      params: {
        job: job,
        jobUrl: getBaseUrl(job.url),
        recruiter: recruiter
      }
    }
  });
};

let sendCandidateToRecruiter = (job, candidate) => {
  MailHelper.send({
    toEmail: isProd ? job.contact : 'it@coderhouse.com',
    fromEmail: fromEmail,
    subject: job.title + ' tiene un nuevo candidato',
    tpl: {
      path: './server/templates/jobs/new-candidate-to-recruiter.html',
      params: {
        job: job,
        jobUrl: getBaseUrl(job.url),
        candidate: candidate
      }
    }
  });
};

let encodeUrl = (title) => {
  let code = String(new Date().getTime() * 3).substr(8);
  return code + '-' + (title.replace(/[^a-z0-9]/gi, '-').toLowerCase());
};

module.exports = class Jobs {

  static create(req, res, next) {
    var params = req.body;
    params.title = params.title || '';
    params.url = encodeUrl(params.title);
    Model.create(params, (err, doc) => {
      if (!err && doc) {
        sendNewJobToRecruiter(doc, params);
      }
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static createPostulate(req, res, next) {
    var params = req.body;
    delete params._id;
    Model.findByIdAndUpdate(req.params.jobId, {
      $push: {
        postulations: params
      }
    }, {
      new: true
    }).lean().exec((err, doc) => {
      if (!err && doc) {
        sendJobToCandidate(doc, params);
        sendCandidateToRecruiter(doc, params);
        Subscriptions.jobNewsletter(req);
      }

      helpers.handleResponse(res, err, {
        success: !err
      }, next);
    });
  }

  static list(req, res, next) {
    Model.find({
      published: true
    }).sort('-created').select('-_id -postulations -contact').lean().exec((err, docs) => {
      helpers.handleResponse(res, err, docs, next);
    });
  }

  static read(req, res, next) {
    let params = req.params;
    let where = {
      published: true
    };

    if (req.params.jobId) {
      where._id = req.params.jobId;
    } else if (req.params.jobSlug) {
      where.url = req.params.jobSlug;
    }

    Model.findOne(where).select('-postulations -contact').lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

};
