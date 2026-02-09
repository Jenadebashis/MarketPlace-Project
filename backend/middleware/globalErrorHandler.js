import AppError from "../utils/AppError.js";

export const globalErrorHandler = (err, req, res, next) => {
  console.error("ERROR 💥:", err); // ADD THIS: This will show up in Onrender Logs
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = Object.assign(err); // Clone error object
  error.message = err.message;

  // --- DATABASE ERROR NORMALIZATION ---

  // 1. Postgres Connection Errors (Sequelize)
  if (err.name === 'SequelizeConnectionRefusedError' || err.parent?.code === 'ECONNREFUSED') {
    error = new AppError('The Postgres database is down. Please try again later.', 500);
  }

  // 2. MongoDB Connection Errors (Mongoose)
  if (err.name === 'MongooseServerSelectionError' || err.name === 'MongoNetworkError') {
    error = new AppError('The MongoDB database is unreachable.', 500);
  }

  // 3. Postgres Unique Constraint (e.g., Duplicate Email)
  if (err.name === 'SequelizeUniqueConstraintError' || err.code === '23505') {
    error = new AppError('This information is already registered in our system.', 400);
  }

  if (err.name === "ZodError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.flatten().fieldErrors
    });
  }

  // --- FINAL RESPONSE LOGIC ---

  if (process.env.NODE_ENV === 'development') {
    // Show full details in development
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      stack: error.stack,
      error: error
    });
  } else {
    // Production: Only show "Operational" errors to the user
    // If it's not operational (like a code bug), show a generic 500
    res.status(error.statusCode).json({
      status: error.status,
      message: error.isOperational ? error.message : 'Something went very wrong!'
    });
  }
};