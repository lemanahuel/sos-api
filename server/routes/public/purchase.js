'use strict';

const Purchase = require('../../controllers/purchase');

module.exports = (app) => {

  app.route('/purchase/create').post(Purchase.create);
  app.route('/purchase/effective').post(Purchase.effective);
  app.route('/purchase/ok').post(Purchase.payOk);
  app.route('/purchase/fail').post(Purchase.payFail);

  // app.route('/purchase/ar/effective').post(Purchase.effectiveAR);
  // app.route('/purchase/uy/effective').post(Purchase.effectiveUY);
  // app.route('/purchase/cl/effective').post(Purchase.effectiveCL);
  // app.route('/purchase/ar/ok').post(Purchase.payOkAR);
  // app.route('/purchase/uy/ok').post(Purchase.payOkUY);
  // app.route('/purchase/cl/ok').post(Purchase.payOkCL);
  // app.route('/purchase/ar/fail').post(Purchase.payFailAR);
  // app.route('/purchase/uy/fail').post(Purchase.payFailUY);
  // app.route('/purchase/cl/fail').post(Purchase.payFailCL);

  app.route('/save-customer-stripe').post(Purchase.payStripe);

};
