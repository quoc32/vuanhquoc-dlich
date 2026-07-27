const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

class AuthService {
  static async register(data) {
    const { email, password, fullName, phone } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phone,
      },
    });

    return {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
    };
  }

  static async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    const payload = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    const accessTokenExpires = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    const refreshTokenExpires = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: accessTokenExpires });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: refreshTokenExpires });

    // Save refresh token to db
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: payload,
    };
  }

  static async refreshAccessToken(token) {
    if (!token) {
      throw new Error('Refresh token là bắt buộc');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!user || user.refreshToken !== token) {
        throw new Error('Refresh token không hợp lệ hoặc đã hết hạn');
      }

      const payload = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      };

      const accessTokenExpires = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
      const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: accessTokenExpires });
      
      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new Error('Refresh token không hợp lệ');
    }
  }

  static async logout(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Đăng xuất thành công' };
  }
}

module.exports = AuthService;
