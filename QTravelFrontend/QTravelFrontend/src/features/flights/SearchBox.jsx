import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { searchFlightSchema } from '../../schemas/flightSchema';
import { PlaneTakeoff, PlaneLanding, Calendar, Users, Search, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LocationAutocomplete from '../../components/ui/LocationAutocomplete';

const SearchBox = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(searchFlightSchema),
    defaultValues: {
      trip_type: 'one-way',
      passengers: 1,
      cabin_class: 'economy',
    }
  });

  const tripType = watch('trip_type');

  const onSubmit = (data) => {
    const params = new URLSearchParams({
      trip_type: data.trip_type,
      origin: data.origin,
      destination: data.destination,
      departure_date: data.departure_date,
      passengers: data.passengers,
      cabin_class: data.cabin_class
    });
    if (data.trip_type === 'round-trip' && data.return_date) {
      params.append('return_date', data.return_date);
    }
    navigate(`/search?${params.toString()}`);
  };

  const handleSwap = () => {
    const origin = watch('origin');
    const destination = watch('destination');
    setValue('origin', destination);
    setValue('destination', origin);
  };

  return (
    <div className="bg-white p-8 rounded-[32px] shadow-2xl max-w-5xl mx-auto -mt-32 relative z-10 border border-gray-100">
      
      {/* Trip Type Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <label className={`cursor-pointer px-5 py-2.5 rounded-full text-sm font-semibold transition-colors border ${tripType === 'one-way' ? 'bg-blue-50 border-blue-500 text-primary' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
          <input type="radio" value="one-way" {...register('trip_type')} className="hidden" />
          One-way
        </label>
        <label className={`cursor-pointer px-5 py-2.5 rounded-full text-sm font-semibold transition-colors border ${tripType === 'round-trip' ? 'bg-blue-50 border-blue-500 text-primary' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
          <input type="radio" value="round-trip" {...register('trip_type')} className="hidden" />
          Round-trip
        </label>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        
        {/* Row 1: Locations */}
        <div className="flex flex-col md:flex-row gap-4 relative">
          <div className="flex-1 relative">
            <Controller
              name="origin"
              control={control}
              render={({ field }) => (
                <LocationAutocomplete 
                  label=""
                  icon={PlaneTakeoff}
                  placeholder="Origin (e.g. SGN)"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.origin}
                />
              )}
            />
            {errors.origin && <p className="text-red-500 text-xs mt-1 absolute -bottom-5">{errors.origin.message}</p>}
          </div>

          {/* Swap Button (Absolute center) */}
          <div 
            className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white border border-gray-200 rounded-full w-9 h-9 items-center justify-center cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all shadow-sm"
            onClick={handleSwap}
          >
            <ArrowRightLeft className="w-4 h-4 text-gray-500" />
          </div>

          <div className="flex-1 relative">
            <Controller
              name="destination"
              control={control}
              render={({ field }) => (
                <LocationAutocomplete 
                  label=""
                  icon={PlaneLanding}
                  placeholder="Destination (e.g. HAN)"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.destination}
                />
              )}
            />
            {errors.destination && <p className="text-red-500 text-xs mt-1 absolute -bottom-5">{errors.destination.message}</p>}
          </div>
        </div>

        {/* Row 2: Dates & Pax */}
        <div className="flex flex-col md:flex-row gap-4 mt-1">
          
          {/* Dates Box */}
          <div className="flex flex-1 border border-gray-200 rounded-xl overflow-hidden divide-x divide-gray-200 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
            <div className="flex-1 p-3 flex items-center relative bg-white">
              <Calendar className="text-gray-400 w-5 h-5 mr-3 shrink-0" />
              <div className="flex-1 min-w-0">
                <input 
                  type="date" 
                  {...register('departure_date')}
                  className="w-full bg-transparent outline-none text-gray-800 font-medium"
                />
              </div>
            </div>
            
            <div className={`flex-1 p-3 flex items-center relative transition-colors ${tripType === 'one-way' ? 'bg-gray-50 opacity-80 cursor-pointer hover:bg-gray-100' : 'bg-white'}`} onClick={() => tripType === 'one-way' && setValue('trip_type', 'round-trip')}>
              <Calendar className="text-gray-400 w-5 h-5 mr-3 shrink-0" />
              <div className="flex-1 min-w-0">
                {tripType === 'one-way' ? (
                  <div className="w-full text-gray-600 font-medium truncate">
                    + Return
                  </div>
                ) : (
                  <input 
                    type="date" 
                    {...register('return_date')}
                    className="w-full bg-transparent outline-none text-gray-800 font-medium"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Pax & Class Box */}
          <div className="flex flex-1 border border-gray-200 rounded-xl overflow-hidden divide-x divide-gray-200 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
            <div className="w-1/2 p-3 flex items-center bg-white">
              <Users className="text-gray-400 w-5 h-5 mr-3 shrink-0" />
              <div className="flex-1 flex items-center min-w-0">
                <input 
                  type="number" 
                  min="1"
                  {...register('passengers', { valueAsNumber: true })}
                  className="w-10 bg-transparent outline-none text-gray-800 font-medium"
                />
                <span className="text-gray-500 font-medium truncate">Pax</span>
              </div>
            </div>
            <div className="w-1/2 p-3 flex items-center bg-white">
              <select 
                {...register('cabin_class')}
                className="w-full bg-transparent outline-none text-gray-800 font-medium cursor-pointer truncate"
              >
                <option value="economy">Economy</option>
                <option value="premium_economy">Premium</option>
                <option value="business">Business</option>
                <option value="first">First</option>
              </select>
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
            <span>Search Flights</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default SearchBox;
