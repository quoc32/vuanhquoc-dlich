const MomoService = require('../services/momo.service');
const FlightService = require('../services/flight.service');
const prisma = require('../config/db');

class MomoController {
  static async createPayment(req, res, next) {
    /*
      #swagger.tags = ['Payments']
      #swagger.description = 'Tạo link thanh toán MoMo (captureWallet, payWithMethod, payWithATM, payWithCC)'
      #swagger.security = [{
        "bearerAuth": []
      }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'ID đơn hàng cần thanh toán',
        required: true,
        schema: {
          orderId: "ord_0000...",
          requestType: "captureWallet"
        }
      }
    */
    try {
      const { orderId, requestType = "captureWallet" } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ error: 'orderId là bắt buộc' });
      }

      // Lấy thông tin order từ Duffel để biết số tiền
      const duffelOrderResponse = await FlightService.getOrder(orderId);
      if (!duffelOrderResponse || !duffelOrderResponse.data) {
        return res.status(404).json({ error: 'Không tìm thấy đơn hàng trên Duffel' });
      }

      const orderData = duffelOrderResponse.data;
      let amount = parseFloat(orderData.total_amount);
      const currency = orderData.total_currency;

      // Kiểm tra xem FlightOrder đã thanh toán chưa
      const flightOrder = await prisma.flightOrder.findUnique({
        where: { id: orderId }
      });
      if (flightOrder && flightOrder.paymentStatus === 'SUCCESS') {
        return res.status(400).json({ error: 'Đơn hàng này đã được thanh toán' });
      }

      // Đổi tỷ giá sang VND nếu cần
      if (currency !== 'VND') {
        const rateUrl = process.env.CURRENTCY_RATE_URL || 'https://api.frankfurter.dev/v2/rates';
        try {
          const rateResponse = await fetch(`${rateUrl}?base=${currency}&quotes=VND`);
          const [rateData] = await rateResponse.json();
          if (rateData && rateData.rate) {
            amount = Math.ceil(amount * rateData.rate);
          } else {
            return res.status(500).json({ error: 'Không thể lấy tỷ giá quy đổi sang VND' });
          }
        } catch (err) {
          return res.status(500).json({ error: 'Lỗi khi gọi API tỷ giá' });
        }
      } else {
        amount = Math.ceil(amount); // MoMo yêu cầu số nguyên
      }

      // Tự động cấu hình các thông số khác
      const orderInfo = `Thanh toán vé máy bay QTravel - ${orderId}`;
      const redirectUrl = process.env.MOMO_REDIRECT_URL || "http://localhost:5173/payment/success";
      const ipnUrl = process.env.MOMO_IPN_URL;

      if (!ipnUrl) {
         return res.status(500).json({ error: 'Chưa cấu hình MOMO_IPN_URL trong .env' });
      }

      // Tạo PaymentTransaction (Idempotency Key)
      const transaction = await prisma.paymentTransaction.create({
        data: {
          flightOrderId: orderId,
          amount: amount,
          originalCurrency: currency,
          originalAmount: orderData.total_amount
        }
      });

      // MoMo yêu cầu orderId phải duy nhất cho mỗi giao dịch
      // Dùng chính ID của Transaction này làm orderId gửi cho MoMo
      const momoOrderId = transaction.id;

      // Truyền amount ở dạng số để service dùng, trong service nó sẽ được tự động ép sang chuỗi khi cần mã hóa
      const response = await MomoService.createPaymentLink(
        momoOrderId, 
        amount, 
        orderInfo, 
        redirectUrl, 
        ipnUrl,
        requestType
      );

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async ipnCallback(req, res, next) {
    /*
      #swagger.tags = ['Payments']
      #swagger.description = 'Webhook IPN từ MoMo gọi về'
    */
    try {
      const data = req.body;

      // 1. Verify signature
      const isValid = MomoService.verifySignature(data);
      if (!isValid) {
        console.error('MoMo Signature is invalid!');
        return res.status(400).json({ message: 'Invalid signature' });
      }

      // Lấy ID order thật
      const transactionId = data.orderId;

      // 1. Idempotency Check: Tìm PaymentTransaction trong Database
      const transaction = await prisma.paymentTransaction.findUnique({
        where: { id: transactionId }
      });

      if (!transaction) {
        console.error('Không tìm thấy giao dịch:', transactionId);
        return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
      }

      if (transaction.status === 'SUCCESS') {
        console.log(`Giao dịch ${transactionId} đã được xử lý trước đó. Bỏ qua.`);
        return res.status(204).send(); // Ngắt webhook
      }

      // 2. Check if payment is successful (resultCode == 0)
      if (data.resultCode === 0) {
        console.log(`Thanh toán MoMo thành công cho order: ${transactionId}`);
        
        // Cập nhật trạng thái thành SUCCESS trong DB
        await prisma.paymentTransaction.update({
          where: { id: transactionId },
          data: {
            status: 'SUCCESS',
            momoTransId: data.transId.toString()
          }
        });

        await prisma.flightOrder.update({
          where: { id: transaction.flightOrderId },
          data: { paymentStatus: 'SUCCESS' }
        });

        // 3. Call Duffel to pay for the order
        // Lấy tiền tệ và số tiền gốc đã lưu trong PaymentTransaction
        const originalCurrency = transaction.originalCurrency;
        const originalAmount = transaction.originalAmount;
        
        const paymentData = {
          order_id: transaction.flightOrderId,
          payment: {
            type: "balance",
            currency: originalCurrency,
            amount: originalAmount
          }
        };

        try {
          const duffelResponse = await FlightService.payForOrder(paymentData);
          console.log('Thanh toán trên Duffel thành công:', duffelResponse);
        } catch (duffelError) {
          console.error('Lỗi khi thanh toán trên Duffel:', duffelError);
          // Đánh dấu là cần Refund (hoặc xử lý bằng tay)
          await prisma.flightOrder.update({
            where: { id: transaction.flightOrderId },
            data: { paymentStatus: 'REFUNDED' } // Hoặc tạo thêm status NEED_REFUND
          });
        }
      } else {
        console.log(`Thanh toán MoMo thất bại/hủy. Mã lỗi: ${data.resultCode}`);
        await prisma.paymentTransaction.update({
          where: { id: transactionId },
          data: { status: 'FAILED' }
        });

        // ĐỒNG THỜI Cập nhật trạng thái của FlightOrder thành FAILED
        await prisma.flightOrder.update({
          where: { id: transaction.flightOrderId },
          data: { paymentStatus: 'FAILED' }
        });
      }

      // 4. Respond to Momo immediately to acknowledge IPN
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MomoController;
