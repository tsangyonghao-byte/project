const multer = require('multer');
const path = require('path');
const config = require('../config/config');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    if (file.fieldname === 'avatar') {
      uploadPath = config.UPLOAD_PATH.avatars;
    } else {
      uploadPath = config.UPLOAD_PATH.resources;
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'audio/mpeg',
    'video/mp4',
    'application/zip',
    'application/x-rar-compressed'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

// Configure upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE
  },
  fileFilter: fileFilter
});

// Debug log
console.log('Upload middleware configured:', typeof upload);
console.log('Upload single method type:', typeof upload.single);
console.log('Multer version:', require('multer').version);

// Export upload middleware
exports.upload = upload;

// Export single file upload middleware
exports.uploadSingle = (fieldName) => {
  console.log('uploadSingle called with:', fieldName);
  const middleware = upload.single(fieldName);
  console.log('uploadSingle middleware type:', typeof middleware);
  console.log('uploadSingle middleware value:', middleware);
  return middleware;
};

// Export multiple files upload middleware
exports.uploadMultiple = (fieldName, maxCount) => {
  return upload.array(fieldName, maxCount);
};