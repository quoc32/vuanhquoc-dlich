import { useEffect, useState } from 'react';
import api from '../services/api';

const AirlinesPage = () => {
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        const response = await api.get('/flights/airlines');
        // Duffel airlines API response structure handle
        const airlineData = response.data?.data || response.data || [];
        setAirlines(Array.isArray(airlineData) ? airlineData : []);
      } catch (err) {
        setError(err.message || 'Có lỗi xảy ra khi lấy danh sách hãng hàng không');
      } finally {
        setLoading(false);
      }
    };

    fetchAirlines();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Đang tải danh sách các hãng hàng không...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block mb-4">
          <p>{error}</p>
        </div>
        <div>
          <button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="bg-blue-600 text-white py-12 mb-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Các Hãng Hàng Không Đối Tác</h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg">
            Khám phá danh sách các hãng hàng không uy tín đồng hành cùng QTravel trên mọi hành trình của bạn.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {airlines.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white rounded-xl shadow-sm">
            Không tìm thấy dữ liệu hãng hàng không.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {airlines.map((airline) => (
              <div 
                key={airline.id} 
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="w-20 h-20 mb-4 flex items-center justify-center bg-gray-50 rounded-full p-3 group-hover:scale-110 transition-transform duration-300">
                  {airline.logo_symbol_url ? (
                    <img 
                      src={airline.logo_symbol_url} 
                      alt={airline.name} 
                      className="w-full h-full object-contain drop-shadow-sm"
                    />
                  ) : (
                    <span className="text-xl font-bold text-gray-400">{airline.iata_code || '✈'}</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800 line-clamp-2 min-h-[3rem] group-hover:text-blue-600 transition-colors">
                  {airline.name}
                </h3>
                <div className="mt-auto pt-4">
                  <span className="inline-block bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium">
                    IATA: {airline.iata_code || 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AirlinesPage;
