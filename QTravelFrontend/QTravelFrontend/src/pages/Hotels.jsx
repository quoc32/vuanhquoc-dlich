import HotelSearchBox from '../features/hotels/HotelSearchBox';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const DEALS = [
  { id: 1, image: 'https://images.unsplash.com/photo-1542314831-c6a4d14d837e?q=80&w=2070&auto=format&fit=crop', title: 'Luxury Resorts', price: 'from $199/night' },
  { id: 2, image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2049&auto=format&fit=crop', title: 'City Center Hotels', price: 'from $99/night' },
  { id: 3, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop', title: 'Beachfront Villas', price: 'from $299/night' },
  { id: 4, image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=2074&auto=format&fit=crop', title: 'Boutique Stays', price: 'from $149/night' },
];

const Hotels = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div 
        className="h-[500px] bg-cover bg-center relative"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=1920&auto=format&fit=crop)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20" />
        <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10 text-white pt-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">Find your perfect stay</h1>
          <p className="text-lg md:text-xl font-medium drop-shadow-md">Discover the best hotel deals for your dream vacations.</p>
        </div>
      </div>

      {/* Search Box - overlaps hero */}
      <div className="container mx-auto px-4">
        <HotelSearchBox />
      </div>

      {/* Special Offers Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Hotel Collections</h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="pb-12"
        >
          {DEALS.map((deal) => (
            <SwiperSlide key={deal.id}>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer border border-gray-100">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={deal.image} 
                    alt={deal.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-sm font-medium opacity-90">{deal.price}</p>
                    <h3 className="text-xl font-bold">{deal.title}</h3>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      {/* Why Book With Us */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 mx-auto bg-blue-100 text-primary rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Secure Payment</h3>
              <p className="text-gray-500 text-sm">We use top-tier encryption to ensure your payment details are safe.</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 mx-auto bg-blue-100 text-primary rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Best Price Guarantee</h3>
              <p className="text-gray-500 text-sm">Find a lower price? We'll refund you the difference.</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 mx-auto bg-blue-100 text-primary rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">24/7 Support</h3>
              <p className="text-gray-500 text-sm">Our customer support team is available around the clock to help you.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hotels;
