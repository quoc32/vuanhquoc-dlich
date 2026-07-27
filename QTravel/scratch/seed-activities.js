const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, 'activities.json');
  const activities = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let count = 0;
  for (const activity of activities) {
    await prisma.activity.create({
      data: {
        cityId: activity.cityId,
        name: activity.name,
        category: activity.category,
        description: activity.description,
        price: activity.price,
        originalPrice: activity.originalPrice,
        rating: activity.rating,
        reviewCount: activity.reviewCount,
        bookingCount: activity.bookingCount,
        freeCancellation: activity.freeCancellation,
        isPopular: activity.isPopular,
        imageUrl: activity.imageUrl,
        media: {
          create: (activity.mediaUrls || []).map(url => ({
            media: {
              create: {
                url: url
              }
            }
          }))
        }
      }
    });
    count++;
  }

  console.log(`Successfully seeded ${count} activities from activities.json!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
