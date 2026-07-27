import { useState } from 'react';
import { X, Globe } from 'lucide-react';
import useCurrencyStore from '../../store/useCurrencyStore';

const SettingsModal = ({ isOpen, onClose }) => {
  const { targetCurrency, setTargetCurrency, supportedCurrencies } = useCurrencyStore();
  const [selectedCurrency, setSelectedCurrency] = useState(targetCurrency);

  if (!isOpen) return null;

  const handleSave = () => {
    setTargetCurrency(selectedCurrency);
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Cài đặt hiển thị</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Globe className="w-4 h-4 text-primary" />
                Đơn vị tiền tệ hiển thị
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {supportedCurrencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setSelectedCurrency(c.code)}
                    className={`flex items-center justify-between px-4 py-3 border rounded-xl transition-all ${
                      selectedCurrency === c.code 
                        ? 'border-primary bg-blue-50 text-primary ring-1 ring-primary/20' 
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">{c.code}</span>
                      <span className="text-xs opacity-80">{c.name}</span>
                    </div>
                    <span className="font-bold opacity-50">{c.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button 
              onClick={handleSave}
              className="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsModal;
