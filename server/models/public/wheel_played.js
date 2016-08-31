'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  id: {
    type: Number
  },
  played: {
    type: Number
  },
  id_last_player: {
    type: Number,
    default: 0
  }

});

module.exports.model = mongoose.model('Wheel_played', schema, 'wheel_played');
