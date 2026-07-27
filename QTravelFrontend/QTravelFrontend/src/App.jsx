import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchResults from './pages/SearchResults';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';
import MyBookingDetail from './pages/MyBookingDetail';
import Hotels from './pages/Hotels';
import HotelSearchResults from './pages/HotelSearchResults';
import HotelDetails from './pages/HotelDetails';
import useCurrencyStore from './store/useCurrencyStore';

function App() {
  const fetchRates = useCurrencyStore((state) => state.fetchRates);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="booking" element={<Booking />} />
          <Route path="profile" element={<Profile />} />
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="my-bookings/:id" element={<MyBookingDetail />} />
          <Route path="hotels" element={<Hotels />} />
          <Route path="hotels/search" element={<HotelSearchResults />} />
          <Route path="hotels/:id" element={<HotelDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
