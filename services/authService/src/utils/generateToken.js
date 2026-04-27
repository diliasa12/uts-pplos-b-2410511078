export const generateAccessToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.SECRET_KEY,
    { expiresIn: process.env.EXPIRES_IN },
  );

export const generateRefreshToken = (user) =>
  jwt.sign(
    {
      id: user.id,
    },
    process.env.REFRESH_SECRET_KEY,
    { expiresIn: process.env.EXPIRES_IN },
  );
