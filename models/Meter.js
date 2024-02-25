const { Schema, model } = require('mongoose');

const MeterSchema = Schema({
  id: {
    type: String,
  },
  name: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    required: true,
  },
  desiredKwhMonthly: {
    type: Number,
    default: 0
  },
  currentReading: {
    type: Number,
    default: 0
  },
  readings: [{
     type: Schema.Types.ObjectId,
     ref: 'Reading'
  }],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

MeterSchema.method('toJSON', function() {
  const { __v, _id, ...Object } = this.toObject();
  Object.id = _id;
  return Object;
});


module.exports = model('Meter', MeterSchema);
