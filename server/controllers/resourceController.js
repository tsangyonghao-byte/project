const Resource = require('../models/Resource');
const Category = require('../models/Category');
const User = require('../models/User');
const { success, error, paginate } = require('../utils/response');
const { validateNumber } = require('../utils/validation');

// Get all resources with filters and pagination
exports.getResources = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = { status: 'active', isPublic: true };

    // Search filters
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.gradeLevel) {
      query.gradeLevel = req.query.gradeLevel;
    }

    if (req.query.subject) {
      query.subject = req.query.subject;
    }

    if (req.query.theme) {
      query.theme = req.query.theme;
    }

    if (req.query.tags) {
      query.tags = { $in: req.query.tags.split(',') };
    }

    // Sort options
    let sort = {};
    switch (req.query.sort) {
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'popular':
        sort.downloadCount = -1;
        break;
      case 'most_viewed':
        sort.viewCount = -1;
        break;
      default:
        sort.createdAt = -1;
    }

    // Get resources
    const resources = await Resource.find(query)
      .populate('category', 'name')
      .populate('uploadedBy', 'username')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Resource.countDocuments(query);

    res.json(paginate(resources, page, limit, total));
  } catch (err) {
    console.error('Get resources error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Get single resource
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('category', 'name')
      .populate('uploadedBy', 'username');

    if (!resource || resource.status !== 'active') {
      return res.status(404).json(error('资源不存在'));
    }

    // Increment view count
    resource.viewCount += 1;
    await resource.save();

    res.json(success(resource, '获取资源成功'));
  } catch (err) {
    console.error('Get resource error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Download resource
exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource || resource.status !== 'active') {
      return res.status(404).json(error('资源不存在'));
    }

    // Check if user has membership (for protected resources)
    if (!resource.isPublic && req.user && !req.user.hasActiveMembership()) {
      return res.status(403).json(error('请先开通会员'));
    }

    // Increment download count
    resource.downloadCount += 1;
    await resource.save();

    // Send file for download
    res.download(resource.fileUrl, resource.fileName);
  } catch (err) {
    console.error('Download resource error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Create resource (Admin only)
exports.createResource = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      gradeLevel,
      subject,
      theme,
      tags,
      isPublic
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !gradeLevel || !subject || !theme) {
      return res.status(400).json(error('请填写所有必填字段'));
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json(error('请上传文件'));
    }

    // Create resource
    const resource = await Resource.create({
      title,
      description,
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype.split('/')[1],
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      gradeLevel,
      subject,
      theme,
      isPublic: isPublic !== false,
      uploadedBy: req.user.id
    });

    const populatedResource = await Resource.findById(resource._id)
      .populate('category', 'name')
      .populate('uploadedBy', 'username');

    res.status(201).json(success(populatedResource, '资源创建成功'));
  } catch (err) {
    console.error('Create resource error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Update resource (Admin only)
exports.updateResource = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      gradeLevel,
      subject,
      theme,
      tags,
      isPublic,
      status
    } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json(error('资源不存在'));
    }

    // Update resource
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (gradeLevel) updateData.gradeLevel = gradeLevel;
    if (subject) updateData.subject = subject;
    if (theme) updateData.theme = theme;
    if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());
    if (typeof isPublic !== 'undefined') updateData.isPublic = isPublic;
    if (status) updateData.status = status;

    // Handle file upload if new file provided
    if (req.file) {
      updateData.fileUrl = req.file.path;
      updateData.fileName = req.file.originalname;
      updateData.fileSize = req.file.size;
      updateData.fileType = req.file.mimetype.split('/')[1];
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('category', 'name')
     .populate('uploadedBy', 'username');

    res.json(success(updatedResource, '资源更新成功'));
  } catch (err) {
    console.error('Update resource error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Delete resource (Admin only)
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json(error('资源不存在'));
    }

    // Soft delete
    resource.status = 'deleted';
    await resource.save();

    res.json(success(null, '资源删除成功'));
  } catch (err) {
    console.error('Delete resource error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Get featured resources
exports.getFeaturedResources = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const resources = await Resource.find({ 
      status: 'active', 
      isPublic: true 
    })
      .populate('category', 'name')
      .populate('uploadedBy', 'username')
      .sort({ downloadCount: -1, viewCount: -1 })
      .limit(limit);

    res.json(success(resources, '获取精选资源成功'));
  } catch (err) {
    console.error('Get featured resources error:', err);
    res.status(500).json(error('服务器错误'));
  }
};

// Get resource statistics
exports.getResourceStats = async (req, res) => {
  try {
    const totalResources = await Resource.countDocuments({ status: 'active' });
    const totalDownloads = await Resource.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$downloadCount' } } }
    ]);

    const popularCategories = await Resource.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json(success({
      totalResources,
      totalDownloads: totalDownloads[0]?.total || 0,
      popularCategories
    }, '获取资源统计成功'));
  } catch (err) {
    console.error('Get resource stats error:', err);
    res.status(500).json(error('服务器错误'));
  }
};