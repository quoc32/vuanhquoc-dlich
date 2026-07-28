import { useEffect, useState } from 'react';
import { MapPin, Building, Loader2 } from 'lucide-react';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const p1 = lat1 * Math.PI/180;
  const p2 = lat2 * Math.PI/180;
  const dp = (lat2-lat1) * Math.PI/180;
  const dl = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(dp/2) * Math.sin(dp/2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; 
};

const formatDistance = (d) => {
  if (d > 1000) {
    return (d / 1000).toFixed(1).replace('.', ',') + ' km';
  }
  return Math.round(d) + ' m';
};

const NearbyAttractions = ({ latitude, longitude }) => {
  const [famousPlaces, setFamousPlaces] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!latitude || !longitude) return;

    const fetchPlaces = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = `
          [out:json][timeout:25];
          (
            node["tourism"](around:2500, ${latitude}, ${longitude});
            way["tourism"](around:2500, ${latitude}, ${longitude});
            node["historic"](around:2500, ${latitude}, ${longitude});
            way["historic"](around:2500, ${latitude}, ${longitude});
            
            node["amenity"~"marketplace|pharmacy"](around:1500, ${latitude}, ${longitude});
            node["leisure"~"fitness_centre|sports_centre"](around:1500, ${latitude}, ${longitude});
            node["shop"](around:1500, ${latitude}, ${longitude});
          );
          out center tags 40;
        `;
        
        const response = await fetch('https://overpass.openstreetmap.fr/api/interpreter', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: query
        });

        if (!response.ok) throw new Error('Overpass API failed');
        const data = await response.json();

        const processed = data.elements
          .filter(el => el.tags && el.tags.name)
          .map(el => {
            const lat = el.lat || el.center?.lat;
            const lon = el.lon || el.center?.lon;
            const dist = calculateDistance(latitude, longitude, lat, lon);
            return {
              id: el.id,
              name: el.tags.name,
              distance: dist,
              tags: el.tags,
              isFamous: !!(el.tags.tourism || el.tags.historic)
            };
          })
          .sort((a, b) => a.distance - b.distance);

        // Deduplicate by name (Overpass sometimes returns multiple nodes for same building)
        const uniquePlaces = [];
        const seenNames = new Set();
        for (const place of processed) {
          if (!seenNames.has(place.name)) {
            seenNames.add(place.name);
            uniquePlaces.push(place);
          }
        }

        const famous = uniquePlaces.filter(p => p.isFamous).slice(0, 10);
        const nearby = uniquePlaces.filter(p => !p.isFamous).slice(0, 10);

        setFamousPlaces(famous);
        setNearbyPlaces(nearby);

      } catch (err) {
        console.error(err);
        setError('Không thể tải dữ liệu địa điểm xung quanh');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [latitude, longitude]);

  if (!latitude || !longitude) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mt-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Đi đâu gần đây</h3>
      
      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 py-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang tìm kiếm các địa điểm lân cận...</span>
        </div>
      ) : error ? (
        <p className="text-red-500 py-4">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          {/* Famous */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              Các địa danh nổi tiếng
            </h4>
            <div className="space-y-4">
              {famousPlaces.length === 0 ? (
                <p className="text-sm text-gray-500">Không tìm thấy địa danh nào.</p>
              ) : (
                famousPlaces.map((place) => (
                  <div key={place.id} className="flex justify-between items-start group">
                    <div className="flex items-start gap-3">
                      <Building className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                      <span className="text-gray-700 text-sm group-hover:text-[#006CE4] transition-colors">{place.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 shrink-0 ml-4 pt-0.5">{formatDistance(place.distance)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Nearby */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              Các địa danh gần đây
            </h4>
            <div className="space-y-4">
              {nearbyPlaces.length === 0 ? (
                <p className="text-sm text-gray-500">Không tìm thấy tiện ích nào.</p>
              ) : (
                nearbyPlaces.map((place) => (
                  <div key={place.id} className="flex justify-between items-start group">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                      <span className="text-gray-700 text-sm group-hover:text-[#006CE4] transition-colors">{place.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 shrink-0 ml-4 pt-0.5">{formatDistance(place.distance)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbyAttractions;
