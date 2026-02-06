// utils/asyncHandler.js

// Wrapper to handle async route errors without try-catch in every controller
export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
