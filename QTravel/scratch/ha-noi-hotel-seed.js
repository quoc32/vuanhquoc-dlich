const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const hotelsData = require('./ha-noi-hotel.json');

async function main() {
  console.log('Starting seed for Hanoi hotels...');
  
  // Find Hanoi city
  const hanoi = await prisma.city.findFirst({
    where: {
      cityNameVi: 'Hà Nội'
    }
  });

  if (!hanoi) {
    console.error('City Hà Nội not found in database!');
    return;
  }

  console.log(`Found Hanoi with ID: ${hanoi.id}`);

  let count = 0;
  for (const item of hotelsData) {
    const hotelData = {
      id: item.property_token,
      name: item.name,
      link: item.link,
      latitude: item.gps_coordinates?.latitude,
      longitude: item.gps_coordinates?.longitude,
      overallRating: item.overall_rating,
      reviewsCount: item.reviews,
      ratePerNight: item.extracted_price,
      amenities: item.amenities,
      cityId: hanoi.id
    };

    // Upsert hotel
    await prisma.hotel.upsert({
      where: { id: hotelData.id },
      update: hotelData,
      create: hotelData
    });

    // Handle images to display nicely on UI
    const existingMedia = await prisma.hotelMedia.findFirst({
      where: { hotelId: hotelData.id }
    });

    if (!existingMedia) {
       // Create some default beautiful images for the hotel
       const defaultImages = [
         'https://tse2.mm.bing.net/th/id/OIP.MMCalBbwrtbcdwA7Li-MuQHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
         'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop',
         'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop'
       ];
       
       for (const img of defaultImages) {
         const media = await prisma.media.create({
           data: {
             url: img,
             caption: 'Hotel view'
           }
         });
         await prisma.hotelMedia.create({
           data: {
             hotelId: hotelData.id,
             mediaId: media.id
           }
         });
       }
    }
    
    console.log(`Upserted hotel: ${hotelData.name}`);
    count++;
  }
  
  console.log(`Seed completed! Processed ${count} hotels.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
