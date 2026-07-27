import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plane, Loader2, Calendar, MapPin, CheckCircle, Clock,
  ArrowLeft, User, CreditCard, BaggageClaim, AlertCircle,
  Briefcase, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';
import useCurrencyStore from '../store/useCurrencyStore';

const formatDuration = (isoDuration) => {
  if (!isoDuration) return '';
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?/);
  const hours = match?.[1] ? match[1].replace('H', '') : '0';
  const mins = match?.[2] ? match[2].replace('M', '') : '0';
  if (hours === '0') return `${mins}ph`;
  if (mins === '0') return `${hours}g`;
  return `${hours}g ${mins}ph`;
};

const MyBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { formatPrice } = useCurrencyStore();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/users/orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        console.error('Failed to fetch order', err);
        setError('Có lỗi xảy ra khi tải thông tin chuyến bay.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-32 bg-[#f5f7fa]">
        <Loader2 className="w-10 h-10 animate-spin text-[#006CE4]" />
      </div>
    );
  }

  if (error || !order || !order.details) {
    return (
      <div className="bg-[#f5f7fa] flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Không tìm thấy chuyến bay'}</h2>
          <button 
            onClick={() => navigate('/my-bookings')}
            className="px-6 py-2 bg-[#006CE4] text-white rounded-lg hover:bg-blue-700 transition"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const { details, paymentStatus } = order;

  return (
    <div className="bg-[#f5f7fa] flex-1 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/my-bookings')}
              className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Chi tiết chuyến bay
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Mã đặt chỗ (PNR): <span className="font-bold text-gray-800">{details.booking_reference || order.id}</span>
              </p>
              {details.documents && details.documents.length > 0 && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Số vé điện tử (E-Ticket): <span className="font-bold text-gray-800">{details.documents.map(d => d.unique_identifier).join(', ')}</span>
                </p>
              )}
            </div>
          </div>
          
          <div>
            {paymentStatus === 'SUCCESS' ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                <CheckCircle className="w-4 h-4" />
                Đã thanh toán
              </div>
            ) : paymentStatus === 'FAILED' ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                <AlertCircle className="w-4 h-4" />
                Thất bại / Đã hủy
              </div>
            ) : paymentStatus === 'REFUNDED' ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 text-purple-700">
                <AlertCircle className="w-4 h-4" />
                Đã hoàn tiền
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-orange-100 text-orange-700">
                <Clock className="w-4 h-4" />
                Chờ thanh toán
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Itinerary */}
          <div className="lg:col-span-2 space-y-6">
            {details.slices?.map((slice, sliceIdx) => {
              const segments = slice.segments || [];
              const firstSeg = segments[0];
              const lastSeg = segments[segments.length - 1];
              
              return (
                <div key={sliceIdx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#006CE4]">
                        <Plane className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">
                          {firstSeg?.origin?.city_name || firstSeg?.origin?.iata_code} 
                          <span className="mx-2 text-gray-400">→</span> 
                          {lastSeg?.destination?.city_name || lastSeg?.destination?.iata_code}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {firstSeg && format(new Date(firstSeg.departing_at), 'dd/MM/yyyy')}
                          <span className="text-gray-300">•</span>
                          <Clock className="w-3.5 h-3.5" />
                          {formatDuration(slice.duration)}
                          {slice.fare_brand_name && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="font-medium text-[#006CE4] bg-blue-50 px-2 py-0.5 rounded-full">{slice.fare_brand_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-8">
                      {segments.map((segment, segIdx) => (
                        <div key={segIdx} className="flex gap-6">
                          {/* Timeline Column */}
                          <div className="flex flex-col items-center relative w-4 shrink-0">
                            {/* Departure Dot */}
                            <div className="w-4 h-4 bg-white border-[3px] border-[#006CE4] rounded-full z-10 mt-1 shrink-0" />
                            {/* Vertical Line */}
                            <div className="w-0.5 bg-gray-200 flex-1 my-1" />
                            {/* Arrival Dot */}
                            <div className="w-4 h-4 bg-white border-[3px] border-gray-300 rounded-full z-10 mb-1 shrink-0" />
                          </div>
                          
                          {/* Content Column */}
                          <div className="flex-1 pb-4 pt-1">
                            {/* Khởi hành */}
                            <div className="flex gap-4">
                              <div className="w-16 shrink-0">
                                <div className="font-bold text-xl text-gray-800">{format(new Date(segment.departing_at), 'HH:mm')}</div>
                                <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-center mt-1 w-fit">{segment.origin?.iata_code}</div>
                              </div>
                              <div>
                                <div className="font-bold text-gray-800 text-lg leading-none mb-1.5">{segment.origin?.name}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                  <span>Khởi hành</span>
                                  {segment.origin_terminal && (
                                    <>
                                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                      <span className="text-[#006CE4] font-medium">Sảnh (Terminal) {segment.origin_terminal}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Thông tin chuyến bay & Hãng */}
                            <div className="flex flex-col md:flex-row md:items-center gap-4 my-6 py-4 border-y border-dashed border-gray-200 bg-gray-50/50 -mx-4 px-4 rounded-xl">
                              <div className="flex gap-3 items-center w-full md:w-1/2">
                                <img src={segment.operating_carrier?.logo_symbol_url} alt="airline" className="w-10 h-10 object-contain bg-white border border-gray-100 rounded-lg p-1 shadow-sm" />
                                <div className="text-sm">
                                  <p className="font-bold text-gray-800">{segment.operating_carrier?.name}</p>
                                  <p className="text-gray-500 font-medium">Chuyến bay: <span className="text-gray-700">{segment.operating_carrier?.iata_code} {segment.operating_carrier_flight_number}</span></p>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 w-full md:w-1/2">
                                {segment.aircraft?.name && (
                                  <div className="flex items-center gap-1.5 w-full"><Plane className="w-4 h-4 text-gray-400" /> Tàu bay: <span className="font-medium text-gray-700">{segment.aircraft.name}</span></div>
                                )}
                                {segment.passengers?.[0]?.cabin_class && (
                                  <div className="flex items-center gap-1.5"><User className="w-4 h-4 text-gray-400" /> Hạng: <span className="font-medium text-gray-700 capitalize">{segment.passengers[0].cabin_class_marketing_name || segment.passengers[0].cabin_class}</span></div>
                                )}
                                {segment.duration && (
                                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> Bay: <span className="font-medium text-gray-700">{formatDuration(segment.duration)}</span></div>
                                )}
                                {(() => {
                                  const baggages = segment.passengers?.[0]?.baggages || [];
                                  const checkedBags = baggages.filter(b => b.type === 'checked').reduce((sum, b) => sum + b.quantity, 0);
                                  const carryOnBags = baggages.filter(b => b.type === 'carry_on').reduce((sum, b) => sum + b.quantity, 0);
                                  return (
                                    <>
                                      {checkedBags > 0 && <div className="flex items-center gap-1.5"><BaggageClaim className="w-4 h-4 text-gray-400" /> Ký gửi: <span className="font-medium text-gray-700">{checkedBags} kiện</span></div>}
                                      {carryOnBags > 0 && <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-gray-400" /> Xách tay: <span className="font-medium text-gray-700">{carryOnBags} kiện</span></div>}
                                    </>
                                  );
                                })()}
                              </div>
                            </div>

                            {/* Đến nơi */}
                            <div className="flex gap-4">
                              <div className="w-16 shrink-0">
                                <div className="font-bold text-xl text-gray-800">{format(new Date(segment.arriving_at), 'HH:mm')}</div>
                                <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-center mt-1 w-fit">{segment.destination?.iata_code}</div>
                              </div>
                              <div>
                                <div className="font-bold text-gray-800 text-lg leading-none mb-1.5">{segment.destination?.name}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                  <span>Đến nơi</span>
                                  {segment.destination_terminal && (
                                    <>
                                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                      <span className="text-[#006CE4] font-medium">Sảnh (Terminal) {segment.destination_terminal}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Passengers & Pricing */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#006CE4]" />
                Hành khách
              </h3>
              <div className="space-y-3">
                {details.passengers?.map((p) => (
                  <div key={p.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                      {p.given_name?.[0] || 'P'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {p.title ? `${p.title}. ` : ''}{p.given_name} {p.family_name}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">{p.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#006CE4]" />
                Chi tiết thanh toán
              </h3>
              
              <div className="space-y-3 mb-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Giá vé cơ bản</span>
                  <span>
                    {formatPrice(details.base_amount, details.base_currency)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Thuế & Phí</span>
                  <span>
                    {formatPrice(details.tax_amount, details.tax_currency)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Tổng cộng</span>
                  <span className="text-xl font-bold text-[#e12d2d]">
                    {formatPrice(details.total_amount, details.total_currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookingDetail;
