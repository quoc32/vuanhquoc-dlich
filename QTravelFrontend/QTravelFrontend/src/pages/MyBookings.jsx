import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Loader2, CheckCircle, Clock, Building } from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';
import useCurrencyStore from '../store/useCurrencyStore';

const MyBookings = () => {
  const [activeTab, setActiveTab] = useState('flights');
  const [flightOrders, setFlightOrders] = useState([]);
  const [hotelOrders, setHotelOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { formatPrice } = useCurrencyStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        if (activeTab === 'flights') {
          const res = await api.get('/users/orders');
          setFlightOrders(res.data.data || []);
        } else {
          const res = await api.get('/users/hotel-orders');
          setHotelOrders(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch orders', err);
        setError('Có lỗi xảy ra khi tải danh sách.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const renderFlightBookings = () => {
    if (flightOrders.length === 0) {
      return (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Bạn chưa có chuyến bay nào</h3>
          <p className="text-gray-500">Hãy tìm kiếm và đặt ngay một chuyến bay tuyệt vời nhé!</p>
        </div>
      );
    }
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
              <th className="px-6 py-4 font-medium whitespace-nowrap">Mã đặt chỗ</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">Hãng bay</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">Hành trình</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">Khởi hành</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">Tổng tiền</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">Trạng thái</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">Ngày đặt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {flightOrders.map((order) => {
              const details = order.details;
              if (!details) {
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{order.id}</td>
                    <td colSpan="6" className="px-6 py-4 text-sm text-gray-500">Đang lấy dữ liệu hoặc đơn hàng bị lỗi...</td>
                  </tr>
                );
              }
              const slice = details.slices?.[0];
              const segments = slice?.segments || [];
              const firstSeg = segments[0];
              const lastSeg = segments[segments.length - 1];

              return (
                <tr 
                  key={order.id} 
                  className="hover:bg-gray-50 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/my-bookings/${order.id}`)}
                >
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-800">{details.booking_reference || order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    {firstSeg ? (
                      <div className="flex items-center gap-2">
                        <img src={firstSeg.operating_carrier?.logo_symbol_url} alt="logo" className="w-6 h-6 object-contain" />
                        <span className="text-sm font-medium text-gray-700">{firstSeg.operating_carrier?.name}</span>
                      </div>
                    ) : '--'}
                  </td>
                  <td className="px-6 py-4">
                    {firstSeg && lastSeg ? (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="font-semibold">{firstSeg.origin?.iata_code}</span>
                        <Plane className="w-3 h-3 text-gray-400" />
                        <span className="font-semibold">{lastSeg.destination?.iata_code}</span>
                      </div>
                    ) : '--'}
                  </td>
                  <td className="px-6 py-4">
                    {firstSeg ? (
                      <div>
                        <p className="text-sm font-medium text-gray-800">{format(new Date(firstSeg.departing_at), 'HH:mm')}</p>
                        <p className="text-xs text-gray-500">{format(new Date(firstSeg.departing_at), 'dd/MM/yyyy')}</p>
                      </div>
                    ) : '--'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#e12d2d] whitespace-nowrap">
                      {formatPrice(details.total_amount, details.total_currency)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {order.paymentStatus === 'SUCCESS' ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-green-100 text-green-700">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Đã thanh toán
                      </div>
                    ) : order.paymentStatus === 'FAILED' ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-red-100 text-red-700">
                        <div className="w-3.5 h-3.5 flex items-center justify-center border-2 border-red-700 rounded-full text-[8px] font-bold">X</div>
                        Thất bại / Đã hủy
                      </div>
                    ) : order.paymentStatus === 'REFUNDED' ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-purple-100 text-purple-700">
                        <div className="w-3.5 h-3.5 flex items-center justify-center border-2 border-purple-700 rounded-full text-[8px] font-bold">R</div>
                        Đã hoàn tiền
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-orange-100 text-orange-700">
                        <Clock className="w-3.5 h-3.5" />
                        Chờ thanh toán
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {format(new Date(order.createdAt), 'dd/MM/yy HH:mm')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderHotelBookings = () => {
    if (hotelOrders.length === 0) {
      return (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Bạn chưa có đơn đặt phòng nào</h3>
          <p className="text-gray-500">Các phòng bạn đặt từ khách sạn đối tác sẽ hiển thị tại đây.</p>
        </div>
      );
    }
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
              <th className="px-6 py-4 font-medium whitespace-nowrap">Mã đặt phòng</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">Khách sạn</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">Loại phòng</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">Ngày nhận/trả</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">Tổng tiền</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">Trạng thái</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">Ngày đặt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {hotelOrders.map((order) => {
              return (
                <tr 
                  key={order.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/my-bookings/hotel/${order.id}`)}
                >
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-800">{order.bookingReference || order.id.substring(0,8)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-700">{order.hotelName || order.hotelId}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {order.roomType || '--'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {order.checkIn ? format(new Date(order.checkIn), 'dd/MM/yy') : '--'} 
                    {' - '} 
                    {order.checkOut ? format(new Date(order.checkOut), 'dd/MM/yy') : '--'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#e12d2d] whitespace-nowrap">
                      {formatPrice(order.totalAmount || 0, 'VND')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-green-100 text-green-700">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {order.status || 'Thành công'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {format(new Date(order.createdAt), 'dd/MM/yy HH:mm')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-[#f5f7fa] flex-1 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Quản lý Đặt chỗ</h1>
        
        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            className={`py-3 px-6 font-semibold text-lg flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'flights' ? 'border-[#006CE4] text-[#006CE4]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('flights')}
          >
            <Plane className="w-5 h-5" />
            Chuyến bay
          </button>
          <button
            className={`py-3 px-6 font-semibold text-lg flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'hotels' ? 'border-[#006CE4] text-[#006CE4]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('hotels')}
          >
            <Building className="w-5 h-5" />
            Khách sạn
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#006CE4]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100">
            {error}
          </div>
        ) : (
          activeTab === 'flights' ? renderFlightBookings() : renderHotelBookings()
        )}
      </div>
    </div>
  );
};

export default MyBookings;
