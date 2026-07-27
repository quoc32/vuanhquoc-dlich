const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token không được cung cấp' });
  }

  // Handle case where Express combines multiple authorization headers into a comma-separated string
  const rawToken = authHeader.split(',').pop().trim();

  let token = rawToken;
  if (rawToken.startsWith('Bearer ')) {
    token = rawToken.split(' ')[1];
  }

  if (!token) {
     return res.status(401).json({ error: 'Token sai định dạng' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token đã hết hạn' });
    }
    return res.status(401).json({ error: 'Token không hợp lệ' });
  }
};

module.exports = { authMiddleware };
