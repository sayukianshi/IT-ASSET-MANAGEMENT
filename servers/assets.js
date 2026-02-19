const express = require('express');
const Asset = require('../models/Asset');
const User = require('../models/User');

const router = express.Router();

// @desc    Get all assets
// @route   GET /api/assets
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Build query
    let query = {};

    // Search functionality
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { assetTag: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Execute query
    const assets = await Asset.find(query)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // Get total count
    const total = await Asset.countDocuments(query);

    res.status(200).json({
      success: true,
      data: assets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get single asset
// @route   GET /api/assets/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate(
      'assignedTo',
      'name email department phone'
    );

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Create new asset
// @route   POST /api/assets
// @access  Private
router.post('/', async (req, res) => {
  try {
    const asset = await Asset.create(req.body);

    // Populate assigned user info
    await asset.populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    let asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    await asset.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;