/**
 * Standard API Response Utilities
 * Conforms to ADD (Document 04) Section 2.5 & Section 16
 */

const successResponse = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const paginatedResponse = (res, statusCode = 200, message = 'Success', items = [], pagination = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      items,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        totalItems: pagination.totalItems || 0,
        totalPages: pagination.totalPages || 1
      }
    }
  });
};

const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', error = null) => {
  const response = {
    success: false,
    message
  };

  if (error) {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  paginatedResponse,
  errorResponse
};

