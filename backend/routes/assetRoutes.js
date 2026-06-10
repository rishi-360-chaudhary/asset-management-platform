const express = require('express');
const router = express.Router();
const {addAsset, getAllAssets, getAssetById, updateAsset, deleteAsset} = require('../controllers/assetController');
const {protect, adminOnly} = require('../middleware/authMiddleware');

router.get('/', protect, getAllAssets);

router.get('/:id', protect, getAssetById);

router.post('/', protect, adminOnly, addAsset);

router.put('/:id', protect, adminOnly, updateAsset);

router.delete('/:id', protect, adminOnly, deleteAsset);

module.exports = router;