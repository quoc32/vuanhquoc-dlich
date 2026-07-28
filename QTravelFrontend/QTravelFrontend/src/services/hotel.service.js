import api from './api';

const hotelService = {
  searchCities: async (query) => {
    try {
      const response = await api.get(`/hotels/cities/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching cities:', error);
      throw error;
    }
  },

  getTopDestinations: async () => {
    try {
      const response = await api.get('/hotels/destinations/top');
      return response.data;
    } catch (error) {
      console.error('Error getting top destinations:', error);
      throw error;
    }
  },

  searchHotels: async (params) => {
    try {
      const response = await api.get('/hotels/', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching hotels:', error);
      throw error;
    }
  },

  getHotelById: async (id) => {
    try {
      const response = await api.get(`/hotels/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting hotel details:', error);
      throw error;
    }
  },

  getHotelReviews: async (id) => {
    try {
      const response = await api.get(`/hotels/${id}/reviews`);
      return response.data;
    } catch (error) {
      console.error('Error getting hotel reviews:', error);
      throw error;
    }
  },

  addHotelReview: async (id, formData) => {
    try {
      // Send as multipart/form-data
      const response = await api.post(`/hotels/${id}/reviews`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding hotel review:', error);
      throw error;
    }
  },

  updateHotelReview: async (id, reviewId, comment) => {
    try {
      const response = await api.put(`/hotels/${id}/reviews/${reviewId}`, { comment });
      return response.data;
    } catch (error) {
      console.error('Error updating hotel review:', error);
      throw error;
    }
  },

  deleteHotelReview: async (id, reviewId) => {
    try {
      const response = await api.delete(`/hotels/${id}/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting hotel review:', error);
      throw error;
    }
  }
};

export default hotelService;
