const AuthService = require('../services/auth.service');

class AuthController {
  static async register(req, res, next) {
    /*
      #swagger.tags = ['Auth']
      #swagger.description = 'Đăng ký tài khoản người dùng mới'
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Thông tin đăng ký',
        required: true,
        schema: {
          email: "vuanhquoc1@gmail.com",
          password: "password123",
          fullName: "Nguyen Van A",
          phone: "0901234567"
        }
      }
    */
    try {
      const user = await AuthService.register(req.body);
      res.status(201).json({ message: 'Đăng ký thành công', user });
    } catch (error) {
      if (error.message === 'Email đã được sử dụng') {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }

  static async login(req, res, next) {
    /*
      #swagger.tags = ['Auth']
      #swagger.description = 'Đăng nhập vào hệ thống'
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Thông tin đăng nhập',
        required: true,
        schema: {
          email: "nguyenvana@example.com",
          password: "password123"
        }
      }
    */
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
      }
      const data = await AuthService.login(email, password);
      res.json({ message: 'Đăng nhập thành công', ...data });
    } catch (error) {
      if (error.message === 'Email hoặc mật khẩu không chính xác') {
        return res.status(401).json({ error: error.message });
      }
      next(error);
    }
  }

  static async refreshToken(req, res, next) {
    /*
      #swagger.tags = ['Auth']
      #swagger.description = 'Lấy lại Access Token mới dựa vào Refresh Token'
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Token làm mới',
        required: true,
        schema: {
          refreshToken: "eyJhbGciOiJIUzI1NiIsInR..."
        }
      }
    */
    try {
      const { refreshToken } = req.body;
      const data = await AuthService.refreshAccessToken(refreshToken);
      res.json({ message: 'Làm mới token thành công', ...data });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  static async logout(req, res, next) {
    /*
      #swagger.tags = ['Auth']
      #swagger.description = 'Đăng xuất khỏi hệ thống (Yêu cầu Authentication)'
      #swagger.security = [{
        "bearerAuth": []
      }]
    */
    try {
      // req.user được set từ middleware auth
      const data = await AuthService.logout(req.user.id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
