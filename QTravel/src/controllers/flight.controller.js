const FlightService = require('../services/flight.service');

class FlightController {
  // 1. PLACES & AIRPORTS
  static async listAirports(req, res, next) {
    try {
      const data = await FlightService.listAirports(req.query);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  static async searchPlaces(req, res, next) {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      const data = await FlightService.searchPlaces(query);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  // 2. FLIGHT SEARCH
  static async createOfferRequest(req, res, next) {
    /*
      #swagger.tags = ['Flight Search']
      #swagger.description = 'Tạo yêu cầu tìm kiếm chuyến bay (Offer Request)'
      #swagger.parameters['return_offers'] = {
        in: 'query',
        description: 'Trả về danh sách các offer (true/false)',
        type: 'string'
      }
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Thông tin tìm kiếm chuyến bay',
        required: true,
        '@schema': {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              example: {
                slices: [
                  {
                    origin: "SGN",
                    destination: "HAN",
                    departure_date: "2026-08-20"
                  }
                ],
                passengers: [
                  { type: "adult" },
                  { type: "adult" },
                  { type: "child" }
                ],
                cabin_class: "economy"
              }
            },
            currency: {
              type: 'string',
              example: 'VND',
              description: 'Đơn vị tiền tệ muốn hiển thị (Mặc định: VND)'
            }
          }
        }
      }
    */
    try {
      const { data, currency } = req.body;
      const { return_offers } = req.query;
      
      // Set requested_currency if provided, else default to VND
      if (data) {
        data.requested_currency = currency || data.requested_currency || 'VND';
      }

      const responseData = await FlightService.createOfferRequest(data, return_offers === 'true');
      res.json(responseData);
    } catch (error) {
      next(error);
    }
  }

  static async listOffers(req, res, next) {
    /*
      #swagger.tags = ['Flight Search']
      #swagger.description = 'Lấy danh sách Offer từ một Offer Request (có phân trang)'
      #swagger.parameters['offer_request_id'] = {
        in: 'query',
        description: 'ID của Offer Request',
        required: true,
        type: 'string'
      }
      #swagger.parameters['limit'] = {
        in: 'query',
        description: 'Số lượng kết quả trả về tối đa (Mặc định 50, tối đa 200)',
        type: 'integer'
      }
      #swagger.parameters['after'] = {
        in: 'query',
        description: 'Con trỏ cursor để phân trang (lấy từ trường meta.after của response trước đó)',
        type: 'string'
      }
    */
    try {
      const { offer_request_id, ...params } = req.query;
      if (!offer_request_id) {
        return res.status(400).json({ error: 'offer_request_id is required' });
      }
      const data = await FlightService.listOffers(offer_request_id, params);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getOffer(req, res, next) {
    try {
      const { id } = req.params;
      const data = await FlightService.getOffer(id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getSeatMaps(req, res, next) {
    try {
      const { offer_id } = req.query;
      if (!offer_id) {
        return res.status(400).json({ error: 'offer_id is required' });
      }
      const data = await FlightService.getSeatMaps(offer_id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  // 3. BOOKING
  static async createOrder(req, res, next) {
    /*
      #swagger.tags = ['Booking']
      #swagger.description = 'Tạo mới một đặt chỗ (Order). Bắt buộc người dùng phải đăng nhập.'
      #swagger.security = [{
        "bearerAuth": []
      }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Thông tin hành khách và ID của Offer để đặt chỗ',
        required: true,
        '@schema': {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              example: {
                type: "hold",
                selected_offers: [
                  "off_0000B7S3uKmmCqxhdmbEqW"
                ],
                passengers: [
                  {
                    id: "pas_0000B7S3uKROEicPuLZQH5", 
                    title: "mr",
                    given_name: "Nguyen",
                    family_name: "Van A",
                    born_on: "1990-01-01",
                    email: "nguyenvana@example.com",
                    phone_number: "+84901234567",
                    gender: "m"
                  },
                  {
                    id: "pas_0000B7S3uKROEicPuLZQH6", 
                    title: "mr",
                    given_name: "Nguyen",
                    family_name: "Van B",
                    born_on: "2020-01-01",
                    email: "nguyenvanb@example.com",
                    phone_number: "+84901234567",
                    gender: "m"
                  }
                ]
              }
            }
          }
        }
      }
    */
    try {
      const { data } = req.body;
      const userId = req.user ? req.user.id : null;
      const responseData = await FlightService.createOrder(data, userId);
      res.json(responseData);
    } catch (error) {
      next(error);
    }
  }

  static async getOrder(req, res, next) {
    try {
      const { id } = req.params;
      const data = await FlightService.getOrder(id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  static async listOrders(req, res, next) {
    try {
      const data = await FlightService.listOrders(req.query);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  // 4. REFERENCE DATA
  static async listAirlines(req, res, next) {
    /*
      #swagger.tags = ['Reference Data']
      #swagger.description = 'Lấy danh sách các hãng hàng không (Redis cache)'
    */
    try {
      const data = await FlightService.listAirlines(req.query);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  static async listAircrafts(req, res, next) {
    try {
      const data = await FlightService.listAircrafts(req.query);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  static async payForOrder(req, res, next) {
    /*
      #swagger.tags = ['Payments']
      #swagger.description = 'Thanh toán cho một Order đang được Hold (bằng Balance)'
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Thông tin thanh toán',
        required: true,
        '@schema': {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              example: {
                order_id: "ord_0000A...",
                payment: {
                  type: "balance",
                  currency: "VND",
                  amount: "1500000"
                }
              }
            }
          }
        }
      }
    */
    try {
      const { data } = req.body;
      const responseData = await FlightService.payForOrder(data);
      res.json(responseData);
    } catch (error) {
      next(error);
    }
  }

  static async createPaymentSession(req, res, next) {
    /*
      #swagger.tags = ['Payments']
      #swagger.description = 'Tạo Payment Session để thanh toán qua Duffel Links'
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Thông tin tạo session thanh toán',
        required: true,
        '@schema': {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              example: {
                reference: "ord_0000A...",
                success_url: "http://localhost:3000/success",
                failure_url: "http://localhost:3000/failure",
                cancel_url: "http://localhost:3000/cancel",
                abandonment_url: "http://localhost:3000/abandonment",
                checkout: {
                  email: "nguyenvana@example.com",
                  type: "hosted",
                }
              }
            }
          }
        }
      }
    */
    try {
      const { data } = req.body;
      const responseData = await FlightService.createPaymentSession(data);
      res.json(responseData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FlightController;
