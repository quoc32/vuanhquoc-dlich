import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const SUPPORTED_CURRENCIES = [
  { code: 'AUD', name: 'Đô la Úc', symbol: 'AU$' },
  { code: 'VND', name: 'Việt Nam Đồng', symbol: '₫' },
  { code: 'JPY', name: 'Yên Nhật', symbol: '¥' },
  { code: 'USD', name: 'Đô la Mỹ', symbol: '$' }
];

const useCurrencyStore = create(
  persist(
    (set, get) => ({
      targetCurrency: 'AUD',
      rates: { AUD: 1 },
      supportedCurrencies: SUPPORTED_CURRENCIES,
      loading: false,

      fetchRates: async () => {
        try {
          set({ loading: true });
          const res = await fetch('https://api.frankfurter.dev/v2/rates?base=AUD&quotes=VND,JPY,USD');
          const data = await res.json();
          
          const ratesMap = { AUD: 1 };
          if (Array.isArray(data)) {
            data.forEach(item => {
              ratesMap[item.quote] = item.rate;
            });
          }
          set({ rates: ratesMap, loading: false });
        } catch (err) {
          console.error('Fetch rates error', err);
          set({ loading: false });
        }
      },

      setTargetCurrency: (curr) => set({ targetCurrency: curr }),

      formatPrice: (amount, baseCurrency = 'AUD') => {
        if (amount === undefined || amount === null) return '';
        const { targetCurrency, rates } = get();
        
        let finalAmount = amount;
        let finalCurrency = baseCurrency;

        if (rates[baseCurrency] && rates[targetCurrency]) {
          const amountInAUD = amount / rates[baseCurrency];
          finalAmount = amountInAUD * rates[targetCurrency];
          finalCurrency = targetCurrency;
        } else if (baseCurrency === 'AUD' && rates[targetCurrency]) {
          finalAmount = amount * rates[targetCurrency];
          finalCurrency = targetCurrency;
        }

        const fractionDigits = (finalCurrency === 'VND' || finalCurrency === 'JPY') ? 0 : 2;

        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: finalCurrency,
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits
        }).format(finalAmount);
      }
    }),
    {
      name: 'currency-storage',
      partialize: (state) => ({ targetCurrency: state.targetCurrency })
    }
  )
);

export default useCurrencyStore;
