const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CITY_IMAGES = {
  'Đà Nẵng': 'https://pix6.agoda.net/geo/city/16440/1_16440_02.jpg?ca=6&ce=1&s=375x&ar=1x1',
  'Vũng Tàu': 'https://pix6.agoda.net/geo/city/17190/1_17190_02.jpg?ca=6&ce=1&s=375x&ar=1x1',
  'Hồ Chí Minh': 'https://pix6.agoda.net/geo/city/13170/1_13170_02.jpg?ca=6&ce=1&s=375x&ar=1x1',
  'Hà Nội': 'https://pix6.agoda.net/geo/city/2758/065f4f2c9fa263611ab65239ecbeaff7.jpg?ce=0&s=375x&ar=1x1',
  'Nha Trang': 'https://pix6.agoda.net/geo/city/2679/1_2679_02.jpg?ca=6&ce=1&s=375x&ar=1x1',
  'Đà Lạt': 'https://pix6.agoda.net/geo/city/15932/1_15932_02.jpg?ca=6&ce=1&s=375x&ar=1x1',
  'Phú Quốc': 'https://pix6.agoda.net/geo/city/17188/1_17188_02.jpg?ca=6&ce=1&s=375x&ar=1x1',
  'Hội An': 'https://pix6.agoda.net/geo/city/16552/1_16552_02.jpg?ca=6&ce=1&s=375x&ar=1x1',
  'Sapa': 'https://pix6.agoda.net/geo/city/15932/1_15932_02.jpg?ca=6&ce=1&s=375x&ar=1x1',
  'Hạ Long': 'https://pix6.agoda.net/geo/city/17182/1_17182_02.jpg?ca=6&ce=1&s=375x&ar=1x1',
  'Buôn Ma Thuột': 'https://ticotravel.com.vn/wp-content/uploads/2022/08/Top-16-dia-diem-du-lich-Buon-Ma-Thuot-4.jpg',
  'Cà Mau': 'https://haivenu-vietnam.com/wp-content/uploads/2024/06/1-8.png',
  'Hải Phòng': 'https://cdn-media.sforum.vn/storage/app/media/thanhhuyen/%E1%BA%A3nh%20%C4%91%E1%BA%B9p%20h%E1%BA%A3i%20ph%C3%B2ng/1/anh-dep-hai-phong-13.jpg',
  'Huế': 'https://tse4.mm.bing.net/th/id/OIP.MA0_eQKBCiRrVQjIFbQC1QHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
  'Điện Biên Phủ': 'https://image.bnews.vn/MediaUpload/Org/2026/07/27/110428-den-tho-liet-si-tai-chien-truong-dien-bien-phu-diem-hen-cua-long-tri-an.jpg',
  'Phú Bổn': 'https://i.ytimg.com/vi/la2rGWplkAQ/maxresdefault.jpg',
  'Quảng Đức': 'https://i.pinimg.com/originals/0a/7e/5f/0a7e5f9a1bf3e28fecda13d83432baee.jpg'
};

async function main() {
  console.log('Starting image URL backfill...');
  for (const [cityNameVi, imageUrl] of Object.entries(CITY_IMAGES)) {
    const result = await prisma.city.updateMany({
      where: {
        cityNameVi: cityNameVi
      },
      data: {
        imageUrl: imageUrl
      }
    });
    console.log(`Updated ${result.count} rows for city: ${cityNameVi}`);
  }

  // Set a default image for Vietnam cities that still don't have one
  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2000&auto=format&fit=crop';
  const defaultResult = await prisma.city.updateMany({
    where: {
      countryIso2: 'VN',
      imageUrl: null
    },
    data: {
      imageUrl: DEFAULT_IMAGE
    }
  });
  console.log(`Updated ${defaultResult.count} remaining VN cities with default image.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Done.');
  });
