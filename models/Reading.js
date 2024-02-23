const { Schema, model } = require('mongoose');
const Meter = require('../models/Meter');

const ReadingSchema = Schema({
  KwhReading: {
    type: Number,
    required: true
  },
  dateOfReading: {
    type: Date,
    required: true,
    unique: true
  },
  isLastCycle: {
    type: Boolean,
    required: true
  },
  meter: {
    type: Schema.Types.ObjectId,
    ref: 'Meter',
    required: true
  }
});

// Events

ReadingSchema.pre('save', async function(next) {
  try {
    const meter = await Meter.findById(this.meter);

    const lastReadingCycle = await this.model('Reading').findOne({ meter: this.meter, isLastCycle: true })
    console.log(lastReadingCycle);

    meter.currentReading = (lastReadingCycle?.KwhReading) ? this.KwhReading - lastReadingCycle.KwhReading : 0;

    meter.readings.unshift(this._id);

    if (meter.readings.length > 30) {
      meter.readings = meter.readings.slice(0, 30);
    }

    await meter.save();

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = model('Reading', ReadingSchema);
