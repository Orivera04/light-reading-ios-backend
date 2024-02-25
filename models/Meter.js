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

// Validations
const validateBeforeDestroy = async function(record) {
  const readingExists = await record.model('Reading').findOne({ meter: record._id });

  if (readingExists) {
    throw new Error('The meter has readings associated.');
  }
}

// Events

MeterSchema.pre('deleteOne', async function(next) {
  try {
    await validateBeforeDestroy(this);

    next();
  } catch (error) {
    next(error);
  }
});


module.exports = model('Meter', MeterSchema);
