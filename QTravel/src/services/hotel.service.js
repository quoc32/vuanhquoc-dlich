const prisma = require('../config/db');

class HotelService {
  static async searchHotels({ cityId, cityName, limit = 10, offset = 0 }) {
    const whereClause = {};

    if (cityId) {
      whereClause.cityId = cityId;
    } else if (cityName) {
      whereClause.city = {
        OR: [
          { cityName: { contains: cityName } },
          { cityNameVi: { contains: cityName } }
        ]
      };
    }

    const total = await prisma.hotel.count({ where: whereClause });

    const hotels = await prisma.hotel.findMany({
      where: whereClause,
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        city: {
          select: {
            id: true,
            cityName: true,
            cityNameVi: true,
            countryIso2: true
          }
        },
        media: {
          include: {
            media: true
          }
        }
      },
      orderBy: {
        overallRating: 'desc'
      }
    });

    // Transform response to flatten media
    const transformedHotels = hotels.map(hotel => {
      const { media, ...rest } = hotel;
      return {
        ...rest,
        images: media.map(m => m.media)
      };
    });

    return {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: transformedHotels
    };
  }

  static async searchCities(query = '') {
    if (!query || query.length < 2) {
      return [];
    }

    const cities = await prisma.city.findMany({
      where: {
        OR: [
          { cityName: { contains: query } },
          { cityNameVi: { contains: query } },
          { iataCode: { contains: query } }
        ]
      },
      take: 10,
      select: {
        id: true,
        cityName: true,
        cityNameVi: true,
        iataCode: true,
        countryIso2: true
      },
      orderBy: {
        cityName: 'asc'
      }
    });

    return cities;
  }

  static async getHotelById(id) {
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        city: true,
        media: { include: { media: true } }
      }
    });
    if (!hotel) return null;
    const { media, ...rest } = hotel;
    return { ...rest, images: media.map(m => m.media) };
  }

  static async getReviewsByHotelId(hotelId) {
    return await prisma.hotelReview.findMany({
      where: { hotelId },
      include: {
        user: { select: { fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async addReview(userId, hotelId, comment, images = null) {
    const review = await prisma.hotelReview.create({
      data: {
        userId,
        hotelId,
        comment,
        images
      },
      include: {
        user: { select: { fullName: true } }
      }
    });

    // Update reviewsCount on the hotel
    await prisma.hotel.update({
      where: { id: hotelId },
      data: {
        reviewsCount: { increment: 1 }
      }
    });

    return review;
  }

  static async updateReview(userId, reviewId, comment) {
    // Only update comment for now (images can be more complex to manage on update)
    const review = await prisma.hotelReview.findUnique({ where: { id: parseInt(reviewId) } });
    if (!review) throw new Error('Review not found');
    if (review.userId !== userId) throw new Error('Unauthorized');

    return await prisma.hotelReview.update({
      where: { id: parseInt(reviewId) },
      data: { comment },
      include: {
        user: { select: { fullName: true } }
      }
    });
  }

  static async deleteReview(userId, hotelId, reviewId) {
    const review = await prisma.hotelReview.findUnique({ where: { id: parseInt(reviewId) } });
    if (!review) throw new Error('Review not found');
    if (review.userId !== userId) throw new Error('Unauthorized');

    await prisma.hotelReview.delete({
      where: { id: parseInt(reviewId) }
    });

    // Update reviewsCount on the hotel
    await prisma.hotel.update({
      where: { id: hotelId },
      data: {
        reviewsCount: { decrement: 1 }
      }
    });

    return { success: true };
  }
}

module.exports = HotelService;
