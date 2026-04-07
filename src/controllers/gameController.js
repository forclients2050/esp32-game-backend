const fs = require('fs');
const path = require('path');
const Game = require('../models/Game');
const { HTTP_STATUS } = require('../config/constants');
const { validateGame } = require('../utils/validation');

const UPLOADS_DIR = path.resolve('uploads');

// Sanitize a file path by extracting only the basename and joining with the
// trusted uploads directory. This prevents path traversal and ensures all
// file operations stay within the uploads folder.
const safeFilePath = (filePath) => {
  const basename = path.basename(filePath);
  if (!basename || !basename.endsWith('.lua')) {
    throw new Error('Invalid file path');
  }
  return path.join(UPLOADS_DIR, basename);
};

// @desc    Upload a new game
// @route   POST /api/games/upload
// @access  Private
exports.uploadGame = async (req, res, next) => {
  try {
    const { error, value } = validateGame(req.body);
    if (error) {
      // Remove uploaded file if validation fails
      if (req.file) {
        try { fs.unlinkSync(safeFilePath(req.file.path)); } catch (_) { /* ignore */ }
      }
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message,
      });
    }

    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'No file uploaded. Please upload a .lua file',
      });
    }

    const resolvedPath = safeFilePath(req.file.path);

    const game = new Game({
      userId: req.userId,
      name: value.name,
      description: value.description || '',
      fileName: req.file.originalname,
      fileSize: req.file.size,
      filePath: resolvedPath,
    });

    await game.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Game uploaded successfully',
      game,
    });
  } catch (error) {
    // Clean up file on unexpected error
    if (req.file) {
      try {
        const p = safeFilePath(req.file.path);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      } catch (_) { /* ignore cleanup errors */ }
    }
    next(error);
  }
};

// @desc    Get all games for authenticated user
// @route   GET /api/games
// @access  Private
exports.getAllGames = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Game.countDocuments({ userId: req.userId });
    const games = await Game.find({ userId: req.userId })
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: games.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      games,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single game by ID
// @route   GET /api/games/:gameId
// @access  Private
exports.getGame = async (req, res, next) => {
  try {
    const game = await Game.findOne({ _id: req.params.gameId, userId: req.userId });

    if (!game) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Game not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      game,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download a game file
// @route   GET /api/games/:gameId/download
// @access  Private
exports.downloadGame = async (req, res, next) => {
  try {
    const game = await Game.findOne({ _id: req.params.gameId, userId: req.userId });

    if (!game) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Game not found',
      });
    }

    let resolvedPath;
    try {
      resolvedPath = safeFilePath(game.filePath);
    } catch (_) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Game file not found on server',
      });
    }

    if (!fs.existsSync(resolvedPath)) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Game file not found on server',
      });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${game.fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.download(resolvedPath, game.fileName);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a game
// @route   DELETE /api/games/:gameId
// @access  Private
exports.deleteGame = async (req, res, next) => {
  try {
    const game = await Game.findOne({ _id: req.params.gameId, userId: req.userId });

    if (!game) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Game not found',
      });
    }

    // Delete the file from disk
    try {
      const resolvedPath = safeFilePath(game.filePath);
      if (fs.existsSync(resolvedPath)) fs.unlinkSync(resolvedPath);
    } catch (_) { /* ignore if file already gone */ }

    await Game.deleteOne({ _id: req.params.gameId });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Game deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
