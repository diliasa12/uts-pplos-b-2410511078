const authMiddleware = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  const userRole = req.headers["x-user-role"];
  const userEmail = req.headers["x-user-email"];

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  req.user = {
    id: userId,
    role: userRole,
    email: userEmail,
  };

  next();
};

export default authMiddleware;
