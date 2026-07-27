const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, 'cities.json');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContent).data;

  console.log(`Bắt đầu seed ${data.length} cities...`);

  for (const item of data) {
    try {
      await prisma.city.upsert({
        where: { id: item.id },
        update: {
          gmt: item.gmt,
          cityId: item.city_id,
          iataCode: item.iata_code,
          countryIso2: item.country_iso2,
          geonameId: item.geoname_id,
          latitude: item.latitude,
          longitude: item.longitude,
          cityName: item.city_name,
          cityNameVi: item.city_name_vi,
          timezone: item.timezone,
        },
        create: {
          id: item.id,
          gmt: item.gmt,
          cityId: item.city_id,
          iataCode: item.iata_code,
          countryIso2: item.country_iso2,
          geonameId: item.geoname_id,
          latitude: item.latitude,
          longitude: item.longitude,
          cityName: item.city_name,
          cityNameVi: item.city_name_vi,
          timezone: item.timezone,
        },
      });
    } catch (e) {
      console.error(`Lỗi khi seed city ${item.id}:`, e.message);
    }
  }

  console.log('Seed cities thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
