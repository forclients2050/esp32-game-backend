const express = require('express');
const {
  addDevice,
  getAllDevices,
  getDevice,
  updateDeviceStatus,
  deleteDevice,
} = require('../controllers/deviceController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, addDevice);
router.get('/', auth, getAllDevices);
router.get('/:deviceId', auth, getDevice);
router.put('/:deviceId/status', auth, updateDeviceStatus);
router.delete('/:deviceId', auth, deleteDevice);

module.exports = router;
