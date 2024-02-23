const Meter = require('../models/Meter');

const getAllMeters = async (_, res) => {
  try {
    const meters = await Meter.find();
    return res.json({ ok: true, meters });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, message: 'Please, talk to the administrator.', translationKey: "talk_to_admin" });
  }
}

const getMeterById = async (req, res) => {
  const id = req.params.id;

  try {
    const meter = await Meter.findById(id);
    return res.json({ ok: true, meter });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, message: 'Please, talk to the administrator.', translationKey: "talk_to_admin" });
  }
}

const createMeter = async (req, res ) => {
  const meter = new Meter(req.body);

  try {
    meter.user = req.uid;

    const storedMeter = await meter.save();

    return res.json({
      ok: true,
      storedMeter,
      translationKey: "meter_saved_successfully"
    });

  } catch (error) {
    console.log(error);
  }
}

const updateMeter = async (req, res ) => {
  const meterId = req.params.id;
  const uid = req.uid;

  try {
    const meter = await Meter.findById( meterId );
    meter.user = req.uid;

    if (!meter) {
      return res.status(404).json({
        ok: false,
        message: 'The meter does not exist.',
        translationKey: "meter_doesnt_exist"
      });
    }

    if ( meter.user.toString() !== uid ) {
      return res.status(401).json({
        ok: false,
        message: 'you dont have the privilege to update this meter.'
      });
    }

    const newMeter = {
      ...req.body
    }

    const updatedMeter = await Meter.findByIdAndUpdate(meterId, newMeter, { new: true });

    return res.json({
      ok: true,
      meter: updatedMeter,
      translationKey: "meter_updated_succesfully"
    });

  } catch (error) {
    console.log(error);
  }
}

const deleteMeter = async( req, res ) => {
  const meterId = req.params.id;
  const uid = req.uid;

  try {
    const meter = await Meter.findById(meterId);

    if (!meter) {
      return res.status(404).json({
        ok: false,
        message: 'The meter does not exist.',
        translationKey: "meter_doenst_exist"
      });
    }

    if (meter.user.toString() !== uid ) {
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
      return res.status(500).json({
          ok: false,
          message: 'Please, talk to the administrator.', translationKey: "talk_to_admin"
      });
  }
};

module.exports = {
  getAllMeters,
  getMeterById,
  createMeter,
  updateMeter,
  deleteMeter
}