import { useForm, Controller } from 'react-hook-form';
import { MapPin, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CityAutocomplete from '../../components/ui/CityAutocomplete';

const HotelSearchBox = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, control, watch } = useForm({
    defaultValues: {
      city: { type: 'city', cityId: null, cityName: '', hotelName: '' }
    }
  });

  const onSubmit = (data) => {
    const params = new URLSearchParams();
    if (data.city?.type === 'hotel' && data.city?.hotelName) {
      params.append('hotelName', data.city.hotelName);
    } else if (data.city?.cityId) {
      params.append('cityId', data.city.cityId);
    } else if (data.city?.cityName) {
      params.append('cityName', data.city.cityName);
    }
    
    // Add other params if needed for the backend in the future
    // params.append('checkIn', data.checkIn);
    // params.append('checkOut', data.checkOut);
    // params.append('guests', data.guests);
    // params.append('rooms', data.rooms);

    navigate(`/hotels/search?${params.toString()}`);
  };

  return (
    <div className="bg-white p-8 rounded-[32px] shadow-2xl max-w-5xl mx-auto -mt-32 relative z-10 border border-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        
        {/* Row 1: Location */}
        <div className="flex flex-col md:flex-row gap-4 relative">
          <div className="flex-1 relative">
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <CityAutocomplete 
                  label=""
                  icon={MapPin}
                  placeholder="Where are you going? (e.g. Tokyo)"
                  value={field.value?.hotelName || field.value?.cityName || ''}
                  onChange={(val) => {
                    field.onChange(val);
                    if (val.type === 'hotel' && val.hotelId) {
                      navigate(`/hotels/${val.hotelId}`);
                    }
                  }}
                />
              )}
            />
          </div>
        </div>



        {/* Submit */}
        <div className="flex justify-center mt-6">
          <button 
            type="submit" 
            className="w-full md:w-1/2 bg-[#006CE4] hover:bg-[#0057b8] text-white py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <Search className="w-6 h-6" />
            <span>Search Hotels</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default HotelSearchBox;
