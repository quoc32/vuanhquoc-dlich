import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Building, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';
import useCurrencyStore from '../store/useCurrencyStore';

const MyHotelBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { formatPrice } = useCurrencyStore();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/users/hotel-orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        console.error('Failed to fetch order detail', err);
        setError('Không tìm thấy thông tin đơn đặt phòng.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-32 bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#006CE4]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 bg-gray-50">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 mb-4">
          {error}
        </div>
        <button 
          onClick={() => navigate('/my-bookings')}
          className="text-[#006CE4] hover:underline flex items-center gap-2 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f7fa] flex-1 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <button 
          onClick={() => navigate('/my-bookings')}
          className="text-[#006CE4] hover:underline flex items-center gap-2 font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#003b95] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Chi tiết đặt phòng</h1>
              <p className="text-blue-100 flex items-center gap-2">
                Mã đặt phòng: <span className="font-bold bg-white/20 px-2 py-0.5 rounded text-white">{order.bookingReference || order.id.substring(0,8)}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-lg border border-green-400/30">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span className="font-semibold text-green-100">{order.status || 'Thành công'}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Hotel Info */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#006CE4]" /> Thông tin khách sạn
              </h2>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="font-semibold text-gray-800 text-xl">{order.hotelName || order.hotelId}</p>
                <p className="text-gray-500 mt-1">Loại phòng: <span className="font-medium text-gray-700">{order.roomType || 'Chưa xác định'}</span></p>
              </div>
            </div>

            {/* Dates */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#006CE4]" /> Thời gian
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-600 mb-1 font-medium">Nhận phòng (Check-in)</p>
                  <p className="font-bold text-gray-800 text-lg">
                    {order.checkIn ? format(new Date(order.checkIn), 'dd/MM/yyyy') : '--'}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-600 mb-1 font-medium">Trả phòng (Check-out)</p>
                  <p className="font-bold text-gray-800 text-lg">
                    {order.checkOut ? format(new Date(order.checkOut), 'dd/MM/yyyy') : '--'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Chi tiết thanh toán</h2>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="font-medium text-gray-600">Tổng tiền đã thanh toán</span>
                <span className="text-2xl font-bold text-[#e12d2d]">{formatPrice(order.totalAmount || 0, 'VND')}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">Giao dịch được xử lý bởi khách sạn {order.hotelName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyHotelBookingDetail;
