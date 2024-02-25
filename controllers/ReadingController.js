const Reading = require('../models/Reading');
const Meter = require('../models/Meter');
const { dehumanizeString } = require('../helpers/utils');

const getAllReadings = async (req, res) => {
  try {
    const userId = req.uid;
    const meters = await Meter.find({ user: userId }).select('_id');
    const readings = await Reading.find({ meter: { $in: meters } }).sort({ dateOfReading: -1 });
    return res.json({ ok: true, readings });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, message: error, translationKey: "talk_to_admin" });
  }
}

const getReadingById = async (req, res) => {
  const id = req.params.id;
  const userId = req.uid;
  const meters = await Meter.find({ user: userId }).select('_id');

  try {
    const reading = await Reading.find({ _id: id, meter: { $in: meters } });
    return res.json({ ok: true, reading });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, message: 'Please, talk to the administrator.', translationKey: "talk_to_admin" });
  }
}

const createReading = async (req, res ) => {
  const reading = new Reading(req.body);

  try {
    const storedReading = await reading.save();

    return res.json({
      ok: true,
      message: 'Reading saved successfully.',
      translationKey: "reading_saved_successfully"
    });

  } catch (error) {
    console.log(error);
    return res.json({ ok: false, message: error.message, translationKey: dehumanizeString(error.message) });
  }
}

const updateReading = async (req, res ) => {
  const readingId = req.params.id;

  try {
    const reading = await Reading.findById( readingId );

    if (!reading) {
      return res.status(404).json({
        ok: false,
        message: 'The reading does not exist.',
        translationKey: "reading_doesnt_exist"
      });
    }

    const newReading = {
      ...req.body
    }

    const updatedReading = await Reading.findByIdAndUpdate(readingId, newReading, { new: true });

    return res.json({
      ok: true,
      reading: updatedReading,
      translationKey: "reading_updated_succesfully"
    });

  } catch (error) {
    console.log(error);
    return res.json({ ok: false, message: error.message, translationKey: dehumanizeString(error.message) });
  }
}

const deleteReading = async( req, res ) => {
  const readingId = req.params.id;
  const uid = req.uid;

  try {
    const reading = await Reading.findById(readingId);

    if (!reading) {
      return res.status(404).json({
        ok: false,
        message: 'The reading does not exist.',
        translationKey: "reading_doesnt_exist"
      });
    }

    await Reading.findByIdAndDelete(readingId);

    return res.json({
      ok: true,
      message: 'Reading deleted successfully.',
      translationKey: "reading_deleted_successfully"
    });
  } catch (error) {
      console.log(error);
      return res.json({ ok: false, message: error.message, translationKey: dehumanizeString(error.message) });
    }
};

module.exports = {
  getAllReadings,
  getReadingById,
  createReading,
  updateReading,
  deleteReading
}
