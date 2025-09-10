// Standard response format
exports.success = (data, message = '操作成功', statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    statusCode
  };
};

exports.error = (message = '操作失败', statusCode = 400, details = null) => {
  return {
    success: false,
    message,
    details,
    statusCode
  };
};

// Pagination response
exports.paginate = (data, page, limit, total) => {
  return {
    success: true,
    data: data,
    pagination: {
      current: parseInt(page),
      limit: parseInt(limit),
      total: total,
      pages: Math.ceil(total / limit)
    },
    statusCode: 200
  };
};