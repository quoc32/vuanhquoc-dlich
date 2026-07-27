const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Also seed HotelMedia, Media

async function main() {
  const filePath = path.join(__dirname, 'hotels.json');
  const properties = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let count = 0;
  for (const hotel of properties) {
    if (!hotel.property_token) continue;
    
    await prisma.hotel.upsert({
      where: { id: hotel.property_token },
      update: {
        name: hotel.name,
        link: hotel.link,
        latitude: hotel.gps_coordinates?.latitude,
        longitude: hotel.gps_coordinates?.longitude,
        overallRating: hotel.overall_rating,
        reviewsCount: hotel.reviews,
        ratePerNight: hotel.rate_per_night?.extracted_lowest,
        amenities: hotel.amenities || [],
        cityId: hotel.cityId,
        media: {
          deleteMany: {},
          create: (hotel.images || []).map((img) => ({
            media: {
              create: {
                url: img.thumbnail || img.original_image || '',
              },
            },
          })),
        },
      },
      create: {
        id: hotel.property_token,
        name: hotel.name,
        link: hotel.link,
        latitude: hotel.gps_coordinates?.latitude,
        longitude: hotel.gps_coordinates?.longitude,
        overallRating: hotel.overall_rating,
        reviewsCount: hotel.reviews,
        ratePerNight: hotel.rate_per_night?.extracted_lowest,
        amenities: hotel.amenities || [],
        cityId: hotel.cityId,
        media: {
          create: (hotel.images || []).map((img) => ({
            media: {
              create: {
                url: img.thumbnail || img.original_image || '',
              },
            },
          })),
        },
      },
    });
    count++;
  }

  console.log(`Successfully seeded ${count} hotels from hotels.json!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
