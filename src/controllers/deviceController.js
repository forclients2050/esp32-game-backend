const Device = require('../models/Device');
const { HTTP_STATUS } = require('../config/constants');
const { validateDevice } = require('../utils/validation');

// @desc    Add a new device
// @route   POST /api/devices
// @access  Private
exports.addDevice = async (req, res, next) => {
  try {
    const { error, value } = validateDevice(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const existingDevice = await Device.findOne({ macAddress: value.macAddress });
    if (existingDevice) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'A device with this MAC address already exists',
      });
    }

    const device = new Device({
      userId: req.userId,
      ...value,
    });

    await device.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Device added successfully',
      device,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all devices for authenticated user
// @route   GET /api/devices
// @access  Private
exports.getAllDevices = async (req, res, next) => {
  try {
    const devices = await Device.find({ userId: req.userId }).sort({ createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: devices.length,
      devices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single device by ID
// @route   GET /api/devices/:deviceId
// @access  Private
exports.getDevice = async (req, res, next) => {
  try {
    const device = await Device.findOne({ _id: req.params.deviceId, userId: req.userId });

    if (!device) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Device not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      device,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update device status
// @route   PUT /api/devices/:deviceId/status
// @access  Private
exports.updateDeviceStatus = async (req, res, next) => {
  try {
    const validStatuses = ['connected', 'disconnected', 'error'];
    const rawStatus = req.body.status;
    if (!rawStatus || !validStatuses.includes(rawStatus)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Use the index to get a safe, guaranteed string value (prevents NoSQL injection)
    const safeStatus = validStatuses[validStatuses.indexOf(rawStatus)];

    const updateData = { status: safeStatus };
    if (safeStatus === 'connected') {
      updateData.lastConnectionTime = new Date();
    }

    const device = await Device.findOneAndUpdate(
      { _id: req.params.deviceId, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!device) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Device not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Device status updated successfully',
      device,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a device
// @route   DELETE /api/devices/:deviceId
// @access  Private
exports.deleteDevice = async (req, res, next) => {
  try {
    const device = await Device.findOneAndDelete({ _id: req.params.deviceId, userId: req.userId });

    if (!device) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Device not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Device deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
