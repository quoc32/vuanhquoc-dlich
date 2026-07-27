import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import FlightCard from '../features/flights/FlightCard';
import { Plane, Filter, Loader2, SlidersHorizontal } from 'lucide-react';
import useCurrencyStore from '../store/useCurrencyStore';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { formatPrice, targetCurrency } = useCurrencyStore();

  // Limits derived from fetched offers
  const [limits, setLimits] = useState({
    maxPrice: 100000000,
    maxDuration: 72 * 60,
  });

  // Filter state
  const [filters, setFilters] = useState({
    airlines: [],
    stops: [],
    maxPrice: 100000000,
    maxDuration: 72 * 60,
    depTime: { min: 0, max: 24 },
    arrTime: { min: 0, max: 24 }
  });

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const slices = [
          {
            origin: searchParams.get('origin'),
            destination: searchParams.get('destination'),
            departure_date: searchParams.get('departure_date'),
          }
        ];

        if (searchParams.get('trip_type') === 'round-trip') {
          slices.push({
            origin: searchParams.get('destination'),
            destination: searchParams.get('origin'),
            departure_date: searchParams.get('return_date'),
          });
        }

        const reqData = {
          data: {
            slices: slices,
            passengers: Array(Number(searchParams.get('passengers'))).fill({ type: 'adult' }),
            cabin_class: searchParams.get('cabin_class') || 'economy'
          }
        };

        const resReq = await api.post('/flights/offer_requests?return_offers=false', reqData);
        const offerRequestId = resReq.data.data.id;

        const offersRes = await api.get(`/flights/offers`, {
          params: {
            offer_request_id: offerRequestId,
            sort: 'total_amount'
          }
        });
        
        const fetchedOffers = offersRes.data.data || [];
        setOffers(fetchedOffers);

        // Calculate dynamic limits based on offers
        let maxP = 0;
        let maxD = 0;
        fetchedOffers.forEach(o => {
          const price = parseFloat(o.total_amount);
          if (price > maxP) maxP = price;

          const durMatch = o.slices[0].duration.match(/PT(\d+H)?(\d+M)?/);
          const hours = durMatch && durMatch[1] ? parseInt(durMatch[1]) : 0;
          const mins = durMatch && durMatch[2] ? parseInt(durMatch[2]) : 0;
          const totalMins = hours * 60 + mins;
          if (totalMins > maxD) maxD = totalMins;
        });

        // Set limits and default filters
        const finalMaxP = maxP > 0 ? maxP : 100000000;
        const finalMaxD = maxD > 0 ? maxD : 72 * 60;
        
        setLimits({ maxPrice: finalMaxP, maxDuration: finalMaxD });
        setFilters(prev => ({
          ...prev,
          maxPrice: finalMaxP,
          maxDuration: finalMaxD
        }));

      } catch (err) {
        setError('Failed to fetch flights. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (searchParams.get('origin')) {
      fetchOffers();
    }
  }, [searchParams]);

  const uniqueAirlines = useMemo(() => {
    const airlines = new Set();
    offers.forEach(o => {
      airlines.add(o.owner.name);
    });
    return Array.from(airlines).sort();
  }, [offers]);

  // Apply filters
  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      // Airlines
      if (filters.airlines.length > 0 && !filters.airlines.includes(offer.owner.name)) {
        return false;
      }
      
      // Stops
      if (filters.stops.length > 0) {
        const stopsCount = offer.slices[0].segments.length - 1;
        let stopType = 'direct';
        if (stopsCount === 1) stopType = '1';
        if (stopsCount >= 2) stopType = '2+';
        if (!filters.stops.includes(stopType)) return false;
      }

      // Price
      if (parseFloat(offer.total_amount) > filters.maxPrice) return false;

      // Duration
      const durMatch = offer.slices[0].duration.match(/PT(\d+H)?(\d+M)?/);
      const hours = durMatch && durMatch[1] ? parseInt(durMatch[1]) : 0;
      const mins = durMatch && durMatch[2] ? parseInt(durMatch[2]) : 0;
      const totalMins = hours * 60 + mins;
      if (totalMins > filters.maxDuration) return false;

      // Schedule
      const depDate = new Date(offer.slices[0].segments[0].departing_at);
      const arrDate = new Date(offer.slices[0].segments[offer.slices[0].segments.length-1].arriving_at);
      const depHour = depDate.getHours();
      const arrHour = arrDate.getHours();

      if (depHour < filters.depTime.min || depHour > filters.depTime.max) return false;
      if (arrHour < filters.arrTime.min || arrHour > filters.arrTime.max) return false;

      return true;
    });
  }, [offers, filters]);

  const handleSelect = (offerId) => {
    navigate(`/booking?offer_id=${offerId}`);
  };

  return (
    <div className="bg-[#f5f7fa] flex-1 py-8">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Filter Sidebar */}
        <div className="lg:col-span-1 hidden lg:block">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-24 p-5 flex flex-col max-h-[calc(100vh-120px)]">
            <div className="flex items-center gap-2 mb-4 border-b pb-4 shrink-0">
              <SlidersHorizontal className="w-5 h-5 text-gray-700" />
              <h3 className="font-bold text-lg text-gray-800">Bộ lọc</h3>
            </div>
            
            <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-1 pb-4">
              
              {/* Airlines */}
              <div className="border-b border-gray-100 pb-5">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm">Hãng hàng không</h4>
                  {filters.airlines.length > 0 && <button onClick={() => setFilters({...filters, airlines: []})} className="text-xs text-[#006CE4] font-medium hover:underline">Xóa</button>}
                </div>
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {uniqueAirlines.map(airline => (
                    <label key={airline} className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-[#006CE4] focus:ring-[#006CE4] cursor-pointer" 
                        checked={filters.airlines.includes(airline)}
                        onChange={(e) => {
                          if (e.target.checked) setFilters({...filters, airlines: [...filters.airlines, airline]});
                          else setFilters({...filters, airlines: filters.airlines.filter(a => a !== airline)});
                        }}
                      /> 
                      <span className="truncate" title={airline}>{airline}</span>
                    </label>
                  ))}
                  {uniqueAirlines.length === 0 && <p className="text-xs text-gray-400 italic">Không có dữ liệu</p>}
                </div>
              </div>

              {/* Stops */}
              <div className="border-b border-gray-100 pb-5">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm">Điểm dừng</h4>
                  {filters.stops.length > 0 && <button onClick={() => setFilters({...filters, stops: []})} className="text-xs text-[#006CE4] font-medium hover:underline">Xóa</button>}
                </div>
                <div className="space-y-2.5">
                  {['direct', '1', '2+'].map(stop => (
                    <label key={stop} className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-[#006CE4] focus:ring-[#006CE4] cursor-pointer"
                        checked={filters.stops.includes(stop)}
                        onChange={(e) => {
                          if (e.target.checked) setFilters({...filters, stops: [...filters.stops, stop]});
                          else setFilters({...filters, stops: filters.stops.filter(s => s !== stop)});
                        }}
                      /> 
                      {stop === 'direct' ? 'Bay thẳng' : stop === '1' ? '1 Điểm dừng' : '>2 Điểm dừng'}
                    </label>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="border-b border-gray-100 pb-5">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm">Lịch trình</h4>
                  {(filters.depTime.min !== 0 || filters.depTime.max !== 24 || filters.arrTime.min !== 0 || filters.arrTime.max !== 24) && (
                    <button onClick={() => setFilters({...filters, depTime: {min: 0, max: 24}, arrTime: {min: 0, max: 24}})} className="text-xs text-[#006CE4] font-medium hover:underline">Xóa</button>
                  )}
                </div>
                
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Khởi hành</span>
                    <span className="font-medium text-gray-700">{String(filters.depTime.min).padStart(2, '0')}:00 - {String(filters.depTime.max).padStart(2, '0')}:59</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-gray-400">Min</span>
                    <input type="range" min="0" max="24" value={filters.depTime.min} onChange={e => {
                        const val = parseInt(e.target.value);
                        if (val <= filters.depTime.max) setFilters({...filters, depTime: {...filters.depTime, min: val}});
                      }} className="w-1/2 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006CE4]" />
                    <input type="range" min="0" max="24" value={filters.depTime.max} onChange={e => {
                        const val = parseInt(e.target.value);
                        if (val >= filters.depTime.min) setFilters({...filters, depTime: {...filters.depTime, max: val}});
                      }} className="w-1/2 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006CE4]" />
                    <span className="text-xs text-gray-400">Max</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Đến</span>
                    <span className="font-medium text-gray-700">{String(filters.arrTime.min).padStart(2, '0')}:00 - {String(filters.arrTime.max).padStart(2, '0')}:59</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-gray-400">Min</span>
                    <input type="range" min="0" max="24" value={filters.arrTime.min} onChange={e => {
                        const val = parseInt(e.target.value);
                        if (val <= filters.arrTime.max) setFilters({...filters, arrTime: {...filters.arrTime, min: val}});
                      }} className="w-1/2 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006CE4]" />
                    <input type="range" min="0" max="24" value={filters.arrTime.max} onChange={e => {
                        const val = parseInt(e.target.value);
                        if (val >= filters.arrTime.min) setFilters({...filters, arrTime: {...filters.arrTime, max: val}});
                      }} className="w-1/2 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006CE4]" />
                    <span className="text-xs text-gray-400">Max</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="border-b border-gray-100 pb-5">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm">Giá mỗi người</h4>
                  {filters.maxPrice < limits.maxPrice && <button onClick={() => setFilters({...filters, maxPrice: limits.maxPrice})} className="text-xs text-[#006CE4] font-medium hover:underline">Xóa</button>}
                </div>
                <div className="text-sm text-gray-700 mb-3 font-medium">Lên đến {formatPrice(filters.maxPrice, 'AUD')}</div>
                <input 
                  type="range" 
                  min="0" 
                  max={limits.maxPrice} 
                  value={filters.maxPrice} 
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006CE4]" 
                />
              </div>

              {/* Duration */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm">Thời gian bay</h4>
                  {filters.maxDuration < limits.maxDuration && <button onClick={() => setFilters({...filters, maxDuration: limits.maxDuration})} className="text-xs text-[#006CE4] font-medium hover:underline">Xóa</button>}
                </div>
                <div className="text-sm text-gray-700 mb-3 font-medium">Dưới {Math.floor(filters.maxDuration / 60)} tiếng {filters.maxDuration % 60} phút</div>
                <input 
                  type="range" 
                  min="0" 
                  max={limits.maxDuration} 
                  value={filters.maxDuration} 
                  onChange={(e) => setFilters({...filters, maxDuration: e.target.value})}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006CE4]" 
                />
              </div>

            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="lg:col-span-3">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                {searchParams.get('origin')} <Plane className="w-4 h-4 text-gray-400" /> {searchParams.get('destination')}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {searchParams.get('departure_date')} {searchParams.get('trip_type') === 'round-trip' ? ` - ${searchParams.get('return_date')}` : ''} • {searchParams.get('passengers')} Passenger(s) • {searchParams.get('cabin_class')}
              </p>
            </div>
            <div className="text-sm font-semibold text-[#006CE4] bg-blue-50 px-3 py-1.5 rounded-md">
              {filteredOffers.length} kết quả
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-xl border border-gray-200">
              <Loader2 className="w-10 h-10 text-[#006CE4] animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Đang tìm kiếm chuyến bay tốt nhất...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-8 rounded-xl text-center border border-red-100">
              {error}
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="bg-white py-20 px-4 rounded-xl border border-gray-200 text-center">
              <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy chuyến bay</h3>
              <p className="text-gray-500">Thử thay đổi bộ lọc hoặc ngày bay của bạn.</p>
              {offers.length > 0 && (
                <button 
                  onClick={() => setFilters({
                    airlines: [], stops: [], maxPrice: limits.maxPrice, maxDuration: limits.maxDuration, 
                    depTime: {min: 0, max: 24}, arrTime: {min: 0, max: 24}
                  })}
                  className="mt-6 text-[#006CE4] font-semibold hover:underline"
                >
                  Xóa tất cả bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div>
              {filteredOffers.map(offer => (
                <FlightCard key={offer.id} offer={offer} onSelect={handleSelect} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SearchResults;
