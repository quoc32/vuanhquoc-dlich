import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import useCurrencyStore from '../../store/useCurrencyStore';

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrencyStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const defaultImage = 'https://static.vecteezy.com/system/resources/previews/019/520/917/original/failed-to-load-page-concept-illustration-flat-design-eps10-modern-graphic-element-for-landing-page-empty-state-ui-infographic-icon-vector.jpg';
  
  const images = hotel.images && hotel.images.length > 0 ? hotel.images : [{ url: defaultImage }];
  const imageUrl = images[currentImageIndex]?.url || defaultImage;

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col md:flex-row group">
      {/* Image */}
      <div className="w-full md:w-72 h-56 md:h-auto shrink-0 relative bg-gray-100 group/image">
        <img 
          src={imageUrl} 
          alt={hotel?.name || 'Hotel'} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = defaultImage; }}
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-800 shadow-md opacity-0 group-hover/image:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-800 shadow-md opacity-0 group-hover/image:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {/* Image Counter */}
            <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              {currentImageIndex + 1}/{images.length}
            </div>
          </>
        )}

        {hotel?.overallRating && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-bold flex items-center gap-1 shadow-sm">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>{hotel.overallRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col justify-between flex-1 min-w-0">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <h3 
              onClick={() => navigate(`/hotels/${hotel.id}`)}
              className="text-xl font-bold text-gray-900 leading-tight truncate w-full whitespace-normal line-clamp-2 cursor-pointer hover:text-[#006CE4] transition-colors"
            >
              {hotel?.name || 'Unknown Hotel'}
            </h3>
            {hotel?.ratePerNight && (
              <div className="text-left sm:text-right shrink-0 mt-2 sm:mt-0">
                <span className="block text-xs text-gray-500 font-medium">from</span>
                <span className="block text-2xl font-black text-[#006CE4]">{formatPrice(hotel.ratePerNight, 'VND')}</span>
                <span className="block text-xs text-gray-500">per night</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-gray-500 mt-3 text-sm">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {hotel?.address || ''}
              {hotel?.city?.cityName ? `${hotel.address ? ', ' : ''}${hotel.city.cityName}` : ''}
            </span>
          </div>
          
          {hotel?.description && (
            <p className="text-sm text-gray-600 mt-3 line-clamp-2">
              {hotel.description}
            </p>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={() => navigate(`/hotels/${hotel.id}`)}
            className="bg-white border border-[#006CE4] text-[#006CE4] hover:bg-blue-50 px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            Xem chi tiết
          </button>
          {hotel?.link && (
            <a 
              href={hotel.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#006CE4] hover:bg-[#0057b8] text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm inline-flex items-center justify-center"
            >
              Đặt ngay
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
