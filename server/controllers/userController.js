const User = require('../models/User');
const Resource = require('../models/Resource');
const Order = require('../models/Order');
const ActivationCode = require('../models/ActivationCode');
const { success, error, paginate } = require('../utils/response');

// Get user dashboard
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user with populated data
    const user = await User.findById(userId)
      .populate('favorites', 'title thumbnailUrl downloadCount')
      .populate('orders', 'orderNumber membershipType amount paymentStatus paidAt');

    // Get user statistics
    const totalDownloads = await Resource.countDocuments({ 
      uploadedBy: userId,
      status: 'active'
    });

    const totalOrders = await Order.countDocuments({ 
      user: userId,
      status: 'active'
    });

    const activeMembership = user.hasActiveMembership();

    res.json(success({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        membership: user.membership,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      favorites: user.favorites,
      orders: user.orders,
      statistics: {
        totalDownloads,
        totalOrders,
        activeMembership
      }
    }, '获取仪表板数据成功'));
  } catch (err) {
    console.error('Get dashboard error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Get user favorites
exports.getFavorites = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id)
      .populate({
        path: 'favorites',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'uploadedBy', select: 'username' }
        ]
      });

    const favorites = user.favorites.slice(skip, skip + limit);
    const total = user.favorites.length;

    res.json(paginate(favorites, page, limit, total));
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Add to favorites
exports.addToFavorites = async (req, res) => {
  try {
    const { resourceId } = req.body;
    const userId = req.user.id;

    // Check if resource exists
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json(error('资源不存在'));
    }

    // Check if already in favorites
    const user = await User.findById(userId);
    if (user.favorites.includes(resourceId)) {
      return res.status(400).json(error('资源已在收藏夹中'));
    }

    // Add to favorites
    user.favorites.push(resourceId);
    await user.save();

    // Update resource favorite count
    resource.favoriteCount += 1;
    await resource.save();

    res.json(success(null, '添加到收藏夹成功'));
  } catch (err) {
    console.error('Add to favorites error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Remove from favorites
exports.removeFromFavorites = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const userId = req.user.id;

    // Remove from favorites
    const user = await User.findById(userId);
    user.favorites = user.favorites.filter(fav => fav.toString() !== resourceId);
    await user.save();

    // Update resource favorite count
    const resource = await Resource.findById(resourceId);
    if (resource) {
      resource.favoriteCount = Math.max(0, resource.favoriteCount - 1);
      await resource.save();
    }

    res.json(success(null, '从收藏夹移除成功'));
  } catch (err) {
    console.error('Remove from favorites error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Get user orders
exports.getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ user: req.user.id });

    res.json(paginate(orders, page, limit, total));
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Activate membership with code
exports.activateMembership = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json(error('请输入激活码'));
    }

    // Find activation code
    const activationCode = await ActivationCode.findOne({ 
      code: code.toUpperCase(),
      status: 'unused'
    });

    if (!activationCode) {
      return res.status(404).json(error('激活码不存在或已被使用'));
    }

    // Check if code is expired
    if (activationCode.expiresAt && new Date() > activationCode.expiresAt) {
      activationCode.status = 'expired';
      await activationCode.save();
      return res.status(400).json(error('激活码已过期'));
    }

    // Update user membership
    const user = await User.findById(userId);
    const membershipType = activationCode.membershipType;

    if (membershipType === 'lifetime') {
      user.membership = {
        type: 'lifetime',
        expiresAt: null
      };
    } else if (membershipType === 'monthly') {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + activationCode.duration);
      user.membership = {
        type: 'monthly',
        expiresAt: expireDate
      };
    }

    // Add activation code to user history
    user.activationCodes.push({
      code: activationCode.code,
      usedAt: new Date(),
      membershipType: activationCode.membershipType
    });

    await user.save();

    // Update activation code
    activationCode.status = 'used';
    activationCode.usedBy = userId;
    activationCode.usedAt = new Date();
    await activationCode.save();

    res.json(success({
      membership: user.membership
    }, '会员激活成功'));
  } catch (err) {
    console.error('Activate membership error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Get membership status
exports.getMembershipStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const isActive = user.hasActiveMembership();

    res.json(success({
      membership: user.membership,
      isActive,
      daysLeft: user.membership.expiresAt ? 
        Math.ceil((user.membership.expiresAt - new Date()) / (1000 * 60 * 60 * 24)) : 
        null
    }, '获取会员状态成功'));
  } catch (err) {
    console.error('Get membership status error:', err);
    res.status(500).json(error('服务器错误'));
  }
};