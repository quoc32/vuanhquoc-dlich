const prisma = require('../config/db');
const redisClient = require('../config/redis');

class HotelService {
  static async searchHotels({ cityId, cityName, hotelName, limit = 10, offset = 0, minPrice, maxPrice, ratings }) {
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
    
    if (hotelName) {
      whereClause.name = { contains: hotelName };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.ratePerNight = {};
      if (minPrice !== undefined) whereClause.ratePerNight.gte = parseInt(minPrice);
      if (maxPrice !== undefined) whereClause.ratePerNight.lte = parseInt(maxPrice);
    }

    if (ratings) {
      const ratingsArray = Array.isArray(ratings) ? ratings : [ratings];
      if (ratingsArray.length > 0) {
        const minRating = Math.min(...ratingsArray.map(r => parseFloat(r)));
        whereClause.overallRating = { gte: minRating };
      }
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
      take: 5,
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

    const hotels = await prisma.hotel.findMany({
      where: {
        name: { contains: query }
      },
      take: 5,
      select: {
        id: true,
        name: true,
        city: {
          select: {
            cityName: true,
            countryIso2: true
          }
        }
      }
    });

    // Format output
    const formattedCities = cities.map(c => ({
      type: 'city',
      id: c.id,
      name: c.cityName,
      subName: c.countryIso2,
      originalData: c
    }));

    const formattedHotels = hotels.map(h => ({
      type: 'hotel',
      id: h.id,
      name: h.name,
      subName: `${h.city.cityName}, ${h.city.countryIso2}`,
      originalData: h
    }));

    return [...formattedCities, ...formattedHotels];
  }

  static async getTopDestinations() {
    const CACHE_KEY = 'top_destinations:VN';
    
    try {
      const cachedData = await redisClient.get(CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.error('Redis get error:', error);
    }

    const topDestinations = await prisma.city.findMany({
      where: {
        countryIso2: 'VN'
      },
      include: {
        _count: {
          select: { hotels: true }
        }
      },
      orderBy: {
        hotels: {
          _count: 'desc'
        }
      },
      take: 10
    });

    const result = topDestinations.map(city => ({
      id: city.id,
      cityName: city.cityName,
      cityNameVi: city.cityNameVi,
      imageUrl: city.imageUrl,
      hotelCount: city._count.hotels
    }));

    try {
      await redisClient.set(CACHE_KEY, JSON.stringify(result), {
        EX: 3600 // Cache for 1 hour
      });
    } catch (error) {
      console.error('Redis set error:', error);
    }

    return result;
  }

  static async getHotelById(id) {
    const CACHE_KEY = `hotel:${id}`;

    try {
      const cachedData = await redisClient.get(CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.error('Redis get error:', error);
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        city: true,
        media: { include: { media: true } }
      }
    });
    if (!hotel) return null;
    const { media, ...rest } = hotel;
    const result = { ...rest, images: media.map(m => m.media) };

    try {
      await redisClient.set(CACHE_KEY, JSON.stringify(result), {
        EX: 3600 // Cache for 1 hour
      });
    } catch (error) {
      console.error('Redis set error:', error);
    }

    return result;
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
