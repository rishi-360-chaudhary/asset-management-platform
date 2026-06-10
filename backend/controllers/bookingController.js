const Booking = require('../models/Booking');
const Asset = require('../models/Asset');

const createBooking = async (req, res) => {
  try{
    const {assetId, quantity, purpose, startDate, endDate} = req.body;

    if(!assetId || !quantity || !purpose || !startDate || !endDate){
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const asset = await Asset.findById(assetId);
    if(!asset){
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (asset.availableQuantity < quantity) {
      return res.status(400).json({ 
        message: `Only ${asset.availableQuantity} units available` 
      });
    }

    const booking = await Booking.create({
      user: req.user.id,   
      asset: assetId,      
      quantity,
      purpose,
      startDate,
      endDate,
      status: 'pending'     
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('asset', 'name category')
      .populate('user', 'name email');

    res.status(201).json({ 
      message: 'Booking request submitted successfully', 
      booking: populatedBooking 
    });

  } 
  catch(error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

const getAllBookings = async (req, res) => {
  try{
    const bookings = await Booking.find()
      .populate('asset', 'name category availableQuantity')
      .populate('user', 'name email')
      .sort({ createdAt: -1 }); 

    res.json(bookings);

  } 
  catch(error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

const getMyBookings = async (req, res) => {
  try{
    const bookings = await Booking.find({user: req.user.id})
      .populate('asset', 'name category')
      .sort({createdAt: -1});

    res.json(bookings);

  } 
  catch(error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

const approveBooking = async (req, res) => {
  try{
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    const asset = await Asset.findById(booking.asset);
    if (asset.availableQuantity < booking.quantity) {
      return res.status(400).json({ message: 'Not enough quantity available anymore' });
    }

    asset.availableQuantity -= booking.quantity;

    if (asset.availableQuantity === 0) {
      asset.status = 'Unavailable';
    }
    await asset.save();

    booking.status = 'approved';
    await booking.save();

    res.json({message: 'Booking approved successfully', booking});

  } 
  catch(error) {
    res.status(500).json({message: 'Server error', error: error.message });
  }
};

const rejectBooking = async (req, res) => {
  try{
    const {reason} = req.body;

    const booking = await Booking.findById(req.params.id);
    if(!booking){
      return res.status(404).json({message: 'Booking not found'});
    }

    if(booking.status !== 'pending'){
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    booking.status = 'rejected';
    booking.rejectionReason = reason || 'No reason provided';
    await booking.save();

    res.json({message: 'Booking rejected', booking });

  } 
  catch(error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

const issueAsset = async (req, res) => {
  try{
    const booking = await Booking.findById(req.params.id);
    if(!booking){
      return res.status(404).json({ message: 'Booking not found' });
    }

    if(booking.status !== 'approved'){
      return res.status(400).json({ message: 'Booking must be approved before issuing' });
    }

    booking.status = 'issued';
    booking.issuedAt = new Date();
    await booking.save();

    res.json({message: 'Asset issued successfully', booking});

  }
  catch(error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

const returnAsset = async (req, res) => {
  try{
    const booking = await Booking.findById(req.params.id);
    if(!booking){
      return res.status(404).json({ message: 'Booking not found' });
    }

    if(booking.status !== 'issued'){
      return res.status(400).json({message: 'Asset must be issued before returning'});
    }

    const asset = await Asset.findById(booking.asset);
    asset.availableQuantity += booking.quantity;

    if(asset.availableQuantity > 0){
      asset.status = 'Available';
    }
    await asset.save();

    booking.status = 'returned';
    booking.returnedAt = new Date();
    await booking.save();

    res.json({message: 'Asset returned successfully', booking});

  } 
  catch(error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

module.exports = { 
  createBooking, 
  getAllBookings, 
  getMyBookings, 
  approveBooking, 
  rejectBooking, 
  issueAsset, 
  returnAsset 
};