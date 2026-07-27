import { useState } from 'react';
import { ChevronDown, ChevronUp, Briefcase, Backpack, PlaneTakeoff, Info, Tv, Utensils, Wifi, Zap } from 'lucide-react';
import { format } from 'date-fns';
import useCurrencyStore from '../../store/useCurrencyStore';

const formatDuration = (isoDuration) => {
  if (!isoDuration) return '';
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?/);
  const hours = match[1] ? match[1].replace('H', '') : '0';
  const mins = match[2] ? match[2].replace('M', '') : '0';
  return `${hours}g ${mins}ph`;
};

const FlightCard = ({ offer, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { formatPrice } = useCurrencyStore();

  if (!offer || !offer.slices || offer.slices.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden mb-4">
      {/* Summary View */}
      <div className="p-4 md:p-5 flex flex-col md:flex-row justify-between gap-4 md:gap-6 relative">
        
        {/* Slices Column */}
        <div className="flex-1 flex flex-col gap-6">
          {offer.slices.map((slice, idx) => {
            const firstSeg = slice.segments[0];
            const lastSeg = slice.segments[slice.segments.length - 1];
            const depTime = new Date(firstSeg.departing_at);
            const arrTime = new Date(lastSeg.arriving_at);
            
            const baggages = firstSeg.passengers[0]?.baggages || [];
            const hasCarryOn = baggages.some(b => b.type === 'carry_on');
            const hasChecked = baggages.some(b => b.type === 'checked');

            return (
              <div key={idx} className="flex flex-col md:flex-row gap-6 items-center">
                {/* Airline Info */}
                <div className="flex items-start gap-3 w-48 shrink-0">
                  <img src={slice.segments[0].operating_carrier.logo_symbol_url} alt={slice.segments[0].operating_carrier.name} className="w-10 h-10 object-contain mt-1" />
                  <div>
                    <span className="font-semibold text-gray-800 text-sm block">{slice.segments[0].operating_carrier.name}</span>
                    <div className="text-[11px] text-[#008234] flex flex-col mt-1 gap-0.5">
                      {hasCarryOn && <span className="flex items-center gap-1"><Backpack className="w-3 h-3" /> Hành lý xách tay</span>}
                      {hasChecked && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> Hành lý ký gửi</span>}
                      {!hasCarryOn && !hasChecked && <span className="text-gray-400">Không kèm hành lý</span>}
                    </div>
                  </div>
                </div>

                {/* Times & Path */}
                <div className="flex-1 flex items-center justify-center gap-4 w-full px-2">
                  <div className="text-right w-16">
                    <p className="text-lg font-bold">{format(depTime, 'HH:mm')}</p>
                    <p className="text-xs text-gray-500 uppercase">{firstSeg.origin.iata_code}</p>
                  </div>
                  
                  <div className="flex flex-col items-center flex-1 max-w-[150px]">
                    <div className="w-full flex items-center relative h-6">
                      <div className="h-[2px] bg-gray-300 w-full absolute top-1/2 -translate-y-1/2 rounded-full"></div>
                      <PlaneTakeoff className="w-4 h-4 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 bg-white pl-1" />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{formatDuration(slice.duration)}</span>
                  </div>

                  <div className="text-left w-16">
                    <p className="text-lg font-bold">{format(arrTime, 'HH:mm')}</p>
                    <p className="text-xs text-gray-500 uppercase">{lastSeg.destination.iata_code}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Price & Action Column */}
        <div className="flex flex-col items-end justify-between border-l-0 md:border-l border-gray-100 pl-0 md:pl-6 w-full md:w-56 shrink-0 relative mt-4 md:mt-0">
          <div className="text-right w-full pr-8 md:pr-10">
            <p className="text-2xl font-bold text-[#e12d2d] leading-none">
              {formatPrice(offer.total_amount, offer.base_currency)}
            </p>
          </div>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute right-0 top-0 border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-700 transition-colors flex items-center justify-center p-1 w-8 h-8 shadow-sm"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {!isExpanded && (
            <button 
              onClick={() => onSelect(offer.id)}
              className="w-full mt-4 bg-[#006CE4] text-white py-2 px-4 rounded font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Chọn
            </button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-blue-50/30 p-4 md:p-6">
          {offer.slices.map((slice, idx) => (
            <div key={idx} className="mb-8 last:mb-0">
              {idx > 0 && <div className="h-px bg-gray-200 my-6 w-full"></div>}
              
              {slice.segments.map((seg, sIdx) => {
                const depTime = new Date(seg.departing_at);
                const arrTime = new Date(seg.arriving_at);
                const pax = seg.passengers[0];
                const amenities = pax?.cabin?.amenities;

                return (
                  <div key={sIdx} className="flex gap-4 mb-4 last:mb-0 relative">
                    
                    {/* Vertical Timeline Left */}
                    <div className="flex flex-col items-end w-16 shrink-0 text-sm">
                      <div className="font-bold">{format(depTime, 'HH:mm')}</div>
                      <div className="text-gray-500 text-xs">{format(depTime, 'dd MMM')}</div>
                      
                      <div className="flex-1 flex flex-col items-end justify-center min-h-[60px] my-2 text-xs text-gray-500">
                        {formatDuration(seg.duration)}
                      </div>
                      
                      <div className="font-bold">{format(arrTime, 'HH:mm')}</div>
                      <div className="text-gray-500 text-xs">{format(arrTime, 'dd MMM')}</div>
                    </div>
                    
                    {/* Timeline Line with Dots */}
                    <div className="flex flex-col items-center py-1.5 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full border-[2.5px] border-gray-400 bg-white z-10"></div>
                      <div className="flex-1 w-[1.5px] bg-gray-400 -my-1"></div>
                      <div className="w-2.5 h-2.5 rounded-full border-[2.5px] border-gray-400 bg-white z-10"></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-2 flex flex-col md:flex-row gap-6">
                      
                      {/* Flight Route Details */}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 text-base">
                          {seg.origin.city_name} ({seg.origin.iata_code})
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">{seg.origin.name}</div>
                        
                        <div className="my-5 flex items-start gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                          <img src={seg.operating_carrier.logo_symbol_url} alt="logo" className="w-6 h-6 object-contain mt-0.5" />
                          <div className="text-sm">
                            <span className="font-semibold text-gray-800">{seg.operating_carrier.name}</span>
                            <div className="text-gray-500 mt-1 flex flex-wrap gap-x-2 gap-y-1">
                              <span>{pax?.cabin_class_marketing_name || 'Economy'}</span>
                              <span>•</span>
                              <span>{seg.operating_carrier.iata_code} {seg.operating_carrier_flight_number}</span>
                              <span>•</span>
                              <span>{seg.aircraft?.name || 'Aircraft'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="font-semibold text-gray-800 text-base mt-2">
                          {seg.destination.city_name} ({seg.destination.iata_code})
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">{seg.destination.name}</div>
                      </div>

                      {/* Amenities Details */}
                      <div className="text-sm text-gray-600 mt-2 md:mt-0 flex flex-col gap-2.5 md:w-56 shrink-0 md:pt-1">
                        {seg.aircraft?.name && (
                          <div className="flex items-center gap-2"><PlaneTakeoff className="w-4 h-4" /> {seg.aircraft.name}</div>
                        )}
                        <div className="flex items-center gap-2"><Utensils className="w-4 h-4" /> Sẵn có bữa ăn</div>
                        <div className="flex items-center gap-2"><Tv className="w-4 h-4" /> Giải trí (Miễn phí)</div>
                        {amenities?.wifi?.available && (
                          <div className="flex items-center gap-2"><Wifi className="w-4 h-4" /> Wi-Fi ({amenities.wifi.cost})</div>
                        )}
                        {amenities?.power?.available && (
                          <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> Sẵn có ổ cắm điện</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={() => onSelect(offer.id)}
              className="bg-[#006CE4] text-white py-2.5 px-10 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-md"
            >
              Chọn
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightCard;
