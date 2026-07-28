import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useNavigate } from 'react-router-dom';
import hotelService from '../../services/hotel.service';
import { Loader2 } from 'lucide-react';

const DEFAULT_IMAGE = 'https://static.vecteezy.com/system/resources/previews/019/520/917/original/failed-to-load-page-concept-illustration-flat-design-eps10-modern-graphic-element-for-landing-page-empty-state-ui-infographic-icon-vector.jpg';

const TopDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopDestinations = async () => {
      try {
        const response = await hotelService.getTopDestinations();
        setDestinations(response.data);
      } catch (error) {
        console.error('Failed to fetch top destinations', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopDestinations();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-[#006CE4]" />
      </div>
    );
  }

  if (destinations.length === 0) {
    return null;
  }

  const handleCityClick = (cityName) => {
    navigate(`/hotels/search?cityName=${encodeURIComponent(cityName)}`);
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Các điểm đến thu hút nhất Việt Nam</h2>
      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView={2}
        navigation
        breakpoints={{
          640: { slidesPerView: 3, spaceBetween: 16 },
          768: { slidesPerView: 4, spaceBetween: 20 },
          1024: { slidesPerView: 5, spaceBetween: 24 },
        }}
        className="pb-4"
      >
        {destinations.map((dest) => {
          const image = dest.imageUrl || DEFAULT_IMAGE;
          
          return (
            <SwiperSlide key={dest.id}>
              <div 
                className="group cursor-pointer rounded-xl overflow-hidden flex flex-col items-center bg-transparent"
                onClick={() => handleCityClick(dest.cityName)}
              >
                <div className="w-full aspect-[4/3] overflow-hidden rounded-2xl mb-3 shadow-sm relative">
                  <img 
                    src={image} 
                    alt={dest.cityNameVi || dest.cityName} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#006CE4] transition-colors text-center truncate w-full px-2">
                  {dest.cityNameVi || dest.cityName}
                </h3>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  {dest.hotelCount} chỗ ở
                </p>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default TopDestinations;
