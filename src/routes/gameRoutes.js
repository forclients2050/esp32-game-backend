const express = require('express');
const {
  uploadGame,
  getAllGames,
  getGame,
  downloadGame,
  deleteGame,
} = require('../controllers/gameController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/upload', auth, upload.single('file'), uploadGame);
router.get('/', auth, getAllGames);
router.get('/:gameId', auth, getGame);
router.get('/:gameId/download', auth, downloadGame);
router.delete('/:gameId', auth, deleteGame);

module.exports = router;
