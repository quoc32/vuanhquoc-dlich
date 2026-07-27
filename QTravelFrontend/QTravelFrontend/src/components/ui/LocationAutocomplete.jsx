import { useState, useEffect, useRef } from 'react';
import { MapPin, PlaneTakeoff, Loader2 } from 'lucide-react';
import api from '../../services/api';

const LocationAutocomplete = ({ icon: Icon, placeholder, label, value, onChange, error }) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/flights/places/suggestions?query=${encodeURIComponent(query)}`);
        setSuggestions(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      if (isOpen) {
        fetchSuggestions();
      }
    }, 400);

    return () => clearTimeout(debounce);
  }, [query, isOpen]);

  const handleSelect = (place) => {
    setQuery(`${place.name} (${place.iata_code})`);
    onChange(place.iata_code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {label && <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</label>}
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value); 
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white ${error ? 'border-red-500' : 'border-gray-200'}`}
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
      </div>
      
      {isOpen && (query.length >= 2) && (
        <div className="absolute z-50 w-full md:w-[350px] mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-[400px] overflow-y-auto">
          {suggestions.length > 0 ? (
            <ul className="py-2">
              {suggestions.map((place) => (
                <li 
                  key={place.id}
                  onClick={() => handleSelect(place)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-4 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    {place.type === 'city' ? (
                      <MapPin className="w-4 h-4 text-gray-500" />
                    ) : (
                      <PlaneTakeoff className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {place.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {place.city_name}, {place.iata_country_code}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-gray-700 block">
                      {place.iata_code}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-medium">
                      {place.type === 'city' ? 'All airports' : 'Airport'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : !loading && (
            <div className="px-4 py-8 text-center text-gray-500">
              <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium">No results found</p>
              <p className="text-xs mt-1">Check your spelling or try a different city</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
