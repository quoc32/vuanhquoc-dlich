import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, MapPin, Star, ChevronLeft, ChevronRight, Check, Image as ImageIcon, Trash2, Edit2, X } from 'lucide-react';
import hotelService from '../services/hotel.service';
import useCurrencyStore from '../store/useCurrencyStore';
import useAuthStore from '../store/useAuthStore';
import NearbyAttractions from '../features/hotels/NearbyAttractions';
import HotelMap from '../features/hotels/HotelMap';

const BACKEND_URL = 'http://localhost:3000';

const HotelDetails = () => {
  const { id } = useParams();
  const { formatPrice } = useCurrencyStore();
  const { user } = useAuthStore();

  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Review states
  const [newReview, setNewReview] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const fileInputRef = useRef(null);

  // Edit states
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewText, setEditReviewText] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const hotelData = await hotelService.getHotelById(id);
        const reviewsData = await hotelService.getHotelReviews(id);
        setHotel(hotelData?.data);
        setReviews(reviewsData?.data || []);
      } catch (err) {
        console.error('Failed to fetch hotel details:', err);
        setError('Không thể tải chi tiết khách sạn.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + hotel.images.length) % hotel.images.length);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length);
  };

  const handleImageSelect = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (selectedImages.length + filesArray.length > 5) {
        alert('Bạn chỉ được chọn tối đa 5 ảnh.');
        return;
      }
      setSelectedImages((prev) => [...prev, ...filesArray]);
    }
  };

  const removeSelectedImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    setSubmittingReview(true);
    try {
      const formData = new FormData();
      formData.append('comment', newReview);
      selectedImages.forEach((img) => {
        formData.append('images', img);
      });

      await hotelService.addHotelReview(id, formData);
      
      // Reset form
      setNewReview('');
      setSelectedImages([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Refresh reviews
      const reviewsData = await hotelService.getHotelReviews(id);
      setReviews(reviewsData?.data || []);
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Đã xảy ra lỗi khi gửi đánh giá.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditClick = (review) => {
    setEditingReviewId(review.id);
    setEditReviewText(review.comment);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditReviewText('');
  };

  const handleUpdateReview = async (reviewId) => {
    if (!editReviewText.trim()) return;
    try {
      await hotelService.updateHotelReview(id, reviewId, editReviewText);
      setEditingReviewId(null);
      setEditReviewText('');
      const reviewsData = await hotelService.getHotelReviews(id);
      setReviews(reviewsData?.data || []);
    } catch (err) {
      console.error('Failed to update review', err);
      alert('Đã xảy ra lỗi khi cập nhật đánh giá.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    try {
      await hotelService.deleteHotelReview(id, reviewId);
      const reviewsData = await hotelService.getHotelReviews(id);
      setReviews(reviewsData?.data || []);
    } catch (err) {
      console.error('Failed to delete review', err);
      alert('Đã xảy ra lỗi khi xóa đánh giá.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-[#006CE4] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tải thông tin khách sạn...</p>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
          <p className="text-red-500 mb-4">{error || 'Không tìm thấy khách sạn'}</p>
        </div>
      </div>
    );
  }

  const defaultImage = 'https://static.vecteezy.com/system/resources/previews/019/520/917/original/failed-to-load-page-concept-illustration-flat-design-eps10-modern-graphic-element-for-landing-page-empty-state-ui-infographic-icon-vector.jpg';
  const images = hotel.images && hotel.images.length > 0 ? hotel.images : [{ url: defaultImage }];
  const mainImage = images[currentImageIndex]?.url || defaultImage;

  // Handle amenities
  const amenitiesList = Array.isArray(hotel.amenities) ? hotel.amenities : 
                       (typeof hotel.amenities === 'string' ? JSON.parse(hotel.amenities) : []);

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Header Info */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {hotel.address}{hotel.city ? `, ${hotel.city.cityName}` : ''}
                </span>
                {hotel.overallRating && (
                  <span className="flex items-center gap-1 font-bold text-gray-900 bg-yellow-100 px-2 py-0.5 rounded">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {hotel.overallRating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <p className="text-sm text-gray-500 mb-1">Giá mỗi đêm từ</p>
              <p className="text-3xl font-black text-[#006CE4]">{formatPrice(hotel.ratePerNight, 'VND')}</p>
              {hotel.link && (
                <a 
                  href={hotel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 bg-[#006CE4] hover:bg-[#0057b8] text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-sm inline-block"
                >
                  Đặt ngay
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content (Images + Amenities) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <div className="relative h-96 w-full rounded-xl overflow-hidden bg-gray-100 group">
                <img 
                  src={mainImage} 
                  alt={hotel.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.src = defaultImage; }}
                />
                
                {images.length > 1 && (
                  <>
                    <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-6 h-6 text-gray-800" />
                    </button>
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
              
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                  {images.map((img, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-[#006CE4] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img 
                        src={img.url} 
                        className="w-full h-full object-cover" 
                        alt="thumbnail" 
                        onError={(e) => { e.target.src = defaultImage; }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {hotel.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Mô tả</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{hotel.description}</p>
              </div>
            )}

            {/* Amenities */}
            {amenitiesList.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Tiện nghi và cơ sở vật chất</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                  {amenitiesList.map((amenity, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-gray-700">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Attractions */}
            {hotel.latitude && hotel.longitude && (
              <NearbyAttractions latitude={hotel.latitude} longitude={hotel.longitude} />
            )}
          </div>

          {/* Sidebar (Map + Reviews) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Interactive Mini Map */}
            {hotel.latitude && hotel.longitude && (
              <HotelMap 
                latitude={hotel.latitude} 
                longitude={hotel.longitude} 
                hotelName={hotel.name} 
              />
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Đánh giá từ người dùng</h3>
                <p className="text-sm text-gray-500 mt-1">{reviews.length} đánh giá</p>
              </div>
              
              <div className="p-5 max-h-[500px] overflow-y-auto custom-scrollbar">
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 italic">Chưa có đánh giá nào cho khách sạn này.</p>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => {
                      let reviewImages = [];
                      try {
                        reviewImages = typeof review.images === 'string' ? JSON.parse(review.images) : review.images || [];
                      } catch(e) { /* ignore */ }

                      return (
                        <div key={review.id} className="border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#006CE4] text-white flex items-center justify-center font-bold text-lg">
                                {review.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{review.user?.fullName || 'Người dùng ẩn danh'}</p>
                                <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                              </div>
                            </div>
                            
                            {/* Edit/Delete Buttons */}
                            {user && user.id === review.userId && (
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleEditClick(review)} className="text-gray-400 hover:text-[#006CE4] transition-colors" title="Sửa">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteReview(review.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Xóa">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {editingReviewId === review.id ? (
                            <div className="mt-3 space-y-2">
                              <textarea 
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#006CE4] outline-none"
                                rows="3"
                                value={editReviewText}
                                onChange={(e) => setEditReviewText(e.target.value)}
                              />
                              <div className="flex gap-2 justify-end">
                                <button onClick={handleCancelEdit} className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md">Hủy</button>
                                <button onClick={() => handleUpdateReview(review.id)} className="px-3 py-1 text-sm bg-[#006CE4] text-white hover:bg-[#0057b8] rounded-md">Lưu</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-gray-700 text-sm mt-1">{review.comment}</p>
                              
                              {/* Display review images */}
                              {reviewImages && reviewImages.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {reviewImages.map((imgUrl, i) => (
                                    <div key={i} className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer">
                                      <img 
                                        src={`${BACKEND_URL}${imgUrl}`} 
                                        className="w-full h-full object-cover" 
                                        alt="review-img"
                                        onError={(e) => { e.target.src = defaultImage; }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="p-5 border-t border-gray-100 bg-gray-50">
                {user ? (
                  <form onSubmit={submitReview}>
                    <textarea 
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#006CE4] focus:border-transparent outline-none resize-none mb-2"
                      rows="3"
                      placeholder="Chia sẻ trải nghiệm của bạn..."
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      required
                    ></textarea>
                    
                    {/* Image Previews */}
                    {selectedImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedImages.map((img, idx) => (
                          <div key={idx} className="relative w-14 h-14 rounded-md overflow-hidden border border-gray-200">
                            <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => removeSelectedImage(idx)}
                              className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-black"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                      />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors"
                        title="Thêm ảnh"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button 
                        type="submit" 
                        disabled={submittingReview || !newReview.trim()}
                        className="flex-grow bg-[#006CE4] hover:bg-[#0057b8] disabled:bg-gray-400 text-white py-2 rounded-lg font-medium transition-colors"
                      >
                        {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-3">Bạn cần đăng nhập để gửi đánh giá</p>
                    <a href="/login" className="text-[#006CE4] font-semibold hover:underline">Đăng nhập ngay</a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
