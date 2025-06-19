import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export const createError = (
  message: string,
  statusCode: number = 500
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error for debugging
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);

  // Default error
  let statusCode = 500;
  let message = "Internal Server Error";

  // Handle known errors
  if ("statusCode" in err && err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle Stripe errors
  if (err.message.includes("stripe") || err.message.includes("payment")) {
    statusCode = 400;
    message = "Payment processing error: " + err.message;
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};
