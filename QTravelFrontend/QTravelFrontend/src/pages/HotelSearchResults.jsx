import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, MapPin } from 'lucide-react';
import hotelService from '../services/hotel.service';
import HotelCard from '../features/hotels/HotelCard';
import HotelSearchBox from '../features/hotels/HotelSearchBox';

const HotelSearchResults = () => {
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceLimit, setPriceLimit] = useState(10000000);
  const [selectedRatings, setSelectedRatings] = useState([]);

  const cityId = searchParams.get('cityId');
  const cityName = searchParams.get('cityName');
  const hotelName = searchParams.get('hotelName');

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (cityId) params.cityId = cityId;
        if (cityName) params.cityName = cityName;
        if (hotelName) params.hotelName = hotelName;
        params.maxPrice = priceLimit;
        if (selectedRatings.length > 0) {
          params.ratings = selectedRatings;
        }
        
        const response = await hotelService.searchHotels(params);
        setHotels(response.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch hotels:', err);
        setError('Failed to load hotels. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [searchParams, priceLimit, selectedRatings]);

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Top Search Bar Area */}
      <div className="bg-primary pt-12 pb-24">
        <div className="container mx-auto px-4">
          <h1 className="text-white text-3xl font-bold mb-4">
            {hotelName ? `Searching for: ${hotelName}` : `Hotels in ${cityName || 'your selected destination'}`}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <HotelSearchBox />
      </div>

      <div className="container mx-auto px-4 mt-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters (Placeholder) */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
            <h3 className="font-bold text-lg mb-4">Filter by</h3>
            
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">Giá phòng (VND)</h4>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>0đ</span>
                <span>{priceLimit.toLocaleString('vi-VN')}đ</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10000000" 
                step="100000"
                value={priceLimit}
                onChange={(e) => setPriceLimit(Number(e.target.value))}
                className="w-full accent-primary" 
              />
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">Xếp hạng chỗ nghỉ</h4>
              {[5, 4, 3, 2, 1].map((stars) => (
                <label key={stars} className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedRatings.includes(stars)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRatings(prev => [...prev, stars]);
                      } else {
                        setSelectedRatings(prev => prev.filter(r => r !== stars));
                      }
                    }}
                    className="rounded text-primary focus:ring-primary" 
                  />
                  <span className="text-sm text-gray-700">{stars} Sao</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Searching for the best hotels...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-red-100 p-8 text-center shadow-sm">
              <p className="text-red-500 font-medium">{error}</p>
            </div>
          ) : hotels.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No hotels found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or destination.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-gray-600 font-medium mb-2">{hotels.length} properties found</p>
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelSearchResults;
