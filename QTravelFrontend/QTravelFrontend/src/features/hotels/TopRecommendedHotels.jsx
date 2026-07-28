import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MapPin } from 'lucide-react';
import hotelService from '../../services/hotel.service';

const CITIES = ['Đà Nẵng', 'Vũng Tàu', 'Hồ Chí Minh', 'Hà Nội', 'Nha Trang'];

const TopRecommendedHotels = () => {
  const [activeCity, setActiveCity] = useState(CITIES[0]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const response = await hotelService.searchHotels({ cityName: activeCity, limit: 5 });
        setHotels(response.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch recommended hotels:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [activeCity]);

  const handleSeeMore = () => {
    navigate(`/hotels/search?cityName=${encodeURIComponent(activeCity)}`);
  };

  const handleHotelClick = (id) => {
    navigate(`/hotels/${id}`);
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">
        Những chỗ nghỉ nổi bật được đề xuất cho quý khách:
      </h2>

      {/* Tabs & See More Link */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 mb-6">
        <div className="flex overflow-x-auto custom-scrollbar">
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors relative ${
                activeCity === city ? 'text-[#006CE4]' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {city}
              {activeCity === city && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#006CE4]" />
              )}
            </button>
          ))}
        </div>
        
        <button 
          onClick={handleSeeMore}
          className="text-[#006CE4] text-sm font-semibold hover:underline mt-4 md:mt-0 px-4 md:px-0 text-left md:text-right"
        >
          Xem thêm các chỗ nghỉ ({activeCity}) &gt;
        </button>
      </div>

      {/* Hotel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-[#006CE4]" />
          </div>
        ) : hotels.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            Không tìm thấy chỗ nghỉ nào ở {activeCity}.
          </div>
        ) : (
          hotels.map((hotel) => {
            const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop';
            const imageUrl = hotel.images && hotel.images.length > 0 ? hotel.images[0].url : defaultImage;
            
            return (
              <div 
                key={hotel.id}
                className="group cursor-pointer rounded-xl flex flex-col bg-transparent"
                onClick={() => handleHotelClick(hotel.id)}
              >
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 relative shadow-sm border border-gray-200">
                  <img 
                    src={imageUrl} 
                    alt={hotel.name} 
                    className="w-full h-full object-cover transition-transform duration-500"
                  />
                  {hotel.overallRating && (
                    <div className="absolute top-2 right-2 bg-[#003B95] text-white font-bold text-sm px-2 py-1 rounded shadow">
                      {hotel.overallRating}
                    </div>
                  )}
                </div>
                
                <h3 className="font-bold text-gray-900 text-sm md:text-base group-hover:text-[#006CE4] transition-colors leading-snug mb-1 line-clamp-2">
                  {hotel.name}
                </h3>
                
                <div className="flex items-center text-gray-500 text-xs md:text-sm font-medium mb-1">
                  <MapPin className="w-3 h-3 text-[#006CE4] mr-1 flex-shrink-0" />
                  <span className="truncate">{hotel.city?.cityNameVi || hotel.city?.cityName || activeCity}</span>
                </div>
                
                <div className="mt-auto pt-2">
                  <p className="text-xs text-gray-500">Giá mỗi đêm chưa gồm thuế và phí</p>
                  <p className="text-[#d32f2f] font-bold text-lg">
                    VND {hotel.ratePerNight ? hotel.ratePerNight.toLocaleString('vi-VN') : '1.500.000'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TopRecommendedHotels;
