const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Get token from cookie
    else if (req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未授权，请先登录'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, config.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: '用户不存在或已被禁用'
        });
      }
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: '无效的访问令牌'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '无权访问此功能'
      });
    }
    next();
  };
};

// Check membership access
exports.requireMembership = (req, res, next) => {
  if (!req.user.hasActiveMembership()) {
    return res.status(403).json({
      success: false,
      message: '请先开通会员'
    });
  }
  next();
};