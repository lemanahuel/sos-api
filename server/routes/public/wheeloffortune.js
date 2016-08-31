'use strict';

const WheelOfFortune = require('../../controllers/wheeloffortune');

module.exports = (app) => {

  //WHEEL OF FORTUNE
  app.route('/wheeloffortune/player').post(WheelOfFortune.recordPlayer);
  app.route('/wheeloffortune/completeplayed').post(WheelOfFortune.completePlayed);
  //ADMIN WHEEL OF FORTUNE CODE
  app.route('/wheelcodes').get(WheelOfFortune.readCodes);
  app.route('/wheelplayers').get(WheelOfFortune.readPlayers);
  //app.route('/wheelplayer/download').get(WheelOfFortune.exportPlayers);


};
