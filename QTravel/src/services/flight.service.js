const prisma = require('../config/db');
const qstashClient = require('../config/qstash');

const baseUrl = process.env.DUFFEL_API_URL || 'https://api.duffel.com';

const getHeaders = () => {
  return {
    'Authorization': `Bearer ${process.env.DUFFEL_API_TOKEN}`,
    'Duffel-Version': 'v2',
    'Content-Type': 'application/json',
  };
};

class FlightService {
  // 1. PLACES & AIRPORTS
  static async listAirports(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${baseUrl}/air/airports${query ? `?${query}` : ''}`;
    const response = await fetch(url, { headers: getHeaders() });
    return response.json();
  }

  static async searchPlaces(query) {
    const response = await fetch(`${baseUrl}/places/suggestions?query=${encodeURIComponent(query)}`, {
      headers: getHeaders()
    });
    return response.json();
  }

  // 2. FLIGHT SEARCH
  static async createOfferRequest(data, returnOffers = false) {
    const response = await fetch(`${baseUrl}/air/offer_requests?return_offers=${returnOffers}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ data })
    });
    return response.json();
  }

  static async listOffers(offerRequestId, params = {}) {
    const query = new URLSearchParams({ offer_request_id: offerRequestId, ...params }).toString();
    const response = await fetch(`${baseUrl}/air/offers?${query}`, { headers: getHeaders() });
    return response.json();
  }

  static async getOffer(offerId) {
    const response = await fetch(`${baseUrl}/air/offers/${offerId}`, { headers: getHeaders() });
    return response.json();
  }

  static async getSeatMaps(offerId) {
    const response = await fetch(`${baseUrl}/air/seat_maps?offer_id=${offerId}`, { headers: getHeaders() });
    return response.json();
  }

  // 3. BOOKING
  static async createOrder(data, userId = null) {
    const response = await fetch(`${baseUrl}/air/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ data })
    });
    const responseData = await response.json();

    // Nếu request thành công và trả về data (order)
    if (responseData.data && responseData.data.id) {
      await prisma.flightOrder.create({
        data: {
          id: responseData.data.id,
          userId: userId ? parseInt(userId, 10) : null,
        }
      });
    }

    return responseData;
  }

  static async getOrder(orderId) {
    const response = await fetch(`${baseUrl}/air/orders/${orderId}`, { headers: getHeaders() });
    return response.json();
  }

  static async listOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${baseUrl}/air/orders${query ? `?${query}` : ''}`, { headers: getHeaders() });
    return response.json();
  }

  // 4. REFERENCE DATA
  static async listAirlines(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${baseUrl}/air/airlines${query ? `?${query}` : ''}`, { headers: getHeaders() });
    return response.json();
  }

  static async listAircrafts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${baseUrl}/air/aircraft${query ? `?${query}` : ''}`, { headers: getHeaders() });
    return response.json();
  }

  // 5. PAYMENTS
  static async payForOrder(data) {
    if (qstashClient) {
      const response = await qstashClient.publish({
        url: `${baseUrl}/air/payments`,
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ data })
      });
      return response;
    }

    // Nếu QStash không có thì gọi trực tiếp đến API của Duffel
    const response = await fetch(`${baseUrl}/air/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ data })
    });
    return response.json();
  }

  static async createPaymentSession(data) {
    const response = await fetch(`${baseUrl}/links/sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ data })
    });
    return response.json();
  }
}

module.exports = FlightService;
