const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

class UserController {
  async getProfile(req, res, next) {
    /* 
      #swagger.tags = ['Users']
      #swagger.summary = 'Get current user profile'
      #swagger.security = [{ "bearerAuth": [] }]
    */
    try {
      const userId = req.user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, fullName: true, phone: true, role: true, createdAt: true }
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    /* 
      #swagger.tags = ['Users']
      #swagger.summary = 'Update current user profile'
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Profile information',
        required: true,
        schema: {
          fullName: 'John Doe',
          phone: '0123456789'
        }
      }
    */
    try {
      const userId = req.user.id;
      const { fullName, phone } = req.body;
      
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { fullName, phone },
        select: { id: true, email: true, fullName: true, phone: true, role: true }
      });
      
      res.status(200).json({ message: 'Profile updated successfully', data: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    /* 
      #swagger.tags = ['Users']
      #swagger.summary = 'Change password'
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Password information',
        required: true,
        schema: {
          currentPassword: 'oldpassword123',
          newPassword: 'newpassword123'
        }
      }
    */
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid current password' });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });
      
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req, res, next) {
    /* 
      #swagger.tags = ['Users']
      #swagger.summary = 'Get user bookings/orders'
      #swagger.security = [{ "bearerAuth": [] }]
    */
    try {
      const userId = req.user.id;
      const orders = await prisma.flightOrder.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      const FlightService = require('../services/flight.service');
      
      const detailedOrders = await Promise.all(orders.map(async (dbOrder) => {
        try {
          const duffelOrder = await FlightService.getOrder(dbOrder.id);
          return { ...dbOrder, details: duffelOrder.data };
        } catch(e) {
          return dbOrder;
        }
      }));

      res.status(200).json({ data: detailedOrders });
    } catch (error) {
      next(error);
    }
  }

  async getOrder(req, res, next) {
    /* 
      #swagger.tags = ['Users']
      #swagger.summary = 'Get specific user booking/order detail'
      #swagger.security = [{ "bearerAuth": [] }]
    */
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      const order = await prisma.flightOrder.findFirst({
        where: { id: orderId, userId }
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const FlightService = require('../services/flight.service');
      try {
        const duffelOrder = await FlightService.getOrder(order.id);
        order.details = duffelOrder.data;
      } catch(e) {
        // Leave order.details undefined
      }

      res.status(200).json({ data: order });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
