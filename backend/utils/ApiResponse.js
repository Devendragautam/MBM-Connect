// utils/ApiResponse.js

/**
 * Standardized API Response class
 * Used to wrap successful responses with a consistent structure
 */
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400; // true for success, false for errors
  }
}

export { ApiResponse };
