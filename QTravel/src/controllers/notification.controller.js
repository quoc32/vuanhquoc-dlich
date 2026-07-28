const prisma = require('../config/db');

class NotificationController {
  static async getNotifications(req, res, next) {
    /*
      #swagger.tags = ['Notifications']
      #swagger.description = 'Lấy danh sách thông báo của user'
      #swagger.security = [{ "bearerAuth": [] }]
    */
    try {
      const userId = req.user.id;
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50 // Limit to last 50
      });

      const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false }
      });

      return res.status(200).json({ success: true, data: notifications, unreadCount });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    /*
      #swagger.tags = ['Notifications']
      #swagger.description = 'Đánh dấu tất cả hoặc một thông báo cụ thể là đã đọc'
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'ID thông báo (tùy chọn). Nếu không truyền sẽ đánh dấu tất cả.',
        required: false,
        schema: { notificationId: 1 }
      }
    */
    try {
      const userId = req.user.id;
      const { notificationId } = req.body;

      if (notificationId) {
        await prisma.notification.updateMany({
          where: { id: parseInt(notificationId), userId },
          data: { isRead: true }
        });
      } else {
        await prisma.notification.updateMany({
          where: { userId, isRead: false },
          data: { isRead: true }
        });
      }

      return res.status(200).json({ success: true, message: 'Marked as read' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;
