'use strict';

const helpers = require('../helpers'),
  leadHelper = require('../helpers/lead'),
  MailHelper = require('../helpers/mail'),
  Wheel_Code = require('../models/wheel_code').model,
  Wheel_Played = require('../models/wheel_played').model,
  Wheel_Player = require('../models/wheel_player').model,
  Wheel_Prize = require('../models/wheel_prize').model,
  ObjectId = require('mongoose').Types.ObjectId,
  Subscriptions = require('./subscriptions'),
  fs = require('fs'),
  _ = require('lodash'),
  Q = require('q');

const mails = {
  ar: 'hola@coderhouse.com',
  cl: 'chile@coderhouse.com',
  uy: 'uruguay@coderhouse.com'
};

module.exports = class WheelOfFortune {

  static recordPlayer(req, res, next) {
    let params = req.body;

    WheelOfFortune.isValidCode(params).then(function (validCode) {
      console.log(validCode);
      let player;

      let _countPlayed = function () {
        console.log('countPlayed');
        let cantPlayed = 1;

        WheelOfFortune.setLastPlayed(player, validCode.test).then(function (lastPlayed) {
          console.log('countPlayed lastPlayed');
          console.log('lastPlayed: ' + lastPlayed);

          cantPlayed = lastPlayed.played;
          console.log('WheelOfFortune ' + validCode.test + ' --- ' + cantPlayed);

          WheelOfFortune.getPrizeRandom(validCode.test, cantPlayed)
            .then(function (prize) {
              console.log('Prize: ' + prize);

              player.prize_id = prize.id;
              player.save();

              helpers.handleResponse(res, null, {
                success: true,
                data: {
                  player: player,
                  prize: {
                    id: prize.id,
                    name: prize.name
                  }
                }
              });
            });
        });
      };

      if (validCode.valid) {
        console.log(validCode);
        if (validCode.player === null) {
          console.log('jugador nuevo');
          //crea un nuevo player
          console.log(params.name || '');
          console.log(params.email);
          console.log(params.phone || '');
          console.log(validCode.code_id);
          var mplayer = {
            name: params.name || '',
            email: params.email,
            phone: params.phone || '',
            country: validCode.country || 'ar',
            code_id: validCode.code_id
          };

          console.log(mplayer);

          Wheel_Player.create(mplayer, (err, doc) => {
            if (err) {
              console.log(err);

              return false;
            }

            player = doc;

            player.save();

            console.log('create player ' + player);

            WheelOfFortune.setUsedCode(validCode.code_id);

            _countPlayed();
          });
        } else {
          //actualiza ese registro
          console.log('jugador registrado que no finalizo el juego');
          console.log(validCode.player);
          player = validCode.player;

          _countPlayed();
        }
      } else {
        helpers.handleResponse(res, null, {
          success: false,
          error: validCode['code_id'] ? 'Codigo invalido.' : 'Este codigo ya fue utilizado.'
        });
      }
    });
  }

  static completePlayed(req, res, next) {
    var params = req.body;

    Wheel_Player.findById(params.player._id).exec((err, player) => {
      player.confirmed = true;
      player.save();

      leadHelper.create({
        first_name: player.name,
        last_name: '',
        carrera: '',
        curso: '',
        pais: player.country || 'ar',
        tel: !player.phone ? 0 : player.phone,
        type: 'meetup'
      });

      MailHelper.send({
        toEmail: player.email,
        country: player.country || 'ar',
        subject: 'Bienvenido a Coderhouse!',
        tpl: {
          path: './server/templates/subscriptions/wheel-of-fortune.html',
          params: {
            name: params.player.name,
            prize: params.prize.name
          }
        }
      });

      helpers.handleResponse(res, err, {
        success: true
      });
    });
  }

  static readCodes(req, res, next) {
    Wheel_Code.find({}).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static readPlayers(req, res, next) {
    Wheel_Player.find().sort('-_id').lean().exec((err, docs) => {
      _.each(docs, (doc) => {
        doc.created = ObjectId(doc._id).getTimestamp();
      });
      helpers.handleResponse(res, err, docs);
    });
  }


  static isValidCode(params) {
    console.log('isValidCode');
    var validateCode = {
      'code_id': null,
      'test': false,
      'player': null,
      'valid': true,
      'country': ''
    };

    var deferred = Q.defer();

    if (params.code && params !== '') {
      console.log('IF params.code && params !== ');
      console.log(params);
      Wheel_Code.find({
        code: params.code
      }).lean().exec((err, code) => {
        console.log(code);
        if (code.length) {
          console.log('Existe el codigo');

          validateCode.code_id = code[0]._id;
          validateCode.test = code[0].test;
          validateCode.country = code[0].country || 'ar';

          if (code[0].used && !code[0].test) {
            if (code[0].multiuser) {
              Wheel_Player.findOne({
                code_id: ObjectId(code[0]._id),
                email: params.email
              }).exec((err, player) => {
                if (player) {
                  if (player.email === params.email && player.confirmed) {
                    validateCode['player'] = player;
                  } else {
                    validateCode['valid'] = false;
                  }
                }
                console.log('resolve 1');
                deferred.resolve(validateCode);
              });

            } else {
              console.log('resolve 2');
              deferred.resolve(validateCode);
            }
          } else {
            console.log('resolve Test');
            deferred.resolve(validateCode);
          }
        } else {
          console.log('NO Existe el codigo');
          validateCode.valid = false;

          console.log('resolve 3');
          deferred.resolve(validateCode);
        }
      });
    } else {
      validateCode.valid = false;
      console.log('resolve 4');
      deferred.resolve(validateCode);
    }

    return deferred.promise;
  }

  static setUsedCode(idCode) {
    console.log('setUsedCode');
    Wheel_Code.findOne({
      _id: ObjectId(idCode)
    }).exec((err, code) => {
      code.used = true;
      code.save();
    });
  }

  /**
   *
   * return object
   */
  static getPrizeRandom(test, cantPlayed) {
    console.log('getPrizeRandom');

    var idPrize = WheelOfFortune.getPrizeForRange(cantPlayed);
    console.log('getPrizeRandom: idPrize ' + idPrize);
    var deferred = Q.defer();

    Wheel_Prize.findOne({
      id: idPrize
    }).exec((err, prize) => {
      if (test) {
        prize.quantity_used += 1;
        prize.save();
      }


      deferred.resolve(prize);
    });

    return deferred.promise;
  }

  static setLastPlayed(player, test) {
    console.log('setLastPlayed');
    console.log(player);

    let deferred = Q.defer();
    let lastPlayed;

    let _setPlayed = function () {
      console.log('private setPlayed');
      console.log(lastPlayed);

      var idPlayed = lastPlayed._id;
      lastPlayed.id_last_player = player._id;
      delete lastPlayed._id;

      Wheel_Played.findByIdAndUpdate(idPlayed, {
        $set: {
          id: lastPlayed.id,
          id_last_player: lastPlayed.id_last_player,
          played: lastPlayed.played
        }
      }, {
        new: true
      }).lean().exec((err, doc) => {
        console.log('doc: ' + err);
        deferred.resolve(lastPlayed);
      });
    };

    Wheel_Played.find({}).sort({
      $natural: -1
    }).limit(1).exec((err, played) => {
      console.log(played);
      if (played.length) {
        lastPlayed = played[0]; //last row

        console.log('Existe jugadas');
        console.log('Ultima Jugada' + lastPlayed);

        if (lastPlayed.played === 100) {
          WheelOfFortune.createPlayed(lastPlayed.id).then(function (played) {
            lastPlayed = played;

            _setPlayed();
          });
        } else {
          lastPlayed.played += 1;
          console.log('CANTIDAD DE JUGADAS: ' + lastPlayed.played);

          _setPlayed();
        }
      } else {
        console.log('No existen jugadas');

        WheelOfFortune.createPlayed(0).then(function (played) {
          lastPlayed = played;

          _setPlayed();
        });
      }
    });

    return deferred.promise;
  }

  static createPlayed(idPlayed) {
    //Insertar la primera rueda
    //this.resetPrize();
    console.log('createPlayed');
    var deferred = Q.defer();
    idPlayed += 1;
    Wheel_Played.create({
      id: idPlayed,
      played: 1
    }, (err, played) => {
      console.log('createPlayed resolve');
      deferred.resolve(played);
    });

    return deferred.promise;

    //return
  }

  resetPrize() {
    /*Model::unguard();

    \DB::table('wheel_of_fortune_prize')->delete();

    $prizes = array(
        ['id' : 1, 'name' : '5% off', 'quantity' : 5, 'quantity_used' : 0],
        ['id' : 2,'name' : 'Beca completa Workshop', 'quantity' : 2, 'quantity_used' : 0],
        ['id' : 3,'name' : '10% off', 'quantity' : 35, 'quantity_used' : 0],
        ['id' : 4,'name' : 'Kit Coderhouse', 'quantity' : 10, 'quantity_used' : 0],
        ['id' : 5,'name' : '40% off', 'quantity' : 15, 'quantity_used' : 0],
        ['id' : 6,'name' : '50% off', 'quantity' : 6, 'quantity_used' : 0],
        ['id' : 7,'name' : 'Beca completa Curso', 'quantity' : 2, 'quantity_used' : 0],
        ['id' : 8,'name' : '20% off', 'quantity' : 25, 'quantity_used' : 0]
    );

    foreach ($prizes as $prize) {
        WheelOfFortunePrize::create($prize);
    }

    Model::reguard();*/
  }

  static getPrizeForRange(cantPlayed) {
    console.log('getPrizeForRange: ' + cantPlayed);
    var prize = {
      1: 6,
      2: 8,
      3: 3,
      4: 8,
      5: 5,
      6: 8,
      7: 1,
      8: 3,
      9: 3,
      10: 8, //8 : 4, 7 : 0, 6 : 1, 5 : 1, 4 : 0, 3 : 3, 2 : 0, 1 : 1
      11: 3,
      12: 3,
      13: 1,
      14: 8,
      15: 5,
      16: 1,
      17: 3,
      18: 5,
      19: 8,
      20: 3, //8 : 2, 7 : 0, 6 : 0, 5 : 2, 4 : 0, 3 : 4, 2 : 0, 1 : 2
      21: 3,
      22: 8,
      23: 6,
      24: 5,
      25: 8,
      26: 4,
      27: 1,
      28: 3,
      29: 2,
      30: 5, //8 : 2, 7 : 0, 6 : 1, 5 : 2, 4 : 1, 3 : 2, 2 : 1, 1 : 1
      31: 6,
      32: 8,
      33: 5,
      34: 3,
      35: 8,
      36: 6,
      37: 8,
      38: 3,
      39: 8,
      40: 3, //8 : 4, 7 : 0, 6 : 2, 5 : 1, 4 : 0, 3 : 3, 2 : 0, 1 : 0
      41: 3,
      42: 5,
      43: 8,
      44: 6,
      45: 5,
      46: 8,
      47: 3,
      48: 8,
      49: 7,
      50: 3, //8 : 3, 7 : 1, 6 : 1, 5 : 2, 4 : 0, 3 : 3, 2 : 0, 1 : 0
      51: 5,
      52: 8,
      53: 3,
      54: 8,
      55: 3,
      56: 8,
      57: 1,
      58: 3,
      59: 8,
      60: 8, //8 : 5, 7 : 0, 6 : 0, 5 : 1, 4 : 0, 3 : 3, 2 : 0, 1 : 1
      61: 3,
      62: 6,
      63: 3,
      64: 5,
      65: 8,
      66: 3,
      67: 3,
      68: 3,
      69: 3,
      70: 2, //8 : 1, 7 : 0, 6 : 1, 5 : 1, 4 : 0, 3 : 6, 2 : 1, 1 : 0
      71: 3,
      72: 4,
      73: 3,
      74: 8,
      75: 3,
      76: 4,
      77: 3,
      78: 3,
      79: 8,
      80: 3, //8 : 1, 7 : 0, 6 : 0, 5 : 0, 4 : 2, 3 : 6, 2 : 0, 1 : 0
      81: 8,
      82: 5,
      83: 8,
      84: 8,
      85: 8,
      86: 3,
      87: 3,
      88: 5,
      89: 3,
      90: 5, //8 : 4, 7 : 0, 6 : 0, 5 : 3, 4 : 0, 3 : 3, 2 : 0, 1 : 0
      91: 6,
      92: 3,
      93: 1,
      94: 3,
      95: 3,
      96: 8,
      97: 5,
      98: 8,
      99: 5,
      100: 7 //8 : 2, 7 : 1, 6 : 1, 5 : 1, 4 : 0, 3 : 3, 2 : 0, 1 : 1
    };

    return prize[cantPlayed];
  }
};
