const gatewayOnly = (req, res, next) => {
  const secret = req.headers["x-gateway-secret"];

  if (!secret || secret !== process.env.GATEWAY_SECRET) {
    return res.status(403).json({
      success: false,
      message: "Direct access not allowed",
    });
  }

  next();
};

export default gatewayOnly;
