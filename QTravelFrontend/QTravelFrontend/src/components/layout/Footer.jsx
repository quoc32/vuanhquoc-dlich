import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-lg text-gray-900 mb-4">QTravel</h3>
          <p className="text-gray-500 text-sm">Your trusted partner for flight bookings and travel experiences worldwide.</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">About Us</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-primary">Our Story</a></li>
            <li><Link to="/airlines" className="hover:text-primary">Các hãng hàng không</Link></li>
            <li><a href="#" className="hover:text-primary">Careers</a></li>
            <li><a href="#" className="hover:text-primary">Press</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Help</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-primary">Support</a></li>
            <li><a href="#" className="hover:text-primary">Cancel your bookings</a></li>
            <li><a href="#" className="hover:text-primary">Refund Policies</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
            <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} QTravel. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
