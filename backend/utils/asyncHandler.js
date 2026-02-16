// utils/asyncHandler.js

/**
 * Higher-order function to handle async route execution
 * Automatically catches errors and passes them to the next middleware (error handler)
 * Removes the need for try-catch blocks in every controller
 */
export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
