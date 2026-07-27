const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, 'airports.json');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContent).data;

  console.log(`Bắt đầu seed ${data.length} airports...`);

  for (const item of data) {
    try {
      await prisma.airport.upsert({
        where: { id: item.id },
        update: {
          gmt: item.gmt,
          airportId: item.airport_id,
          iataCode: item.iata_code,
          cityIataCode: item.city_iata_code,
          icaoCode: item.icao_code,
          countryIso2: item.country_iso2,
          geonameId: item.geoname_id,
          latitude: item.latitude,
          longitude: item.longitude,
          airportName: item.airport_name,
          countryName: item.country_name,
          phoneNumber: item.phone_number,
          timezone: item.timezone,
          cityId: item.city_id,
        },
        create: {
          id: item.id,
          gmt: item.gmt,
          airportId: item.airport_id,
          iataCode: item.iata_code,
          cityIataCode: item.city_iata_code,
          icaoCode: item.icao_code,
          countryIso2: item.country_iso2,
          geonameId: item.geoname_id,
          latitude: item.latitude,
          longitude: item.longitude,
          airportName: item.airport_name,
          countryName: item.country_name,
          phoneNumber: item.phone_number,
          timezone: item.timezone,
          cityId: item.city_id,
        },
      });
    } catch (e) {
      console.error(`Lỗi khi seed airport ${item.id} (${item.iata_code}):`, e.message);
    }
  }

  console.log('Seed airports thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
