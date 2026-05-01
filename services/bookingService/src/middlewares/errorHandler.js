const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url}`, err.message);

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expired" });
  }
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  return res
    .status(500)
    .json({ success: false, message: "Internal server error" });
};

export default errorHandler;
