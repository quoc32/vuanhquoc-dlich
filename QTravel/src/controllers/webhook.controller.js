const prisma = require('../config/db');
const SocketService = require('../services/socket.service');

class WebhookController {
  static async handleHotelOrder(req, res, next) {
    /*
      #swagger.tags = ['Webhooks']
      #swagger.description = 'Nhận thông tin đơn đặt phòng từ các khách sạn đối tác (ví dụ: QHotel)'
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Thông tin booking từ khách sạn',
        required: true,
        '@schema': {
          type: 'object',
          properties: {
            bookingId: { type: 'string', example: 'B123456' },
            userEmail: { type: 'string', example: 'user@example.com' },
            hotelId: { type: 'string', example: 'qhotel_01' },
            hotelName: { type: 'string', example: 'Quoc Vu Hotel' },
            roomType: { type: 'string', example: 'Deluxe' },
            checkIn: { type: 'string', example: '2026-08-01T14:00:00.000Z' },
            checkOut: { type: 'string', example: '2026-08-03T12:00:00.000Z' },
            totalPrice: { type: 'number', example: 1500000 }
          }
        }
      }
    */
    try {
      const { bookingId, userEmail, hotelId, hotelName, roomType, checkIn, checkOut, totalPrice } = req.body;

      if (!userEmail) {
        return res.status(400).json({ error: 'userEmail is required' });
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: userEmail }
      });

      // We store the order with userId if user exists
      const order = await prisma.hotelOrder.create({
        data: {
          bookingReference: bookingId,
          userId: user ? user.id : null,
          hotelId: hotelId,
          hotelName: hotelName,
          roomType: roomType,
          checkIn: checkIn ? new Date(checkIn) : null,
          checkOut: checkOut ? new Date(checkOut) : null,
          totalAmount: totalPrice,
          status: 'CONFIRMED'
        }
      });

      if (user) {
        const notif = await prisma.notification.create({
          data: {
            userId: user.id,
            title: '🎉 Đặt phòng thành công!',
            message: `Bạn vừa đặt thành công phòng ${roomType} tại ${hotelName || hotelId}. Mã đặt phòng: ${bookingId}`,
            type: 'HOTEL_BOOKING'
          }
        });
        SocketService.sendNotificationToUser(user.id, notif);
      }

      return res.status(200).json({ success: true, message: 'Hotel order synced successfully', data: order });
    } catch (error) {
      console.error('Webhook error:', error);
      next(error);
    }
  }
}

module.exports = WebhookController;
