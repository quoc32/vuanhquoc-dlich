const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, 'airlines.json');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContent).data;

  console.log(`Bắt đầu seed ${data.length} airlines...`);

  for (const item of data) {
    try {
      await prisma.airline.upsert({
        where: { id: item.id },
        update: {
          fleetAverageAge: item.fleet_average_age,
          airlineId: item.airline_id,
          callsign: item.callsign,
          hubCode: item.hub_code,
          iataCode: item.iata_code,
          icaoCode: item.icao_code,
          countryIso2: item.country_iso2,
          dateFounded: item.date_founded,
          iataPrefixAccounting: item.iata_prefix_accounting,
          airlineName: item.airline_name,
          countryName: item.country_name,
          fleetSize: item.fleet_size,
          status: item.status,
          type: item.type,
        },
        create: {
          id: item.id,
          fleetAverageAge: item.fleet_average_age,
          airlineId: item.airline_id,
          callsign: item.callsign,
          hubCode: item.hub_code,
          iataCode: item.iata_code,
          icaoCode: item.icao_code,
          countryIso2: item.country_iso2,
          dateFounded: item.date_founded,
          iataPrefixAccounting: item.iata_prefix_accounting,
          airlineName: item.airline_name,
          countryName: item.country_name,
          fleetSize: item.fleet_size,
          status: item.status,
          type: item.type,
        },
      });
    } catch (e) {
      console.error(`Lỗi khi seed airline ${item.id} (${item.airline_name}):`, e.message);
    }
  }

  console.log('Seed airlines thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
