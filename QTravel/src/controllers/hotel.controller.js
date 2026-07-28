const HotelService = require('../services/hotel.service');

class HotelController {
  static async searchHotels(req, res, next) {
    /*
      #swagger.tags = ['Hotels']
      #swagger.description = 'Tìm kiếm danh sách khách sạn theo City ID, Tên Thành phố hoặc Tên Khách sạn.'
      #swagger.parameters['cityId'] = {
        in: 'query',
        description: 'Mã City ID',
        required: false,
        type: 'string'
      }
      #swagger.parameters['cityName'] = {
        in: 'query',
        description: 'Tên thành phố',
        required: false,
        type: 'string'
      }
      #swagger.parameters['hotelName'] = {
        in: 'query',
        description: 'Tên khách sạn',
        required: false,
        type: 'string'
      }
      #swagger.parameters['limit'] = {
        in: 'query',
        description: 'Số lượng kết quả trả về',
        required: false,
        type: 'integer'
      }
      #swagger.parameters['offset'] = {
        in: 'query',
        description: 'Số lượng kết quả bỏ qua (phân trang)',
        required: false,
        type: 'integer'
      }
      #swagger.parameters['minPrice'] = {
        in: 'query',
        description: 'Giá thấp nhất',
        required: false,
        type: 'number'
      }
      #swagger.parameters['maxPrice'] = {
        in: 'query',
        description: 'Giá cao nhất',
        required: false,
        type: 'number'
      }
      #swagger.parameters['ratings'] = {
        in: 'query',
        description: 'Đánh giá thấp nhất (mảng)',
        required: false,
        type: 'array',
        items: { type: 'number' }
      }
    */
    try {
      const { cityId, cityName, hotelName, limit, offset, minPrice, maxPrice, ratings } = req.query;
      
      const data = await HotelService.searchHotels({ 
        cityId, cityName, hotelName, limit, offset, minPrice, maxPrice, ratings 
      });
      
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async searchCities(req, res, next) {
    /*
      #swagger.tags = ['Hotels']
      #swagger.description = 'Tìm kiếm gợi ý tên Thành phố hoặc Khách sạn cho ô tìm kiếm (Autocomplete)'
      #swagger.parameters['q'] = {
        in: 'query',
        description: 'Từ khoá tìm kiếm (Tên thành phố, mã IATA, hoặc tên khách sạn)',
        required: true,
        type: 'string'
      }
    */
    try {
      const { q } = req.query;
      const data = await HotelService.searchCities(q);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getTopDestinations(req, res, next) {
    /*
      #swagger.tags = ['Hotels']
      #swagger.description = 'Lấy danh sách top 10 điểm đến (thành phố) thu hút nhất Việt Nam dựa trên số lượng khách sạn (Redis cache)'
    */
    try {
      const data = await HotelService.getTopDestinations();
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getHotelDetails(req, res, next) {
    /*
      #swagger.tags = ['Hotels']
      #swagger.description = 'Lấy thông tin chi tiết khách sạn (Redis cache)'
    */
    try {
      const { id } = req.params;
      const data = await HotelService.getHotelById(id);
      if (!data) return res.status(404).json({ message: 'Hotel not found' });
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getReviews(req, res, next) {
    /*
      #swagger.tags = ['Hotels']
      #swagger.description = 'Lấy danh sách đánh giá của khách sạn'
    */
    try {
      const { id } = req.params;
      const data = await HotelService.getReviewsByHotelId(id);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async addReview(req, res, next) {
    /*
      #swagger.tags = ['Hotels']
      #swagger.description = 'Thêm đánh giá mới cho khách sạn (Hỗ trợ upload ảnh)'
      #swagger.security = [{
        "bearerAuth": []
      }]
      #swagger.consumes = ['multipart/form-data']
      #swagger.parameters['comment'] = {
        in: 'formData',
        type: 'string',
        required: true,
        description: 'Nội dung đánh giá'
      }
      #swagger.parameters['images'] = {
        in: 'formData',
        type: 'file',
        description: 'Ảnh đính kèm',
        required: false
      }
    */
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = req.user.id; // From auth middleware

      if (!comment) return res.status(400).json({ message: 'Comment is required' });

      let images = [];
      if (req.files && req.files.length > 0) {
        images = req.files.map(file => `/public/uploads/reviews/${file.filename}`);
      }

      const data = await HotelService.addReview(userId, id, comment, images);
      res.status(201).json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async updateReview(req, res, next) {
    /*
      #swagger.tags = ['Hotels']
      #swagger.description = 'Sửa nội dung đánh giá'
      #swagger.security = [{
        "bearerAuth": []
      }]
    */
    try {
      const { id, reviewId } = req.params;
      const { comment } = req.body;
      const userId = req.user.id;

      if (!comment) return res.status(400).json({ message: 'Comment is required' });

      const data = await HotelService.updateReview(userId, reviewId, comment);
      res.json({ data });
    } catch (error) {
      if (error.message === 'Unauthorized') return res.status(403).json({ message: 'Unauthorized' });
      if (error.message === 'Review not found') return res.status(404).json({ message: 'Review not found' });
      next(error);
    }
  }

  static async deleteReview(req, res, next) {
    /*
      #swagger.tags = ['Hotels']
      #swagger.description = 'Xóa đánh giá'
      #swagger.security = [{
        "bearerAuth": []
      }]
    */
    try {
      const { id, reviewId } = req.params;
      const userId = req.user.id;

      const data = await HotelService.deleteReview(userId, id, reviewId);
      res.json({ data });
    } catch (error) {
      if (error.message === 'Unauthorized') return res.status(403).json({ message: 'Unauthorized' });
      if (error.message === 'Review not found') return res.status(404).json({ message: 'Review not found' });
      next(error);
    }
  }
}

module.exports = HotelController;
