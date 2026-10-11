export function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function handleRouteError(res, error) {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with that value already exists",
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  const status = error.status || 500;

  if (status >= 500) {
    console.error(error);
  }

  return res.status(status).json({
    success: false,
    message:
      status >= 500 && process.env.NODE_ENV !== "development"
        ? "Internal server error"
        : error.message,
  });
}
