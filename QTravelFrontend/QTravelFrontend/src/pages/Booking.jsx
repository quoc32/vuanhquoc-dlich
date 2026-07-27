import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema } from '../schemas/bookingSchema';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import useCurrencyStore from '../store/useCurrencyStore';
import { Loader2, ShieldCheck, CreditCard } from 'lucide-react';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const offerId = searchParams.get('offer_id');
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { formatPrice } = useCurrencyStore();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      passengers: [{ title: 'mr', gender: 'm', email: user?.email || '' }],
      payment_method: 'balance'
    }
  });

  const { fields } = useFieldArray({
    control,
    name: "passengers",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOfferDetails = async () => {
      try {
        const res = await api.get(`/flights/offers/${offerId}`);
        setOffer(res.data.data);
      } catch (err) {
        setError('Failed to load offer details.');
      } finally {
        setLoading(false);
      }
    };

    if (offerId) {
      fetchOfferDetails();
    }
  }, [offerId, isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setBookingLoading(true);
    try {
      // 1. Create order
      const orderReq = {
        data: {
          type: "hold",
          selected_offers: [offerId],
          passengers: data.passengers.map((p, i) => ({
            id: offer.passengers[i].id,
            ...p
          }))
        }
      };
      const orderRes = await api.post('/flights/orders', orderReq);
      const orderId = orderRes.data.data.id;

      // 2. Payment
      if (data.payment_method === 'balance') {
        await api.post('/flights/payments', {
          data: {
            order_id: orderId,
            payment: {
              type: "balance",
              currency: offer.base_currency,
              amount: offer.total_amount
            }
          }
        });
        alert('Booking successful using Balance!');
        navigate('/');
      } else if (data.payment_method.startsWith('momo_')) {
        const requestType = data.payment_method.replace('momo_', '');
        const momoRes = await api.post('/momo/create', {
          orderId: orderId,
          requestType: requestType
        });
        window.location.href = momoRes.data.payUrl;
      }

    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (error || !offer) {
    return <div className="text-center py-20 text-red-500">{error || 'Offer not found'}</div>;
  }

  return (
    <div className="bg-gray-50 flex-1 py-10">
      <div className="container mx-auto px-4 max-w-6xl flex flex-col lg:flex-row gap-8">
        
        {/* Form section */}
        <div className="lg:w-2/3 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Passenger Details</h2>
          
          <form id="booking-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg mb-4 text-primary border-b pb-2">Passenger {index + 1}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <select {...register(`passengers.${index}.title`)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary">
                      <option value="mr">Mr</option>
                      <option value="ms">Ms</option>
                      <option value="mrs">Mrs</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select {...register(`passengers.${index}.gender`)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary">
                      <option value="m">Male</option>
                      <option value="f">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Given Name</label>
                    <input type="text" {...register(`passengers.${index}.given_name`)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                    {errors?.passengers?.[index]?.given_name && <p className="text-red-500 text-xs mt-1">{errors.passengers[index].given_name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Family Name</label>
                    <input type="text" {...register(`passengers.${index}.family_name`)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                    {errors?.passengers?.[index]?.family_name && <p className="text-red-500 text-xs mt-1">{errors.passengers[index].family_name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Date of Birth</label>
                    <input type="date" {...register(`passengers.${index}.born_on`)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                    {errors?.passengers?.[index]?.born_on && <p className="text-red-500 text-xs mt-1">{errors.passengers[index].born_on.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" {...register(`passengers.${index}.email`)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                    {errors?.passengers?.[index]?.email && <p className="text-red-500 text-xs mt-1">{errors.passengers[index].email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <input type="text" {...register(`passengers.${index}.phone_number`)} placeholder="+84901234567" className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                    {errors?.passengers?.[index]?.phone_number && <p className="text-red-500 text-xs mt-1">{errors.passengers[index].phone_number.message}</p>}
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
              <h3 className="font-bold text-lg mb-4 text-gray-900 border-b pb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Payment Method
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="radio" value="balance" {...register("payment_method")} className="w-4 h-4 text-primary" />
                  <span className="font-medium">QTravel Balance</span>
                </label>
                
                <h4 className="text-sm font-semibold text-gray-500 uppercase mt-4 mb-2">MoMo Wallet Options</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="radio" value="momo_captureWallet" {...register("payment_method")} className="w-4 h-4 text-pink-500" />
                    <span className="font-medium text-pink-600 text-sm">MoMo App (QR Code)</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="radio" value="momo_payWithMethod" {...register("payment_method")} className="w-4 h-4 text-pink-500" />
                    <span className="font-medium text-pink-600 text-sm">MoMo (Default)</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="radio" value="momo_payWithATM" {...register("payment_method")} className="w-4 h-4 text-pink-500" />
                    <span className="font-medium text-pink-600 text-sm">ATM Card</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="radio" value="momo_payWithCC" {...register("payment_method")} className="w-4 h-4 text-pink-500" />
                    <span className="font-medium text-pink-600 text-sm">Credit Card</span>
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Summary side */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
            <h3 className="font-bold text-lg mb-4 text-gray-900 border-b pb-2">Flight Summary</h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-medium">{offer.slices[0].segments[0].origin.iata_code}</span>
                <span className="text-gray-400">→</span>
                <span className="text-gray-600 font-medium">{offer.slices[0].segments[0].destination.iata_code}</span>
              </div>
              <p className="text-sm text-gray-500">{offer.owner.name}</p>
            </div>
            
            <div className="border-t border-gray-100 py-4 mb-4">
              <div className="flex justify-between text-gray-700 mb-3">
                <span>Giá vé cơ bản</span>
                <span className="font-medium">{formatPrice(offer.base_amount, offer.base_currency)}</span>
              </div>
              <div className="flex justify-between text-gray-700 mb-6">
                <span>Thuế & Phí</span>
                <span className="font-medium">{formatPrice(offer.tax_amount, offer.tax_currency || offer.base_currency)}</span>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-gray-800">Tổng cộng</span>
                  <span className="font-bold text-2xl text-primary">{formatPrice(offer.total_amount, offer.total_currency || offer.base_currency)}</span>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              form="booking-form"
              disabled={bookingLoading}
              className="w-full bg-primary hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {bookingLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              <span>{bookingLoading ? 'Processing...' : 'Confirm & Pay'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Booking;
