import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';

const customIcon = L.divIcon({
  html: ReactDOMServer.renderToString(
    <div className="text-red-500" style={{ transform: 'translate(-50%, -100%)' }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#ef4444" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
      </svg>
    </div>
  ),
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const HotelMap = ({ latitude, longitude, hotelName }) => {
  if (!latitude || !longitude) return null;

  const position = [latitude, longitude];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6 z-0">
      <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#006CE4]" /> Vị trí khách sạn
        </h3>
      </div>
      <div className="h-[250px] w-full relative" style={{ zIndex: 1 }}>
        <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 1 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={customIcon}>
            <Popup>
              <strong>{hotelName}</strong>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      <div className="p-4 bg-gray-50 flex items-center justify-center border-t border-gray-100">
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#006CE4] font-medium text-sm hover:underline"
        >
          Hiển thị trên bản đồ lớn
        </a>
      </div>
    </div>
  );
};

export default HotelMap;
