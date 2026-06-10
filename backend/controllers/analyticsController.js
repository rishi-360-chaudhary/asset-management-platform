const Booking = require('../models/Booking');
const Asset = require('../models/Asset');
const User = require('../models/User');

const getDashboardStats = async (req, res) => {
  try{

    const totalAssets = await Asset.countDocuments();
    const totalUsers = await User.countDocuments({role: 'user'});
    const totalBookings = await Booking.countDocuments();

    const pendingCount = await Booking.countDocuments({status: 'pending'});
    const approvedCount = await Booking.countDocuments({status: 'approved'});
    const rejectedCount = await Booking.countDocuments({status: 'rejected'});
    const issuedCount = await Booking.countDocuments({status: 'issued'});
    const returnedCount = await Booking.countDocuments({status: 'returned'});

    const today = new Date();
    const issuedBookings = await Booking.find({status: 'issued'});
    const overdueCount = issuedBookings.filter(booking => {
      if(!booking.issuedAt)return false;
      const requestedDuration = new Date(booking.endDate) - new Date(booking.startDate);
      const actualDueDate = new Date(booking.issuedAt.getTime() + requestedDuration);
      return actualDueDate < today;
    }).length;

    const availableAssets = await Asset.countDocuments({status: 'Available'});
    const unavailableAssets = await Asset.countDocuments({status: 'Unavailable'});

    const mostBorrowedAssets = await Booking.aggregate([
      {
        $group: {
          _id: '$asset',           
          borrowCount: {$sum: 1} 
        }
      },
      {
        $sort: {borrowCount: -1}
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'assets',       
          localField: '_id',   
          foreignField: '_id', 
          as: 'assetDetails'   
        }
      },
      {
        $unwind: '$assetDetails'
      },
      {
        $project: {
          borrowCount: 1,
          name: '$assetDetails.name',
          category: '$assetDetails.category'
        }
      }
    ]);

    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('asset', 'name category')
      .sort({ createdAt: -1 })
      .limit(5);

    const categoryBreakdown = await Asset.aggregate([
      {
        $group: {
          _id: '$category',
          count: {$sum: 1}
        }
      },
      {
        $sort: {count: -1}
      }
    ]);
    res.json({
      summary: {
        totalAssets,
        totalUsers,
        totalBookings,
        availableAssets,
        unavailableAssets,
        overdueCount
      },
      bookingStatusBreakdown: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        issued: issuedCount,
        returned: returnedCount
      },
      mostBorrowedAssets,
      recentBookings,
      categoryBreakdown
    });

  } 
  catch(error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

module.exports = {getDashboardStats};