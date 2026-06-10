const Asset = require('../models/Asset');

const addAsset = async (req, res) => {
  try{
    const {name,category, description, totalQuantity} = req.body;

    if(!name || !category || !totalQuantity){
      return res.status(400).json({message: 'Please provide name, category and quantity'});
    }

    const asset = await Asset.create({
      name,
      category,
      description,
      totalQuantity,
      availableQuantity: totalQuantity, 
      addedBy: req.user.id              
    });

    res.status(201).json({ message: 'Asset added successfully', asset });

  } 
  catch(error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllAssets = async (req, res) => {
  try{
    const assets = await Asset.find()
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(assets);

  } 
  catch(error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('addedBy', 'name email');

    if(!asset){
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json(asset);

  } 
  catch(error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

const updateAsset = async (req, res) => {
  try{
    const {name, category, description, totalQuantity, status} = req.body;

    const asset = await Asset.findById(req.params.id);
    if(!asset){
      return res.status(404).json({ message: 'Asset not found' });
    }

    let newAvailableQuantity = asset.availableQuantity;
    if(totalQuantity && totalQuantity !== asset.totalQuantity){
      const difference = totalQuantity - asset.totalQuantity;
      newAvailableQuantity = asset.availableQuantity + difference;
      if (newAvailableQuantity < 0) newAvailableQuantity = 0;
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
      req.params.id,
      {
        name: name || asset.name,
        category: category || asset.category,
        description: description || asset.description,
        totalQuantity: totalQuantity || asset.totalQuantity,
        availableQuantity: newAvailableQuantity,
        status: status || asset.status
      },
      { new: true } 
    );

    res.json({ message: 'Asset updated successfully', asset: updatedAsset });

  } 
  catch(error) {
    res.status(500).json({ message: 'Server error', error: error.message});
  }
};

const deleteAsset = async (req, res) => {
  try{
    const asset = await Asset.findById(req.params.id);
    if(!asset){
      return res.status(404).json({ message: 'Asset not found' });
    }

    await Asset.findByIdAndDelete(req.params.id);

    res.json({ message: 'Asset deleted successfully' });

  } 
  catch(error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {addAsset, getAllAssets, getAssetById, updateAsset, deleteAsset};