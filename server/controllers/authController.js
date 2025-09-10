const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { success, error } = require('../utils/response');
const config = require('../config/config');
const { validateEmail, validatePassword, validateUsername } = require('../utils/validation');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE
  });
};

// Register user
exports.register = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // Validate input
    if (!validateUsername(username)) {
      return res.status(400).json(error('用户名长度必须在3-50个字符之间'));
    }

    if (!validateEmail(email)) {
      return res.status(400).json(error('请输入有效的邮箱地址'));
    }

    if (!validatePassword(password)) {
      return res.status(400).json(error('密码长度不能少于6个字符'));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json(error('用户名或邮箱已存在'));
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      phone
    });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(201).json(success({
      user,
      token
    }, '注册成功'));
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!validateEmail(email)) {
      return res.status(400).json(error('请输入有效的邮箱地址'));
    }

    if (!password) {
      return res.status(400).json(error('请输入密码'));
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json(error('用户不存在或已被禁用'));
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json(error('密码错误'));
    }

    // Update last login time
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.json(success({
      user,
      token
    }, '登录成功'));
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(success(user, '获取用户信息成功'));
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, phone, avatar } = req.body;
    const userId = req.user.id;

    // Validate input
    if (username && !validateUsername(username)) {
      return res.status(400).json(error('用户名长度必须在3-50个字符之间'));
    }

    // Check if username is already taken
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json(error('用户名已存在'));
      }
    }

    // Update user
    const updateData = {};
    if (username) updateData.username = username;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

    res.json(success(user, '个人信息更新成功'));
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!validatePassword(newPassword)) {
      return res.status(400).json(error('新密码长度不能少于6个字符'));
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json(error('当前密码错误'));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json(success(null, '密码修改成功'));
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token
    res.json(success(null, '退出登录成功'));
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json(error('服务器错误'));
  }
};