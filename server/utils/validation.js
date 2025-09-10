// Validation helpers
exports.validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

exports.validatePhone = (phone) => {
  const re = /^1[3-9]\d{9}$/;
  return re.test(phone);
};

exports.validatePassword = (password) => {
  return password.length >= 6;
};

exports.validateUsername = (username) => {
  return username.length >= 3 && username.length <= 50;
};

// File validation
exports.validateFileSize = (fileSize, maxSize) => {
  return fileSize <= maxSize;
};

exports.validateFileType = (fileType, allowedTypes) => {
  return allowedTypes.includes(fileType);
};

// Input sanitization
exports.sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

// Array validation
exports.validateArray = (arr, minLength = 0, maxLength = Infinity) => {
  if (!Array.isArray(arr)) return false;
  return arr.length >= minLength && arr.length <= maxLength;
};

// Number validation
exports.validateNumber = (num, min = -Infinity, max = Infinity) => {
  const parsed = parseFloat(num);
  return !isNaN(parsed) && parsed >= min && parsed <= max;
};

// Date validation
exports.validateDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};