const { Schema, model } = require('mongoose');
const Meter = require('../models/Meter');

const ReadingSchema = Schema({
  id: {
    type: String
  },
  KwhReading: {
    type: Number,
    required: true
  },
  accumulatedkWhReading: {
    type: Number
  },
  dateOfReading: {
    type: Date,
    required: true
  },
  isCutoffDate: {
    type: Boolean,
    required: true
  },
  meter: {
    type: Schema.Types.ObjectId,
    ref: 'Meter',
    required: true
  }
}, { toJSON: { getters: true, virtuals: true } });

// Indexs
ReadingSchema.index({ meter: 1, dateOfReading: 1 }, { unique: true });

// Validations
const validateAtLeastOneCutoffExists = async function(record) {
  const existsCutOffInMonth = await record.model('Reading').findOne({ meter: record.meter, isCutoffDate: true });

  if (!existsCutOffInMonth && !record.isCutoffDate) {
    throw new Error('You need to have at least one cutoff reading before recording more readings.');
  }
}

const validateCutOffNotRepeated = async function(record) {
  const dateOfReading = new Date(record.dateOfReading);
  const firstDayOfMonth = new Date(dateOfReading.getFullYear(), dateOfReading.getMonth(), 1);
  const lastDayOfMonth = new Date(dateOfReading.getFullYear(), dateOfReading.getMonth() + 1, 0);

  const existsCutOffInMonth = await record.model('Reading').findOne({ meter: this.meter, isCutoffDate: true, dateOfReading: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }});

  if (this.isCutoffDate && existsCutOffInMonth) {
    throw new Error('There is already a cutoff reading in this month for this meter.');
  }
}

const validateReadingNotRepeated = async function(record) {
  const dateOfReading = new Date(record.dateOfReading);
  const readingDateExists = await record.model('Reading').findOne({ meter: record.meter, dateOfReading: dateOfReading });

  if (readingDateExists) {
    throw new Error('There is already a reading for this date.');
  }
}

const validateLastReadingBigger = async function(record) {
  const lastReading = await record.model('Reading').findOne({ meter: record.meter }).sort({ dateOfReading: -1 });

  if (lastReading && record.KwhReading < lastReading.KwhReading) {
    throw new Error('The reading is less than the last reading.');
  }
}

const validateBeforeDestroy = async function(record) {
  const lastReading = await record.model('Reading').findOne({ meter: record.meter }).sort({ dateOfReading: -1 });

  if (!lastReading._id.equals(record._id)) {
    throw new Error('You can only delete the last reading.');
  }
}

// Events
ReadingSchema.pre('validate', async function(next) {
  try {
    await validateAtLeastOneCutoffExists(this);
    await validateCutOffNotRepeated(this);
    await validateReadingNotRepeated(this);
    await validateLastReadingBigger(this);

    next();
  } catch (error) {
    next(error);
  }
});

// Calculate the current kwh reading incluiding this reading
ReadingSchema.pre('save', async function(next) {
  try {
    const lastCutOffRecord = await this.model('Reading').findOne({ meter: this.meter, isCutoffDate: true });

    this.accumulatedkWhReading = (lastCutOffRecord?.KwhReading) ? this.KwhReading - lastCutOffRecord.KwhReading : 0;

    next();
  } catch (error) {
    next(error);
  }
});

// Store a new reading and update the meter's current reading
ReadingSchema.post('save', async function(_, next) {
  try {
    const meter = await Meter.findById(this.meter);
    const lastCutOffRecord = await this.model('Reading').findOne({ meter: this.meter, isCutoffDate: true });

    if (this.isCutoffDate) {
      meter.currentReading = 0
    } else {
      meter.currentReading = (lastCutOffRecord?.KwhReading || false) ? this.KwhReading - lastCutOffRecord?.KwhReading : 0;
    }

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

ReadingSchema.post('findOneAndUpdate', async function(next) {
  // If the reading is the most recent reading, then update the meter's current reading
  const reading = await this.model.findOne(this.getQuery());
  const lastReading = await this.model.findOne({ meter: reading.meter }).sort({ dateOfReading: -1 });
  const lastCutOffRecord = await this.model('Reading').findOne({ meter: this.meter, isCutoffDate: true });

  if (reading._id.equals(lastReading._id)) {
    reading.meter.currentReading = (lastCutOffRecord?.KwhReading) ? reading.KwhReading - lastCutOffRecord.KwhReading : 0;
    reading.meter.save();

    next();
  }
});

ReadingSchema.pre('deleteOne', async function(next) {
  try {
    await validateBeforeDestroy(this);

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = model('Reading', ReadingSchema);
