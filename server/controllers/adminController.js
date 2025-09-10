const User = require('../models/User');
const Resource = require('../models/Resource');
const Order = require('../models/Order');
const ActivationCode = require('../models/ActivationCode');
const Category = require('../models/Category');
const { success, error, paginate } = require('../utils/response');
const { v4: uuidv4 } = require('uuid');

// Get admin dashboard
exports.getDashboard = async (req, res) => {
  try {
    // Get basic statistics
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalResources = await Resource.countDocuments({ status: 'active' });
    const totalOrders = await Order.countDocuments({ paymentStatus: 'paid' });
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get recent users
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email membership createdAt');

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get popular resources
    const popularResources = await Resource.find({ status: 'active' })
      .sort({ downloadCount: -1 })
      .limit(5)
      .select('title downloadCount viewCount');

    // Get monthly statistics
    const currentMonth = new Date();
    currentMonth.setDate(1);
    
    const monthlyStats = {
      newUsers: await User.countDocuments({ 
        role: 'user', 
        createdAt: { $gte: currentMonth } 
      }),
      newOrders: await Order.countDocuments({ 
        paymentStatus: 'paid',
        createdAt: { $gte: currentMonth }
      }),
      monthlyRevenue: await Order.aggregate([
        { 
          $match: { 
            paymentStatus: 'paid',
            createdAt: { $gte: currentMonth }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    };

    res.json(success({
      overview: {
        totalUsers,
        totalResources,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentUsers,
      recentOrders,
      popularResources,
      monthlyStats: {
        ...monthlyStats,
        monthlyRevenue: monthlyStats.monthlyRevenue[0]?.total || 0
      }
    }, '获取管理面板数据成功'));
  } catch (err) {
    console.error('Get admin dashboard error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// User management
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, status, membership } = req.query;

    let query = { role: 'user' };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (membership) {
      query['membership.type'] = membership;
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password');

    const total = await User.countDocuments(query);

    res.json(paginate(users, page, limit, total));
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, membership } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(error('用户不存在'));
    }

    if (typeof isActive !== 'undefined') {
      user.isActive = isActive;
    }

    if (membership) {
      user.membership = membership;
    }

    await user.save();

    res.json(success(user, '用户状态更新成功'));
  } catch (err) {
    console.error('Update user status error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Order management
exports.getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, paymentStatus } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const orders = await Order.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json(paginate(orders, page, limit, total));
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Activation code management
exports.getActivationCodes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, batch, search } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (batch) {
      query.batch = { $regex: batch, $options: 'i' };
    }

    if (search) {
      query.code = { $regex: search, $options: 'i' };
    }

    const codes = await ActivationCode.find(query)
      .populate('usedBy', 'username email')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ActivationCode.countDocuments(query);

    res.json(paginate(codes, page, limit, total));
  } catch (err) {
    console.error('Get activation codes error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Generate activation codes
exports.generateActivationCodes = async (req, res) => {
  try {
    const { 
      count, 
      membershipType, 
      duration = 30, 
      batch, 
      description 
    } = req.body;

    if (!count || count < 1 || count > 1000) {
      return res.status(400).json(error('生成数量必须在1-1000之间'));
    }

    if (!membershipType || !['monthly', 'lifetime'].includes(membershipType)) {
      return res.status(400).json(error('请选择有效的会员类型'));
    }

    if (!batch) {
      return res.status(400).json(error('请输入批次名称'));
    }

    const codes = [];
    const expiresAt = membershipType === 'monthly' ? 
      new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : 
      null;

    for (let i = 0; i < count; i++) {
      const code = uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase();
      
      const activationCode = await ActivationCode.create({
        code,
        membershipType,
        duration,
        batch,
        description,
        expiresAt,
        createdBy: req.user.id
      });

      codes.push(activationCode);
    }

    res.json(success({
      codes: codes.map(c => c.code),
      batch,
      count: codes.length
    }, `成功生成${count}个激活码`));
  } catch (err) {
    console.error('Generate activation codes error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Export activation codes
exports.exportActivationCodes = async (req, res) => {
  try {
    const { codes, batch } = req.body;

    let query = {};
    if (codes && codes.length > 0) {
      query.code = { $in: codes };
    } else if (batch) {
      query.batch = batch;
    } else {
      return res.status(400).json(error('请选择要导出的激活码'));
    }

    const activationCodes = await ActivationCode.find(query)
      .populate('usedBy', 'username email')
      .populate('createdBy', 'username');

    if (activationCodes.length === 0) {
      return res.status(404).json(error('未找到激活码'));
    }

    // Create CSV content
    const csvHeader = '激活码,会员类型,状态,批次,描述,使用者,使用时间,创建时间\n';
    const csvContent = activationCodes.map(code => {
      return `${code.code},${code.membershipType},${code.status},${code.batch},"${code.description || ''}","${code.usedBy?.username || ''}","${code.usedAt || ''}","${code.createdAt}"`;
    }).join('\n');

    const csv = csvHeader + csvContent;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=activation_codes_${batch || 'export'}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('Export activation codes error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Category management
exports.getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};

    if (type) {
      query.type = type;
    }

    const categories = await Category.find(query)
      .sort({ sortOrder: 1, name: 1 });

    res.json(success(categories, '获取分类成功'));
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, type, description, sortOrder = 0 } = req.body;

    if (!name || !type) {
      return res.status(400).json(error('请填写分类名称和类型'));
    }

    const category = await Category.create({
      name,
      type,
      description,
      sortOrder
    });

    res.status(201).json(success(category, '分类创建成功'));
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, sortOrder, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json(error('分类不存在'));
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(success(updatedCategory, '分类更新成功'));
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json(error('分类不存在'));
    }

    // Check if category is being used
    const resourceCount = await Resource.countDocuments({ category: req.params.id });
    if (resourceCount > 0) {
      return res.status(400).json(error('该分类下还有资源，无法删除'));
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json(success(null, '分类删除成功'));
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json(error('服务器错误'));
  }
};