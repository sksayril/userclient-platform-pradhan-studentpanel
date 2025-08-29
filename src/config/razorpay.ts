// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  // Test keys - Replace with your actual Razorpay keys
  KEY_ID: 'rzp_test_YOUR_TEST_KEY_ID',
  KEY_SECRET: 'YOUR_TEST_KEY_SECRET',
  
  // Production keys (uncomment when going live)
  // KEY_ID: 'rzp_live_YOUR_LIVE_KEY_ID',
  // KEY_SECRET: 'YOUR_LIVE_KEY_SECRET',
  
  // Currency
  CURRENCY: 'INR',
  
  // Company details
  COMPANY_NAME: 'Society Management System',
  COMPANY_DESCRIPTION: 'Society Management System Payment',
  
  // Theme
  THEME_COLOR: '#10B981',
  
  // API endpoints
  CREATE_ORDER_URL: 'https://psmw75hs-3500.inc1.devtunnels.ms/api/payment-requests/create-razorpay-order',
  VERIFY_PAYMENT_URL: 'https://psmw75hs-3500.inc1.devtunnels.ms/api/payment-requests/verify-razorpay-payment',
};

// Environment-based configuration
export const getRazorpayConfig = () => {
  const isProduction = import.meta.env.PROD;
  
  return {
    keyId: isProduction ? RAZORPAY_CONFIG.KEY_ID.replace('test', 'live') : RAZORPAY_CONFIG.KEY_ID,
    keySecret: isProduction ? RAZORPAY_CONFIG.KEY_SECRET : RAZORPAY_CONFIG.KEY_SECRET,
    currency: RAZORPAY_CONFIG.CURRENCY,
    companyName: RAZORPAY_CONFIG.COMPANY_NAME,
    companyDescription: RAZORPAY_CONFIG.COMPANY_DESCRIPTION,
    themeColor: RAZORPAY_CONFIG.THEME_COLOR,
    createOrderUrl: RAZORPAY_CONFIG.CREATE_ORDER_URL,
    verifyPaymentUrl: RAZORPAY_CONFIG.VERIFY_PAYMENT_URL,
  };
};
