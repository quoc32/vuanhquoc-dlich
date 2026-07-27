import { useForm, Controller } from 'react-hook-form';
import { MapPin, Calendar, Users, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CityAutocomplete from '../../components/ui/CityAutocomplete';

const HotelSearchBox = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, control, watch } = useForm({
    defaultValues: {
      city: { cityId: null, cityName: '' },
      checkIn: '',
      checkOut: '',
      guests: 2,
      rooms: 1,
    }
  });

  const onSubmit = (data) => {
    const params = new URLSearchParams();
    if (data.city?.cityId) {
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
                  value={field.value?.cityName || ''}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        {/* Row 2: Dates & Guests */}
        <div className="flex flex-col md:flex-row gap-4 mt-1">
          
          {/* Dates Box */}
          <div className="flex flex-1 border border-gray-200 rounded-xl overflow-hidden divide-x divide-gray-200 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
            <div className="flex-1 p-3 flex items-center relative bg-white">
              <Calendar className="text-gray-400 w-5 h-5 mr-3 shrink-0" />
              <div className="flex-1 min-w-0">
                <input 
                  type="date" 
                  {...register('checkIn')}
                  className="w-full bg-transparent outline-none text-gray-800 font-medium"
                />
              </div>
            </div>
            
            <div className="flex-1 p-3 flex items-center relative bg-white">
              <Calendar className="text-gray-400 w-5 h-5 mr-3 shrink-0" />
              <div className="flex-1 min-w-0">
                <input 
                  type="date" 
                  {...register('checkOut')}
                  className="w-full bg-transparent outline-none text-gray-800 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Guests & Rooms Box */}
          <div className="flex flex-1 border border-gray-200 rounded-xl overflow-hidden divide-x divide-gray-200 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
            <div className="w-1/2 p-3 flex items-center bg-white">
              <Users className="text-gray-400 w-5 h-5 mr-3 shrink-0" />
              <div className="flex-1 flex items-center min-w-0">
                <input 
                  type="number" 
                  min="1"
                  {...register('guests', { valueAsNumber: true })}
                  className="w-10 bg-transparent outline-none text-gray-800 font-medium"
                />
                <span className="text-gray-500 font-medium truncate">Guests</span>
              </div>
            </div>
            <div className="w-1/2 p-3 flex items-center bg-white">
              <div className="flex-1 flex items-center min-w-0 pl-3">
                <input 
                  type="number" 
                  min="1"
                  {...register('rooms', { valueAsNumber: true })}
                  className="w-10 bg-transparent outline-none text-gray-800 font-medium"
                />
                <span className="text-gray-500 font-medium truncate">Rooms</span>
              </div>
            </div>
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
