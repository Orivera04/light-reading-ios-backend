const Meter = require('../models/Meter');
const Reading = require('../models/Reading');
const { dehumanizeString } = require('../helpers/utils');

const getAllMeters = async (req, res) => {
  try {
    const userId = req.uid;
    const meters = await Meter.find({ user: userId })
                              .select('id name tag desiredKwhMonthly currentReading');
    return res.json({ meters });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, message: 'Please, talk to the administrator.', translationKey: "talk_to_admin" });
  }
}

const getMeterById = async (req, res) => {
  const id = req.params.id;
  const userId = req.uid;

  try {
    let meterData = await Meter.findOne({ _id: id, user: userId })
                               .select('id name desiredKwhMonthly currentReading tag readings')
                               .populate('readings', 'KwhReading dateOfReading meter isCutoffDate');

    const lastCutOffReadingRecord = await Reading.findOne({ meter: id, isCutoffDate: true })
                                                 .sort({ dateOfReading: -1 })
                                                 .select('KwhReading dateOfReading');

    meterData.readings = meterData.readings.map(reading => {
      reading.accumulatedkWhReading = reading.KwhReading - (lastCutOffReadingRecord?.KwhReading || 0);
      return reading;
    });

    const secondLastCutOffReadingRecord = await Reading.findOne({ meter: id, isCutoffDate: true })
                                                       .sort({ dateOfReading: -1 })
                                                       .skip(1)
                                                       .select('KwhReading dateOfReading');

    const readingData = {
        lastInvoice: lastCutOffReadingRecord?.dateOfReading || null,
        lastReading: (lastCutOffReadingRecord?.KwhReading - secondLastCutOffReadingRecord?.KwhReading) || 0,
    };

    return res.json({ ...meterData.toObject(), ...readingData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, message: 'Please, talk to the administrator.', translationKey: "talk_to_admin" });
  }
}

const createMeter = async (req, res ) => {
  const meter = new Meter(req.body);

  try {
    meter.user = req.uid;
    await meter.save();

    return res.json({
      ok: true,
      message: 'Meter saved successfully.',
      translationKey: "meter_saved_successfully"
    });

  } catch (error) {
    console.log(error);
    return res.json({ ok: false, message: error.message, translationKey: dehumanizeString(error.message) });
  }
}

const updateMeter = async (req, res ) => {
  const meterId = req.params.id;
  const userId = req.uid;

  try {
    const meter = await Meter.findOne({ _id: meterId, user: userId })

    if (!meter) {
      return res.status(404).json({
        ok: false,
        message: 'The meter does not exist.',
        translationKey: "meter_doesnt_exist"
      });
    }

    if (meter.user.toString() !== userId) {
      return res.status(401).json({
        ok: false,
        message: 'you dont have the privilege to update this meter.',
        translationKey: "no_privilege_to_update_meter"
      });
    }

    const newMeter = {
      ...req.body
    }

    await Meter.findByIdAndUpdate(meterId, newMeter, { new: true });

    return res.json({
      ok: true,
      message: 'Meter updated successfully.',
      translationKey: "meter_updated_succesfully"
    });

  } catch (error) {
    console.log(error);
    return res.json({ ok: false, message: error.message, translationKey: dehumanizeString(error.message) });
  }
}

const deleteMeter = async( req, res ) => {
  const meterId = req.params.id;
  const userId = req.uid;

  try {
    const meter = await Meter.find({ _id: meterId, user: userId })

    if (!meter) {
      return res.status(404).json({
        ok: false,
        message: 'The meter does not exist.',
        translationKey: "meter_doenst_exist"
      });
    }

    if (meter.user.toString() !== userId ) {
      return res.status(401).json({
        ok: false,
        message: 'You dont have the privilege to delete this meter.',
        translationKey: "no_privilege_to_delete"
      });
    }

    await Meter.findByIdAndDelete(meterId);

    return res.json({
      ok: true,
      message: 'Meter deleted successfully.',
      translationKey: "meter_deleted_successfully"
    });
  } catch (error) {
    console.log(error);
    return res.json({ ok: false, message: error.message, translationKey: dehumanizeString(error.message) });
  }
};

module.exports = {
  getAllMeters,
  getMeterById,
  createMeter,
  updateMeter,
  deleteMeter
}
